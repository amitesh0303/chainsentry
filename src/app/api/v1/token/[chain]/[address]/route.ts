import { NextRequest, NextResponse } from "next/server";
import { analyzeToken } from "@/lib/threats/analyzer";
import { validateApiKey, checkRateLimit, logUsage } from "@/lib/api-keys";
import { SUPPORTED_CHAIN_IDS } from "@/lib/chains";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ chain: string; address: string }> }
) {
  const startTime = Date.now();
  const { chain, address } = await params;

  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const userAgent = req.headers.get("user-agent") || "";

  // Authenticate
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing or invalid Authorization header" },
      { status: 401 }
    );
  }
  const authResult = await validateApiKey(authHeader.slice(7));
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  // Validate chain
  if (!SUPPORTED_CHAIN_IDS.includes(chain)) {
    return NextResponse.json(
      {
        error: `Unsupported chain. Supported: ${SUPPORTED_CHAIN_IDS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  // Validate address
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return NextResponse.json(
      { error: "Invalid contract address" },
      { status: 400 }
    );
  }

  // Rate limit check
  const rateLimit = await checkRateLimit(authResult.userId!, authResult.plan!);
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const result = await analyzeToken(chain, address);
    const latency = Date.now() - startTime;

    logUsage({
      userId: authResult.userId!,
      apiKeyId: authResult.apiKeyId,
      endpoint: `/api/v1/token/${chain}/${address}`,
      method: "GET",
      chainId: chain,
      contractAddr: address,
      verdict: result.verdict,
      riskScore: result.risk_score,
      latencyMs: latency,
      statusCode: 200,
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      ...result,
      latency_ms: latency,
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
