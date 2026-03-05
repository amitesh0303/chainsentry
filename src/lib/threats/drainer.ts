import { ethers } from "ethers";
import { ERC20_ABI, safeContractCall } from "../provider";

export interface DrainerResult {
  hasMaliciousApprovals: boolean;
  unlimitedApprovals: Array<{
    spender: string;
    token: string;
    amount: string;
    risk: "HIGH" | "MEDIUM" | "LOW";
  }>;
  warnings: string[];
}

// Known malicious/suspicious contract patterns
const KNOWN_MALICIOUS_PATTERNS = [
  "transfer",
  "transferFrom",
  "approve",
  "setApprovalForAll",
];

// Maximum approval threshold (type(uint256).max - 1 ETH threshold)
const UNLIMITED_APPROVAL_THRESHOLD = ethers.MaxUint256 - ethers.parseEther("1");

export async function detectWalletDrainer(
  provider: ethers.JsonRpcProvider,
  walletAddress: string,
  contractAddress: string,
  calldata?: string
): Promise<DrainerResult> {
  const warnings: string[] = [];
  const unlimitedApprovals: DrainerResult["unlimitedApprovals"] = [];

  // Analyze calldata for approval patterns
  if (calldata && calldata.length >= 10) {
    const selector = calldata.slice(0, 10);

    // approve(address,uint256) selector
    if (selector === "0x095ea7b3") {
      const decoded = decodeApproval(calldata);
      if (decoded) {
        const { spender, amount } = decoded;
        if (amount >= UNLIMITED_APPROVAL_THRESHOLD) {
          warnings.push(
            `Unlimited ERC-20 approval to ${spender.slice(0, 10)}...`
          );
          unlimitedApprovals.push({
            spender,
            token: contractAddress,
            amount: "MAX",
            risk: await assessSpenderRisk(provider, spender),
          });
        }
      }
    }

    // setApprovalForAll(address,bool) selector  
    if (selector === "0xa22cb465") {
      warnings.push("NFT setApprovalForAll detected - gives full collection control");
      const decoded = decodeSetApprovalForAll(calldata);
      if (decoded) {
        unlimitedApprovals.push({
          spender: decoded.operator,
          token: contractAddress,
          amount: "ALL NFTs",
          risk: await assessSpenderRisk(provider, decoded.operator),
        });
      }
    }

    // transferFrom with large amount
    if (selector === "0x23b872dd") {
      const decoded = decodeTransferFrom(calldata);
      if (decoded && decoded.value > ethers.parseEther("10000")) {
        warnings.push("Large transferFrom detected");
      }
    }
  }

  // Check if contract is a known drainer pattern
  try {
    const bytecode = await provider.getCode(contractAddress);
    if (bytecode && bytecode !== "0x") {
      const drainerPatterns = detectDrainerBytecodePatterns(bytecode);
      warnings.push(...drainerPatterns);
    }
  } catch {
    // Contract read failed
  }

  const hasMaliciousApprovals =
    unlimitedApprovals.some((a) => a.risk === "HIGH") ||
    warnings.length > 0;

  return {
    hasMaliciousApprovals,
    unlimitedApprovals,
    warnings,
  };
}

function decodeApproval(
  calldata: string
): { spender: string; amount: bigint } | null {
  try {
    const iface = new ethers.Interface([
      "function approve(address spender, uint256 amount)",
    ]);
    const decoded = iface.decodeFunctionData("approve", calldata);
    return {
      spender: decoded[0] as string,
      amount: decoded[1] as bigint,
    };
  } catch {
    return null;
  }
}

function decodeSetApprovalForAll(
  calldata: string
): { operator: string; approved: boolean } | null {
  try {
    const iface = new ethers.Interface([
      "function setApprovalForAll(address operator, bool approved)",
    ]);
    const decoded = iface.decodeFunctionData("setApprovalForAll", calldata);
    return {
      operator: decoded[0] as string,
      approved: decoded[1] as boolean,
    };
  } catch {
    return null;
  }
}

function decodeTransferFrom(
  calldata: string
): { from: string; to: string; value: bigint } | null {
  try {
    const iface = new ethers.Interface([
      "function transferFrom(address from, address to, uint256 value)",
    ]);
    const decoded = iface.decodeFunctionData("transferFrom", calldata);
    return {
      from: decoded[0] as string,
      to: decoded[1] as string,
      value: decoded[2] as bigint,
    };
  } catch {
    return null;
  }
}

async function assessSpenderRisk(
  provider: ethers.JsonRpcProvider,
  spender: string
): Promise<"HIGH" | "MEDIUM" | "LOW"> {
  try {
    const bytecode = await provider.getCode(spender);
    if (!bytecode || bytecode === "0x") {
      return "HIGH"; // EOA receiving approval is suspicious
    }
    // Check if it's a known DEX router - low risk
    const KNOWN_SAFE_CONTRACTS = [
      "0x7a250d5630b4cf539739df2c5dacb4c659f2488d", // Uniswap V2 Router
      "0xe592427a0aece92de3edee1f18e0157c05861564", // Uniswap V3 Router
      "0x10ed43c718714eb63d5aa57b78b54704e256024e", // PancakeSwap Router
    ];
    if (KNOWN_SAFE_CONTRACTS.includes(spender.toLowerCase())) {
      return "LOW";
    }
    return "MEDIUM";
  } catch {
    return "MEDIUM";
  }
}

function detectDrainerBytecodePatterns(bytecode: string): string[] {
  const warnings: string[] = [];

  // Check for delegatecall patterns that could drain funds
  if (bytecode.includes("f4")) {
    // DELEGATECALL opcode
    warnings.push("Contract uses DELEGATECALL - potential proxy exploit risk");
  }

  return warnings;
}
