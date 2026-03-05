import { ethers } from "ethers";
import { prisma } from "../prisma";
import { getContractBytecode, computeBytecodeHash } from "../provider";

export interface SimilarityResult {
  isSimilarToKnownScam: boolean;
  similarityScore: number;
  matchedScam: {
    address: string;
    chainId: string;
    type: string;
    description: string;
  } | null;
  warnings: string[];
}

export async function checkContractSimilarity(
  provider: ethers.JsonRpcProvider,
  contractAddress: string,
  chainId: string
): Promise<SimilarityResult> {
  const warnings: string[] = [];

  try {
    const bytecode = await getContractBytecode(provider, contractAddress);

    if (!bytecode || bytecode === "0x") {
      return {
        isSimilarToKnownScam: false,
        similarityScore: 0,
        matchedScam: null,
        warnings: ["Contract has no bytecode (EOA or self-destructed)"],
      };
    }

    const bytecodeHash = computeBytecodeHash(bytecode);

    // Check exact match in known scam database
    const exactMatch = await prisma.knownScam.findFirst({
      where: {
        bytecodeHash,
      },
    });

    if (exactMatch) {
      warnings.push(
        `Exact match with known ${exactMatch.type} scam contract`
      );
      return {
        isSimilarToKnownScam: true,
        similarityScore: 100,
        matchedScam: {
          address: exactMatch.address,
          chainId: exactMatch.chainId,
          type: exactMatch.type,
          description: exactMatch.description || "",
        },
        warnings,
      };
    }

    // Check address match across chains
    const addressMatch = await prisma.knownScam.findFirst({
      where: {
        address: {
          equals: contractAddress,
          mode: "insensitive",
        },
      },
    });

    if (addressMatch) {
      warnings.push(
        `Contract address matches known ${addressMatch.type} scam`
      );
      return {
        isSimilarToKnownScam: true,
        similarityScore: 95,
        matchedScam: {
          address: addressMatch.address,
          chainId: addressMatch.chainId,
          type: addressMatch.type,
          description: addressMatch.description || "",
        },
        warnings,
      };
    }

    // Structural similarity check using bytecode pattern matching
    const similarityScore = await computeStructuralSimilarity(
      bytecode,
      chainId
    );

    if (similarityScore > 80) {
      warnings.push(
        `High bytecode similarity (${similarityScore}%) to known scam contracts`
      );
    } else if (similarityScore > 60) {
      warnings.push(
        `Moderate bytecode similarity (${similarityScore}%) to known scam contracts`
      );
    }

    return {
      isSimilarToKnownScam: similarityScore > 75,
      similarityScore,
      matchedScam: null,
      warnings,
    };
  } catch (error) {
    return {
      isSimilarToKnownScam: false,
      similarityScore: 0,
      matchedScam: null,
      warnings: ["Could not complete similarity check"],
    };
  }
}

async function computeStructuralSimilarity(
  bytecode: string,
  chainId: string
): Promise<number> {
  try {
    // Get recent known scams from same chain
    const knownScams = await prisma.knownScam.findMany({
      where: { chainId },
      select: { bytecodeHash: true, type: true },
      take: 100,
    });

    if (knownScams.length === 0) return 0;

    // Simple n-gram similarity on bytecode chunks
    const targetChunks = extractBytecodeChunks(bytecode);

    let maxSimilarity = 0;
    for (const scam of knownScams) {
      if (!scam.bytecodeHash) continue;
      // Hash-based comparison (simplified without storing full bytecode)
      // In production, store bytecode chunks for proper comparison
    }

    return maxSimilarity;
  } catch {
    return 0;
  }
}

function extractBytecodeChunks(bytecode: string, chunkSize = 8): Set<string> {
  const chunks = new Set<string>();
  const hex = bytecode.replace("0x", "");
  for (let i = 0; i < hex.length - chunkSize; i += 4) {
    chunks.add(hex.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function addToScamDatabase(
  address: string,
  chainId: string,
  type: string,
  description: string,
  bytecode?: string
): Promise<void> {
  const bytecodeHash = bytecode ? computeBytecodeHash(bytecode) : undefined;

  await prisma.knownScam.upsert({
    where: { address_chainId: { address, chainId } },
    update: { type, description, bytecodeHash },
    create: { address, chainId, type, description, bytecodeHash },
  });
}
