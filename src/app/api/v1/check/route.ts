import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeTransaction } from "@/lib/threats/analyzer";
import { validateApiKey, checkRateLimit, logUsage } from "@/lib/api-keys";
import { SUPPORTED_CHAIN_IDS } from "@/lib/chains";

const checkSchema = z.object({
  chainId: z.string().refine((v) => SUPPORTED_CHAIN_IDS.includes(v), {
    message: `Unsupported chain. Supported: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
  }),
  contractAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address"),
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid wallet address")
    .optional(),
  calldata: z.string().optional(),
  value: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "";

  // Authenticate
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }
  const rawKey = authHeader.slice(7);
  const authResult = await validateApiKey(rawKey);

  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(authResult.userId!, authResult.plan!);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        resetAt: rateLimit.resetAt,
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
        },
      }
    );
  }

  // Parse and validate body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = checkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const input = parsed.data;

  try {
    const result = await analyzeTransaction(input);
    const latency = Date.now() - startTime;

    // Log usage (non-blocking)
    logUsage({
      userId: authResult.userId!,
      apiKeyId: authResult.apiKeyId,
      endpoint: "/api/v1/check",
      method: "POST",
      chainId: input.chainId,
      contractAddr: input.contractAddress,
      verdict: result.verdict,
      riskScore: result.risk_score,
      latencyMs: latency,
      cached: result.cached,
      statusCode: 200,
      ipAddress,
      userAgent,
    });

    return NextResponse.json(
      {
        verdict: result.verdict,
        risk_score: result.risk_score,
        chain: result.chain,
        contract: result.contract,
        threats: result.threats,
        warnings: result.warnings,
        simulation: {
          success: result.verdict !== "BLOCKED",
          gas_used: null,
          revert_reason:
            result.verdict === "BLOCKED"
              ? result.warnings[0] || "Transaction blocked"
              : null,
        },
        token_info: result.details.tokenInfo || null,
        details: result.details,
        latency_ms: latency,
        cached: result.cached,
      },
      {
        headers: {
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          "X-RateLimit-Reset": rateLimit.resetAt.toISOString(),
        },
      }
    );
  } catch (error) {
    const latency = Date.now() - startTime;
    const errMessage =
      error instanceof Error ? error.message : "Analysis failed";

    logUsage({
      userId: authResult.userId!,
      apiKeyId: authResult.apiKeyId,
      endpoint: "/api/v1/check",
      method: "POST",
      chainId: input.chainId,
      contractAddr: input.contractAddress,
      latencyMs: latency,
      statusCode: 500,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}
