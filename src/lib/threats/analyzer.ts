import { ethers } from "ethers";
import { getProvider } from "../provider";
import { getChainConfig } from "../chains";
import { detectHoneypot } from "./honeypot";
import { detectRugPull } from "./rugpull";
import { detectWalletDrainer } from "./drainer";
import { detectMEVRisk } from "./mev";
import { analyzeTax } from "./tax";
import { checkBlacklist } from "./blacklist";
import { checkContractSimilarity } from "./similarity";
import { getCached, setCache } from "../redis";

export type Verdict = "SAFE" | "CAUTION" | "BLOCKED";

export interface AnalysisResult {
  verdict: Verdict;
  risk_score: number;
  chain: string;
  contract: string;
  threats: string[];
  warnings: string[];
  details: {
    honeypot?: ReturnType<typeof detectHoneypot> extends Promise<infer T>
      ? T
      : never;
    rugPull?: ReturnType<typeof detectRugPull> extends Promise<infer T>
      ? T
      : never;
    tax?: ReturnType<typeof analyzeTax> extends Promise<infer T> ? T : never;
    mev?: ReturnType<typeof detectMEVRisk> extends Promise<infer T>
      ? T
      : never;
    similarity?: ReturnType<typeof checkContractSimilarity> extends Promise<
      infer T
    >
      ? T
      : never;
    tokenInfo?: {
      name: string | null;
      symbol: string | null;
      decimals: number | null;
      totalSupply: string | null;
      ownerAddress: string | null;
    };
  };
  latency_ms: number;
  cached: boolean;
}

export interface CheckTransactionInput {
  chainId: string;
  contractAddress: string;
  walletAddress?: string;
  calldata?: string;
  value?: string;
}

