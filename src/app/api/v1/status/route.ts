import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  return NextResponse.json({
    status: "operational",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    chains: ["ethereum", "bsc", "polygon", "arbitrum", "base", "optimism"],
    latency_ms: Date.now() - startTime,
  });
}
