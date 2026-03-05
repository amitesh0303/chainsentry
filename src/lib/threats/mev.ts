import { ethers } from "ethers";

export interface MEVResult {
  isMEVRisk: boolean;
  sandwichRisk: "HIGH" | "MEDIUM" | "LOW";
  frontRunRisk: "HIGH" | "MEDIUM" | "LOW";
  slippageRisk: boolean;
  warnings: string[];
}

// Common DEX router addresses that are MEV targets
const MEV_TARGET_CONTRACTS: Record<string, string> = {
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap V2 Router",
  "0xe592427a0aece92de3edee1f18e0157c05861564": "Uniswap V3 Router",
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45": "Uniswap Universal Router",
  "0x10ed43c718714eb63d5aa57b78b54704e256024e": "PancakeSwap Router",
  "0x1111111254eeb25477b68fb85ed929f73a960582": "1inch Router",
};

export async function detectMEVRisk(
  provider: ethers.JsonRpcProvider,
  contractAddress: string,
  calldata?: string,
  value?: string
): Promise<MEVResult> {
  const warnings: string[] = [];
  let sandwichRisk: MEVResult["sandwichRisk"] = "LOW";
  let frontRunRisk: MEVResult["frontRunRisk"] = "LOW";
  let slippageRisk = false;

  // Check if this is a DEX swap (MEV target)
  const isDexInteraction =
    MEV_TARGET_CONTRACTS[contractAddress.toLowerCase()] !== undefined;

  if (isDexInteraction) {
    const dexName = MEV_TARGET_CONTRACTS[contractAddress.toLowerCase()];
    warnings.push(`Interacting with ${dexName} - MEV exposure possible`);

    if (calldata && calldata.length >= 10) {
      const selector = calldata.slice(0, 10);

      // Uniswap V2 swapExactTokensForTokens - check for high slippage
      const swapSelectors = [
        "0x38ed1739", // swapExactTokensForTokens
        "0x8803dbee", // swapTokensForExactTokens
        "0x7ff36ab5", // swapExactETHForTokens
        "0x18cbafe5", // swapExactTokensForETH
        "0xfb3bdb41", // swapETHForExactTokens
      ];

      if (swapSelectors.includes(selector)) {
        const slippageAnalysis = analyzeSwapSlippage(calldata, selector);
        if (slippageAnalysis.highSlippage) {
          slippageRisk = true;
          sandwichRisk = "HIGH";
          warnings.push(
            `High slippage tolerance detected (${slippageAnalysis.slippagePercent.toFixed(1)}%) - sandwich attack vulnerable`
          );
        } else if (slippageAnalysis.moderateSlippage) {
          sandwichRisk = "MEDIUM";
          warnings.push(
            `Moderate slippage tolerance (${slippageAnalysis.slippagePercent.toFixed(1)}%) - some MEV risk`
          );
        }
      }
    }

    // Large value transactions attract MEV bots
    if (value) {
      const valueEth = parseFloat(ethers.formatEther(BigInt(value)));
      if (valueEth > 10) {
        frontRunRisk = "HIGH";
        warnings.push(
          `Large transaction value (${valueEth.toFixed(2)} ETH) - front-running risk`
        );
      } else if (valueEth > 1) {
        frontRunRisk = "MEDIUM";
        warnings.push(
          `Transaction value ${valueEth.toFixed(2)} ETH - moderate front-run risk`
        );
      }
    }
  }

  // Check for non-atomic multi-step transactions
  if (calldata && calldata.includes("multicall")) {
    warnings.push(
      "Multicall pattern detected - atomic execution required to prevent MEV"
    );
  }

  const isMEVRisk =
    sandwichRisk === "HIGH" ||
    frontRunRisk === "HIGH" ||
    slippageRisk;

  return {
    isMEVRisk,
    sandwichRisk,
    frontRunRisk,
    slippageRisk,
    warnings,
  };
}

function analyzeSwapSlippage(
  calldata: string,
  selector: string
): {
  highSlippage: boolean;
  moderateSlippage: boolean;
  slippagePercent: number;
} {
  try {
    // For swapExactTokensForTokens(amountIn, amountOutMin, path, to, deadline)
    if (selector === "0x38ed1739") {
      const iface = new ethers.Interface([
        "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline)",
      ]);
      const decoded = iface.decodeFunctionData(
        "swapExactTokensForTokens",
        calldata
      );
      const amountIn = decoded[0] as bigint;
      const amountOutMin = decoded[1] as bigint;

      if (amountIn > 0n && amountOutMin === 0n) {
        return { highSlippage: true, moderateSlippage: false, slippagePercent: 100 };
      }

      // Calculate slippage percentage based on ratio (simplified)
      const ratio = Number(amountOutMin) / Number(amountIn);
      const slippagePercent = Math.max(0, (1 - ratio) * 100);

      return {
        highSlippage: slippagePercent > 10,
        moderateSlippage: slippagePercent > 2 && slippagePercent <= 10,
        slippagePercent,
      };
    }
  } catch {
    // Decoding failed
  }

  return { highSlippage: false, moderateSlippage: false, slippagePercent: 0 };
}
