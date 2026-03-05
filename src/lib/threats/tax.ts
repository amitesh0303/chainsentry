import { ethers } from "ethers";
import {
  ERC20_ABI,
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_PAIR_ABI,
  safeContractCall,
} from "../provider";
import { getChainConfig } from "../chains";

export interface TaxResult {
  buyTax: number;
  sellTax: number;
  transferTax: number;
  isHighTax: boolean;
  warnings: string[];
}

export async function analyzeTax(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string,
  chainId: string
): Promise<TaxResult> {
  const warnings: string[] = [];
  let buyTax = 0;
  let sellTax = 0;
  let transferTax = 0;

  const chainConfig = getChainConfig(chainId);

  if (!chainConfig?.uniswapV2FactoryAddress) {
    return {
      buyTax: 0,
      sellTax: 0,
      transferTax: 0,
      isHighTax: false,
      warnings: ["Tax analysis not available for this chain"],
    };
  }

  try {
    const bytecode = await provider.getCode(tokenAddress);

    // Detect tax-related function signatures in bytecode
    const taxFunctionSelectors = [
      ethers.id("setTaxFees(uint256,uint256)").slice(2, 10),
      ethers.id("setBuyFee(uint256)").slice(2, 10),
      ethers.id("setSellFee(uint256)").slice(2, 10),
      ethers.id("setFees(uint256,uint256,uint256)").slice(2, 10),
      ethers.id("updateFees(uint256,uint256)").slice(2, 10),
    ];

    const hasTaxFunctions = taxFunctionSelectors.some((sel) =>
      bytecode.includes(sel)
    );

    if (hasTaxFunctions) {
      warnings.push("Contract has adjustable fee functions");
    }

    // Try to read tax values from common storage slots
    const tokenContract = new ethers.Contract(
      tokenAddress,
      [
        ...ERC20_ABI,
        "function buyFee() view returns (uint256)",
        "function sellFee() view returns (uint256)",
        "function _buyTax() view returns (uint256)",
        "function _sellTax() view returns (uint256)",
        "function buyTax() view returns (uint256)",
        "function sellTax() view returns (uint256)",
        "function taxFee() view returns (uint256)",
        "function liquidityFee() view returns (uint256)",
        "function totalFees() view returns (uint256)",
      ],
      provider
    );

    // Try various common tax variable names
    const buyTaxRaw =
      (await safeContractCall<bigint>(tokenContract, "buyTax")) ??
      (await safeContractCall<bigint>(tokenContract, "buyFee")) ??
      (await safeContractCall<bigint>(tokenContract, "_buyTax"));

    const sellTaxRaw =
      (await safeContractCall<bigint>(tokenContract, "sellTax")) ??
      (await safeContractCall<bigint>(tokenContract, "sellFee")) ??
      (await safeContractCall<bigint>(tokenContract, "_sellTax"));

    const taxFeeRaw = await safeContractCall<bigint>(tokenContract, "taxFee");

    if (buyTaxRaw !== null) {
      buyTax = normalizeTaxValue(buyTaxRaw);
    }
    if (sellTaxRaw !== null) {
      sellTax = normalizeTaxValue(sellTaxRaw);
    }
    if (taxFeeRaw !== null && buyTax === 0) {
      buyTax = normalizeTaxValue(taxFeeRaw);
      transferTax = normalizeTaxValue(taxFeeRaw);
    }

    // Analyze LP pair for tax estimation via reserve analysis
    const factoryContract = new ethers.Contract(
      chainConfig.uniswapV2FactoryAddress,
      UNISWAP_V2_FACTORY_ABI,
      provider
    );

    const pairAddress = await safeContractCall<string>(
      factoryContract,
      "getPair",
      [tokenAddress, chainConfig.wrappedNativeAddress]
    );

    if (pairAddress && pairAddress !== ethers.ZeroAddress) {
      const pairContract = new ethers.Contract(
        pairAddress,
        UNISWAP_V2_PAIR_ABI,
        provider
      );

      const [token0Addr, reserves] = await Promise.all([
        safeContractCall<string>(pairContract, "token0"),
        safeContractCall<[bigint, bigint, number]>(
          pairContract,
          "getReserves"
        ),
      ]);

      if (token0Addr && reserves) {
        const isToken0 =
          token0Addr.toLowerCase() === tokenAddress.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const nativeReserve = isToken0 ? reserves[1] : reserves[0];

        if (tokenReserve > 0n && nativeReserve > 0n) {
          warnings.push("Liquidity pool found - trading enabled");
        }
      }
    }
  } catch {
    warnings.push("Could not complete full tax analysis");
  }

  if (buyTax > 10) {
    warnings.push(`Buy tax: ${buyTax}%`);
  }
  if (sellTax > 10) {
    warnings.push(`Sell tax: ${sellTax}%`);
  }
  if (sellTax > buyTax + 5) {
    warnings.push(
      `Sell tax (${sellTax}%) significantly higher than buy tax (${buyTax}%)`
    );
  }

  const isHighTax = buyTax > 10 || sellTax > 10;

  return {
    buyTax,
    sellTax,
    transferTax,
    isHighTax,
    warnings,
  };
}

function normalizeTaxValue(rawValue: bigint): number {
  const value = Number(rawValue);
  // Handle different precision formats
  if (value > 1000) return value / 100; // Stored as basis points (10000 = 100%)
  if (value > 100) return value / 10; // Stored as tenths of percent
  return value; // Stored as percentage
}
