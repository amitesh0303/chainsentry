import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { generateApiKey } from "@/lib/api-keys";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const keys = await prisma.apiKey.findMany({
    where: { userId, isActive: true },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const schema = z.object({ name: z.string().min(1).max(50).optional() });
  const parsed = schema.safeParse(body);
  const name = parsed.success ? parsed.data.name || "API Key" : "API Key";

  // Limit keys per user
  const existingCount = await prisma.apiKey.count({
    where: { userId, isActive: true },
  });
  if (existingCount >= 10) {
    return NextResponse.json(
      { error: "Maximum 10 API keys per account" },
      { status: 400 }
    );
  }

  const { key, prefix, hash } = generateApiKey();
  const apiKey = await prisma.apiKey.create({
    data: { userId, name, keyHash: hash, keyPrefix: prefix },
  });

  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      key,
      keyPrefix: prefix,
      createdAt: apiKey.createdAt,
    },
    { status: 201 }
  );
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");

  if (!keyId) {
    return NextResponse.json({ error: "Key ID required" }, { status: 400 });
  }

  const key = await prisma.apiKey.findFirst({
    where: { id: keyId, userId },
  });

  if (!key) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false, revokedAt: new Date() },
  });

  return NextResponse.json({ message: "API key revoked" });
}