export async function analyzeTransaction(
  input: CheckTransactionInput
): Promise<AnalysisResult> {
  const startTime = Date.now();

  const cacheKey = `analysis:${input.chainId}:${input.contractAddress}:${
    input.walletAddress || "noWallet"
  }:${input.calldata?.slice(0, 20) || "noCalldata"}`;

  // Check cache first
  const cached = await getCached<AnalysisResult>(cacheKey);
  if (cached) {
    return {
      ...cached,
      latency_ms: Date.now() - startTime,
      cached: true,
    };
  }

  const chainConfig = getChainConfig(input.chainId);
  if (!chainConfig) {
    throw new Error(`Unsupported chain ID: ${input.chainId}`);
  }

  let provider: ethers.JsonRpcProvider;
  try {
    provider = getProvider(input.chainId);
  } catch {
    throw new Error(`Failed to connect to chain ${input.chainId}`);
  }

  const threats: string[] = [];
  const allWarnings: string[] = [];
  let riskScore = 0;
  const details: AnalysisResult["details"] = {};

  // Run all analyses in parallel
  const [
    honeypotResult,
    rugPullResult,
    taxResult,
    similarityResult,
  ] = await Promise.allSettled([
    detectHoneypot(provider, input.contractAddress, input.chainId),
    detectRugPull(provider, input.contractAddress, input.chainId),
    analyzeTax(provider, input.contractAddress, input.chainId),
    checkContractSimilarity(provider, input.contractAddress, input.chainId),
  ]);

  // Process honeypot
  if (honeypotResult.status === "fulfilled") {
    details.honeypot = honeypotResult.value;
    allWarnings.push(...honeypotResult.value.warnings);
    if (honeypotResult.value.isHoneypot) {
      threats.push("HONEYPOT");
      riskScore += 60;
    } else if (!honeypotResult.value.canSell) {
      threats.push("SELL_DISABLED");
      riskScore += 50;
    }
    if (honeypotResult.value.sellTax > 50) {
      threats.push("EXTREME_TAX");
      riskScore += 30;
    }
  }

  // Process rug pull
  if (rugPullResult.status === "fulfilled") {
    details.rugPull = rugPullResult.value;
    allWarnings.push(...rugPullResult.value.warnings);
    if (rugPullResult.value.isHighRisk) {
      threats.push("RUG_PULL_RISK");
      riskScore += 40;
    }
    if (!rugPullResult.value.isOwnershipRenounced && rugPullResult.value.hasMintFunction) {
      threats.push("UNLIMITED_MINT");
      riskScore += 35;
    }
    if (!rugPullResult.value.lpLocked) {
      riskScore += 15;
    }
  }

  // Process tax
  if (taxResult.status === "fulfilled") {
    details.tax = taxResult.value;
    allWarnings.push(...taxResult.value.warnings);
    if (taxResult.value.isHighTax) {
      threats.push("HIGH_TAX");
      riskScore += 20;
    }
    if (taxResult.value.sellTax > taxResult.value.buyTax + 20) {
      threats.push("TAX_MANIPULATION");
      riskScore += 25;
    }
  }

  // Process similarity
  if (similarityResult.status === "fulfilled") {
    details.similarity = similarityResult.value;
    allWarnings.push(...similarityResult.value.warnings);
    if (similarityResult.value.isSimilarToKnownScam) {
      threats.push("KNOWN_SCAM_PATTERN");
      riskScore += 50;
    }
  }

  // Run wallet-specific checks if wallet provided
  if (input.walletAddress) {
    const [blacklistResult, drainerResult] = await Promise.allSettled([
      checkBlacklist(provider, input.contractAddress, input.walletAddress),
      detectWalletDrainer(
        provider,
        input.walletAddress,
        input.contractAddress,
        input.calldata
      ),
    ]);

    if (blacklistResult.status === "fulfilled") {
      allWarnings.push(...blacklistResult.value.warnings);
      if (blacklistResult.value.isBlacklisted) {
        threats.push("WALLET_BLACKLISTED");
        riskScore += 80;
      }
    }

    if (drainerResult.status === "fulfilled") {
      allWarnings.push(...drainerResult.value.warnings);
      if (drainerResult.value.hasMaliciousApprovals) {
        threats.push("MALICIOUS_APPROVAL");
        riskScore += 70;
      }
    }
  }

  // MEV check if calldata provided
  if (input.calldata || input.value) {
    const mevResult = await detectMEVRisk(
      provider,
      input.contractAddress,
      input.calldata,
      input.value
    ).catch(() => null);

    if (mevResult) {
      details.mev = mevResult;
      allWarnings.push(...mevResult.warnings);
      if (mevResult.isMEVRisk) {
        threats.push("MEV_RISK");
        riskScore += 15;
      }
    }
  }

  // Get token info
  try {
    const tokenAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)",
      "function owner() view returns (address)",
    ];
    const tokenContract = new ethers.Contract(
      input.contractAddress,
      tokenAbi,
      provider
    );
    const [name, symbol, decimals, totalSupply, ownerAddr] =
      await Promise.allSettled([
        tokenContract.name(),
        tokenContract.symbol(),
        tokenContract.decimals(),
        tokenContract.totalSupply(),
        tokenContract.owner(),
      ]);

    details.tokenInfo = {
      name:
        name.status === "fulfilled" ? (name.value as string) : null,
      symbol:
        symbol.status === "fulfilled" ? (symbol.value as string) : null,
      decimals:
        decimals.status === "fulfilled" ? Number(decimals.value) : null,
      totalSupply:
        totalSupply.status === "fulfilled"
          ? (totalSupply.value as bigint).toString()
          : null,
      ownerAddress:
        ownerAddr.status === "fulfilled"
          ? (ownerAddr.value as string)
          : null,
    };
  } catch {
    // Token info unavailable
  }

  // Cap risk score at 100
  riskScore = Math.min(100, riskScore);

  // Determine verdict
  let verdict: Verdict = "SAFE";
  if (riskScore >= 70 || threats.includes("HONEYPOT") || threats.includes("WALLET_BLACKLISTED") || threats.includes("MALICIOUS_APPROVAL")) {
    verdict = "BLOCKED";
  } else if (riskScore >= 30 || threats.length > 0) {
    verdict = "CAUTION";
  }

  // Deduplicate warnings
  const uniqueWarnings = [...new Set(allWarnings)];
  const uniqueThreats = [...new Set(threats)];

  const result: AnalysisResult = {
    verdict,
    risk_score: riskScore,
    chain: chainConfig.shortName,
    contract: input.contractAddress,
    threats: uniqueThreats,
    warnings: uniqueWarnings,
    details,
    latency_ms: Date.now() - startTime,
    cached: false,
  };

  // Cache for 60 seconds
  await setCache(cacheKey, result, 60);

  return result;
}

