import { randomBytes, createHash } from "crypto";
import { prisma } from "./prisma";
import { Plan } from "@prisma/client";

export const PLAN_LIMITS: Record<Plan, { requestsPerDay: number; features: string[] }> = {
  FREE: {
    requestsPerDay: 50,
    features: ["all_checks", "6_chains", "community_support"],
  },
  PRO: {
    requestsPerDay: 10000,
    features: [
      "all_checks",
      "6_chains",
      "webhook_alerts",
      "contract_similarity",
      "priority_support",
    ],
  },
  SCALE: {
    requestsPerDay: 50000,
    features: [
      "all_checks",
      "6_chains",
      "webhook_alerts",
      "contract_similarity",
      "websocket_feed",
      "custom_rules",
      "sla",
      "priority_support",
    ],
  },
  BUILDER: {
    requestsPerDay: -1, // unlimited
    features: [
      "all_checks",
      "6_chains",
      "webhook_alerts",
      "contract_similarity",
      "websocket_feed",
      "custom_rules",
      "dedicated_infra",
      "white_label",
    ],
  },
  ENTERPRISE: {
    requestsPerDay: -1, // unlimited
    features: [
      "all_checks",
      "6_chains",
      "webhook_alerts",
      "contract_similarity",
      "websocket_feed",
      "custom_rules",
      "dedicated_infra",
      "white_label",
      "custom_integrations",
      "dedicated_support",
    ],
  },
};

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const randomPart = randomBytes(32).toString("hex");
  const key = `csk_${randomPart}`;
  const prefix = key.slice(0, 12);
  const hash = hashApiKey(key);
  return { key, prefix, hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export async function validateApiKey(rawKey: string): Promise<{
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
  plan?: Plan;
  error?: string;
}> {
  if (!rawKey || !rawKey.startsWith("csk_")) {
    return { valid: false, error: "Invalid API key format" };
  }

  const hash = hashApiKey(rawKey);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash: hash },
    include: {
      user: {
        select: {
          id: true,
          plan: true,
          stripeCurrentPeriodEnd: true,
          trialEndsAt: true,
        },
      },
    },
  });

  if (!apiKey) {
    return { valid: false, error: "API key not found" };
  }

  if (!apiKey.isActive || apiKey.revokedAt) {
    return { valid: false, error: "API key has been revoked" };
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return {
    valid: true,
    userId: apiKey.userId,
    apiKeyId: apiKey.id,
    plan: apiKey.user.plan,
  };
}

export async function checkRateLimit(
  userId: string,
  plan: Plan
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const limits = PLAN_LIMITS[plan];

  if (limits.requestsPerDay === -1) {
    return { allowed: true, remaining: -1, resetAt: new Date() };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const usageCount = await prisma.usageLog.count({
    where: {
      userId,
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  const remaining = Math.max(0, limits.requestsPerDay - usageCount);
  return {
    allowed: usageCount < limits.requestsPerDay,
    remaining,
    resetAt: tomorrow,
  };
}

export async function logUsage(data: {
  userId: string;
  apiKeyId?: string;
  endpoint: string;
  method: string;
  chainId?: string;
  contractAddr?: string;
  verdict?: string;
  riskScore?: number;
  latencyMs?: number;
  cached?: boolean;
  statusCode: number;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await prisma.usageLog.create({ data }).catch(() => {
    // Non-critical, don't fail request
  });
}
