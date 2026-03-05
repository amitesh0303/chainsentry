import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateApiKey } from "@/lib/api-keys";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";
import crypto from "crypto";

const webhookSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  events: z
    .array(
      z.enum([
        "transaction.blocked",
        "transaction.safe",
        "transaction.caution",
        "all",
      ])
    )
    .default(["transaction.blocked", "transaction.safe"]),
});

const PRO_PLANS: Plan[] = [Plan.PRO, Plan.SCALE, Plan.BUILDER, Plan.ENTERPRISE];

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authResult = await validateApiKey(authHeader.slice(7));
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  // Webhooks require Pro or higher
  if (!PRO_PLANS.includes(authResult.plan!)) {
    return NextResponse.json(
      { error: "Webhooks require Pro plan or higher" },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = webhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { url, events } = parsed.data;
  const secret = `whsec_${crypto.randomBytes(32).toString("hex")}`;

  const webhook = await prisma.webhook.create({
    data: {
      userId: authResult.userId!,
      url,
      secret,
      events,
    },
  });

  return NextResponse.json({
    id: webhook.id,
    url: webhook.url,
    events: webhook.events,
    secret,
    createdAt: webhook.createdAt,
  });
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authResult = await validateApiKey(authHeader.slice(7));
  if (!authResult.valid) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

  const webhooks = await prisma.webhook.findMany({
    where: { userId: authResult.userId! },
    select: {
      id: true,
      url: true,
      events: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ webhooks });
}