export async function analyzeToken(
  chainId: string,
  contractAddress: string
): Promise<{
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  totalSupply: string | null;
  ownerAddress: string | null;
  isOwnershipRenounced: boolean;
  hasMintFunction: boolean;
  taxes: { buyTax: number; sellTax: number };
  lpLocked: boolean;
  lpLockPercentage: number;
  similarityScore: number;
  riskFactors: string[];
  verdict: Verdict;
  risk_score: number;
}> {
  const cacheKey = `token:${chainId}:${contractAddress}`;
  const cached = await getCached<ReturnType<typeof analyzeToken> extends Promise<infer T> ? T : never>(cacheKey);
  if (cached) return cached;

  const provider = getProvider(chainId);

  const [rugPullResult, taxResult, similarityResult, honeypotResult] =
    await Promise.allSettled([
      detectRugPull(provider, contractAddress, chainId),
      analyzeTax(provider, contractAddress, chainId),
      checkContractSimilarity(provider, contractAddress, chainId),
      detectHoneypot(provider, contractAddress, chainId),
    ]);

  const tokenAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)",
    "function owner() view returns (address)",
  ];

  let name = null,
    symbol = null,
    decimals = null,
    totalSupply = null,
    ownerAddress = null;

  try {
    const tokenContract = new ethers.Contract(
      contractAddress,
      tokenAbi,
      provider
    );
    const results = await Promise.allSettled([
      tokenContract.name(),
      tokenContract.symbol(),
      tokenContract.decimals(),
      tokenContract.totalSupply(),
      tokenContract.owner(),
    ]);
    name = results[0].status === "fulfilled" ? (results[0].value as string) : null;
    symbol = results[1].status === "fulfilled" ? (results[1].value as string) : null;
    decimals = results[2].status === "fulfilled" ? Number(results[2].value) : null;
    totalSupply = results[3].status === "fulfilled" ? (results[3].value as bigint).toString() : null;
    ownerAddress = results[4].status === "fulfilled" ? (results[4].value as string) : null;
  } catch {
    // Token info unavailable
  }

  const rp = rugPullResult.status === "fulfilled" ? rugPullResult.value : null;
  const tax = taxResult.status === "fulfilled" ? taxResult.value : null;
  const sim = similarityResult.status === "fulfilled" ? similarityResult.value : null;
  const hp = honeypotResult.status === "fulfilled" ? honeypotResult.value : null;

  const riskFactors: string[] = [];
  let riskScore = 0;

  if (hp?.isHoneypot) { riskFactors.push("HONEYPOT"); riskScore += 60; }
  if (rp?.isHighRisk) { riskFactors.push("RUG_PULL_RISK"); riskScore += 40; }
  if (!rp?.isOwnershipRenounced && rp?.hasMintFunction) { riskFactors.push("UNLIMITED_MINT"); riskScore += 35; }
  if (tax?.isHighTax) { riskFactors.push("HIGH_TAX"); riskScore += 20; }
  if (sim?.isSimilarToKnownScam) { riskFactors.push("KNOWN_SCAM_PATTERN"); riskScore += 50; }

  riskScore = Math.min(100, riskScore);

  let verdict: Verdict = "SAFE";
  if (riskScore >= 70) verdict = "BLOCKED";
  else if (riskScore >= 30) verdict = "CAUTION";

  const result = {
    name,
    symbol,
    decimals,
    totalSupply,
    ownerAddress: ownerAddress || rp?.ownerAddress || null,
    isOwnershipRenounced: rp?.isOwnershipRenounced ?? false,
    hasMintFunction: rp?.hasMintFunction ?? false,
    taxes: {
      buyTax: tax?.buyTax ?? 0,
      sellTax: tax?.sellTax ?? 0,
    },
    lpLocked: rp?.lpLocked ?? false,
    lpLockPercentage: rp?.lpLockPercentage ?? 0,
    similarityScore: sim?.similarityScore ?? 0,
    riskFactors,
    verdict,
    risk_score: riskScore,
  };

  await setCache(cacheKey, result, 120);
  return result;
}
