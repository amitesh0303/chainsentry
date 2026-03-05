import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/api-keys";
import { PLAN_LIMITS } from "@/lib/api-keys";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authResult = await validateApiKey(authHeader.slice(7));
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [todayCount, monthCount, totalCount, blockedToday, safeToday] =
    await Promise.all([
      prisma.usageLog.count({
        where: {
          userId: authResult.userId!,
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.usageLog.count({
        where: {
          userId: authResult.userId!,
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.usageLog.count({
        where: { userId: authResult.userId! },
      }),
      prisma.usageLog.count({
        where: {
          userId: authResult.userId!,
          verdict: "BLOCKED",
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
      prisma.usageLog.count({
        where: {
          userId: authResult.userId!,
          verdict: "SAFE",
          createdAt: { gte: today, lt: tomorrow },
        },
      }),
    ]);

  const plan = authResult.plan!;
  const limits = PLAN_LIMITS[plan];
  const dailyLimit = limits.requestsPerDay;
  const remaining = dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - todayCount);

  return NextResponse.json({
    plan,
    usage: {
      today: todayCount,
      last30Days: monthCount,
      total: totalCount,
    },
    verdicts: {
      blocked: blockedToday,
      safe: safeToday,
      caution: todayCount - blockedToday - safeToday,
    },
    limits: {
      requestsPerDay: dailyLimit,
      remaining,
      resetAt: tomorrow.toISOString(),
    },
    features: limits.features,
  });
}
