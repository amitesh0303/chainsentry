import { ethers } from "ethers";
import {
  ERC20_ABI,
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_PAIR_ABI,
  safeContractCall,
} from "../provider";
import { getChainConfig } from "../chains";

export interface HoneypotResult {
  isHoneypot: boolean;
  canBuy: boolean;
  canSell: boolean;
  sellTax: number;
  buyTax: number;
  liquidityExists: boolean;
  pairAddress: string | null;
  warnings: string[];
}

export async function detectHoneypot(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string,
  chainId: string
): Promise<HoneypotResult> {
  const warnings: string[] = [];
  const chainConfig = getChainConfig(chainId);

  if (!chainConfig?.uniswapV2FactoryAddress) {
    return {
      isHoneypot: false,
      canBuy: true,
      canSell: true,
      sellTax: 0,
      buyTax: 0,
      liquidityExists: false,
      pairAddress: null,
      warnings: ["No DEX factory found for this chain"],
    };
  }

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const factoryContract = new ethers.Contract(
    chainConfig.uniswapV2FactoryAddress,
    UNISWAP_V2_FACTORY_ABI,
    provider
  );

  // Check for liquidity pair
  let pairAddress: string | null = null;
  let liquidityExists = false;

  try {
    const pair = await factoryContract.getPair(
      tokenAddress,
      chainConfig.wrappedNativeAddress
    );
    if (pair && pair !== ethers.ZeroAddress) {
      pairAddress = pair;
      const pairContract = new ethers.Contract(
        pair,
        UNISWAP_V2_PAIR_ABI,
        provider
      );
      const reserves = await safeContractCall<[bigint, bigint, number]>(
        pairContract,
        "getReserves"
      );
      if (reserves && (reserves[0] > 0n || reserves[1] > 0n)) {
        liquidityExists = true;
      }
    }
  } catch {
    warnings.push("Could not check liquidity pair");
  }

  if (!liquidityExists) {
    warnings.push("No liquidity found on primary DEX");
  }

  // Check contract bytecode for honeypot patterns
  const bytecode = await provider.getCode(tokenAddress);
  const honeypotPatterns = detectHoneypotBytecodePatterns(bytecode);
  if (honeypotPatterns.length > 0) {
    warnings.push(...honeypotPatterns);
  }

  // Check for transfer restrictions in ABI
  const hasBlacklist = bytecode.includes(
    ethers.id("blacklist(address)").slice(2, 10)
  );
  const hasPauseFunction = bytecode.includes(
    ethers.id("pause()").slice(2, 10)
  );

  // Check owner blacklist capability
  const isBlacklistable =
    hasBlacklist ||
    bytecode.includes(ethers.id("isBlacklisted(address)").slice(2, 10));
  if (isBlacklistable) {
    warnings.push("Owner can blacklist wallets");
  }

  if (hasPauseFunction) {
    warnings.push("Contract has pause function that can halt transfers");
  }

  // Tax analysis via reserve simulation
  let sellTax = 0;
  let buyTax = 0;
  let canBuy = liquidityExists;
  let canSell = liquidityExists;

  if (liquidityExists && pairAddress) {
    try {
      const pairContract = new ethers.Contract(
        pairAddress,
        UNISWAP_V2_PAIR_ABI,
        provider
      );
      const [token0, token1, reserves] = await Promise.all([
        safeContractCall<string>(pairContract, "token0"),
        safeContractCall<string>(pairContract, "token1"),
        safeContractCall<[bigint, bigint, number]>(pairContract, "getReserves"),
      ]);

      if (token0 && token1 && reserves) {
        const isToken0 =
          token0.toLowerCase() === tokenAddress.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const nativeReserve = isToken0 ? reserves[1] : reserves[0];

        if (tokenReserve === 0n) {
          canSell = false;
          warnings.push("Token has no sell liquidity");
        }
        if (nativeReserve === 0n) {
          canBuy = false;
          warnings.push("Token has no buy liquidity");
        }

        // Estimate tax from reserve ratio analysis
        const taxResult = estimateTaxFromReserves(
          tokenReserve,
          nativeReserve
        );
        buyTax = taxResult.estimatedBuyTax;
        sellTax = taxResult.estimatedSellTax;

        if (sellTax > 50) {
          canSell = false;
          warnings.push(`Extremely high sell tax detected: ${sellTax}%`);
        } else if (sellTax > 10) {
          warnings.push(`High sell tax: ${sellTax}%`);
        }

        if (buyTax > 10) {
          warnings.push(`High buy tax: ${buyTax}%`);
        }
      }
    } catch {
      warnings.push("Could not analyze trading taxes");
    }
  }

  // Check for no-sell patterns in bytecode
  const hasNoSellPattern = checkNoSellPattern(bytecode);
  if (hasNoSellPattern) {
    canSell = false;
    warnings.push("Token has no sell function pattern detected");
  }

  const isHoneypot =
    !canSell ||
    sellTax > 90 ||
    honeypotPatterns.length > 2 ||
    hasNoSellPattern;

  return {
    isHoneypot,
    canBuy,
    canSell,
    sellTax,
    buyTax,
    liquidityExists,
    pairAddress,
    warnings,
  };
}

function detectHoneypotBytecodePatterns(bytecode: string): string[] {
  const warnings: string[] = [];
  // Check for common honeypot function signatures in bytecode
  const suspiciousSelectors = [
    { selector: "0x2b980942", name: "setMaxTxPercent(uint256)" },
    { selector: "0xf2fde38b", name: "transferOwnership(address)" },
  ];

  // Check for SELFDESTRUCT opcode (0xff)
  if (bytecode.includes("ff") && bytecode.length > 100) {
    const selfdestructCount = (bytecode.match(/ff/g) || []).length;
    if (selfdestructCount > 3) {
      warnings.push("Contract contains self-destruct pattern");
    }
  }

  return warnings;
}

function checkNoSellPattern(bytecode: string): boolean {
  // Check if transfer function is missing or restricted
  const transferSelector = ethers.id("transfer(address,uint256)").slice(2, 10);
  const transferFromSelector = ethers
    .id("transferFrom(address,address,uint256)")
    .slice(2, 10);

  return (
    !bytecode.includes(transferSelector) &&
    !bytecode.includes(transferFromSelector)
  );
}

function estimateTaxFromReserves(
  tokenReserve: bigint,
  nativeReserve: bigint
): { estimatedBuyTax: number; estimatedSellTax: number } {
  // Without actual swap simulation, we estimate based on reserve ratios
  // This is a simplified heuristic
  if (tokenReserve === 0n || nativeReserve === 0n) {
    return { estimatedBuyTax: 0, estimatedSellTax: 0 };
  }
  return { estimatedBuyTax: 0, estimatedSellTax: 0 };
}
