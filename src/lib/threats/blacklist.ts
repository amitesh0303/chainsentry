import { ethers } from "ethers";
import { ERC20_ABI, safeContractCall } from "../provider";

export interface BlacklistResult {
  isBlacklisted: boolean;
  canCheckBlacklist: boolean;
  warnings: string[];
}

export async function checkBlacklist(
  provider: ethers.JsonRpcProvider,
  tokenAddress: string,
  walletAddress: string
): Promise<BlacklistResult> {
  const warnings: string[] = [];

  const tokenContract = new ethers.Contract(
    tokenAddress,
    [
      ...ERC20_ABI,
      "function isBlacklisted(address) view returns (bool)",
      "function blacklist(address account) external",
      "function isBot(address) view returns (bool)",
      "function bots(address) view returns (bool)",
      "function blocked(address) view returns (bool)",
      "function excludedFromTransfer(address) view returns (bool)",
    ],
    provider
  );

  let isBlacklisted = false;
  let canCheckBlacklist = false;

  // Try various blacklist function names
  const blacklistChecks = [
    "isBlacklisted",
    "isBot",
    "bots",
    "blocked",
    "excludedFromTransfer",
  ];

  for (const checkFn of blacklistChecks) {
    const result = await safeContractCall<boolean>(tokenContract, checkFn, [
      walletAddress,
    ]);
    if (result !== null) {
      canCheckBlacklist = true;
      if (result === true) {
        isBlacklisted = true;
        warnings.push(
          `Wallet is blacklisted by contract (${checkFn} returned true)`
        );
        break;
      }
    }
  }

  // Check if contract has blacklist capability (even if wallet is not blacklisted)
  if (canCheckBlacklist && !isBlacklisted) {
    const bytecode = await provider.getCode(tokenAddress);
    const blacklistSelector = ethers.id("blacklist(address)").slice(2, 10);
    if (bytecode.includes(blacklistSelector)) {
      warnings.push("Contract owner can blacklist any wallet at any time");
    }
  }

  return {
    isBlacklisted,
    canCheckBlacklist,
    warnings,
  };
}
