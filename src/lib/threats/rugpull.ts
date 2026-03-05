import { ethers } from "ethers";
import {
  ERC20_ABI,
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_PAIR_ABI,
  safeContractCall,
  getContractBytecode,
} from "../provider";
import { getChainConfig } from "../chains";

export interface RugPullResult {
  isHighRisk: boolean;
  hasOwner: boolean;
  ownerAddress: string | null;
  isOwnershipRenounced: boolean;
  hasMintFunction: boolean;
  hasBurnFunction: boolean;
  lpLocked: boolean;
  lpLockPercentage: number;
  ownerTokenPercentage: number;
  top10HolderPercentage: number;
  warnings: string[];
}

export async function detectRugPull(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string,
  chainId: string
): Promise<RugPullResult> {
  const warnings: string[] = [];
  const chainConfig = getChainConfig(chainId);

  const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const bytecode = await getContractBytecode(provider, tokenAddress);

  // Check ownership
  const ownerAddress = await safeContractCall<string>(tokenContract, "owner");
  const hasOwner = ownerAddress !== null;
  const isOwnershipRenounced =
    !hasOwner ||
    ownerAddress === ethers.ZeroAddress ||
    ownerAddress === "0x000000000000000000000000000000000000dEaD";

  if (!isOwnershipRenounced && ownerAddress) {
    warnings.push(`Owner not renounced: ${ownerAddress.slice(0, 10)}...`);
  }

  // Check for mint function in bytecode
  const mintSelector = ethers.id("mint(address,uint256)").slice(2, 10);
  const mintSelector2 = ethers.id("mint(uint256)").slice(2, 10);
  const hasMintFunction =
    bytecode.includes(mintSelector) || bytecode.includes(mintSelector2);

  if (hasMintFunction && !isOwnershipRenounced) {
    warnings.push("Owner has unrestricted mint permissions");
  } else if (hasMintFunction) {
    warnings.push("Contract has mint function (ownership renounced)");
  }

  // Check for burn function
  const burnSelector = ethers.id("burn(address,uint256)").slice(2, 10);
  const burnSelector2 = ethers.id("burn(uint256)").slice(2, 10);
  const hasBurnFunction =
    bytecode.includes(burnSelector) || bytecode.includes(burnSelector2);

  // Check LP token lock status
  let lpLocked = false;
  let lpLockPercentage = 0;
  let ownerTokenPercentage = 0;

  try {
    const totalSupply = await safeContractCall<bigint>(
      tokenContract,
      "totalSupply"
    );

    if (totalSupply && totalSupply > 0n) {
      // Check owner token balance
      if (ownerAddress && ownerAddress !== ethers.ZeroAddress) {
        const ownerBalance = await safeContractCall<bigint>(
          tokenContract,
          "balanceOf",
          [ownerAddress]
        );
        if (ownerBalance) {
          ownerTokenPercentage = Number(
            (ownerBalance * 10000n) / totalSupply
          ) / 100;
          if (ownerTokenPercentage > 20) {
            warnings.push(
              `Owner holds ${ownerTokenPercentage.toFixed(1)}% of supply`
            );
          }
        }
      }

      // Check LP lock by examining LP pair locked in known lockers
      if (chainConfig?.uniswapV2FactoryAddress) {
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
          const lpTotalSupply = await safeContractCall<bigint>(
            pairContract,
            "totalSupply"
          );

          if (lpTotalSupply && lpTotalSupply > 0n) {
            // Check known locker addresses
            const KNOWN_LOCKERS = [
              "0xdD6Ea849db5A3b5CC1dFe8e4f7f59a9AfEbBD73C", // Unicrypt
              "0x663A5C229c09b049E36dBc703a68535a8c9b5D55", // DXLock
              "0x407993575c91ce7643a4d4cCACc9A98c36eE1BBE", // PinkLock
            ];

            let lockedLpAmount = 0n;
            for (const locker of KNOWN_LOCKERS) {
              const lockedBalance = await safeContractCall<bigint>(
                pairContract,
                "balanceOf",
                [locker]
              );
              if (lockedBalance) {
                lockedLpAmount += lockedBalance;
              }
            }

            if (lpTotalSupply > 0n) {
              lpLockPercentage =
                Number((lockedLpAmount * 10000n) / lpTotalSupply) / 100;
              lpLocked = lpLockPercentage > 50;
            }

            if (!lpLocked) {
              warnings.push(
                `Only ${lpLockPercentage.toFixed(1)}% of LP tokens are locked`
              );
            }
          }
        } else {
          warnings.push("No liquidity pool found");
        }
      }
    }
  } catch {
    warnings.push("Could not analyze supply distribution");
  }

  // Check for large unlocked supply using proxy pattern detection
  const hasProxyPattern = detectProxyPattern(bytecode);
  if (hasProxyPattern) {
    warnings.push("Contract uses upgradeable proxy pattern");
  }

  const isHighRisk =
    warnings.length >= 3 ||
    (!isOwnershipRenounced && hasMintFunction) ||
    ownerTokenPercentage > 50;

  return {
    isHighRisk,
    hasOwner,
    ownerAddress: ownerAddress || null,
    isOwnershipRenounced,
    hasMintFunction,
    hasBurnFunction,
    lpLocked,
    lpLockPercentage,
    ownerTokenPercentage,
    top10HolderPercentage: 0, // Would require event log scanning
    warnings,
  };
}

function detectProxyPattern(bytecode: string): boolean {
  // EIP-1967 proxy slot
  const proxySlot =
    "360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc";
  return bytecode.includes(proxySlot);
}
