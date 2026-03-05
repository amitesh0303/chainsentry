import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-keys";
import { Plan } from "@prisma/client";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { email, password, name } = parsed.data;

  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      passwordHash,
      plan: Plan.FREE,
    },
  });

  // Generate initial API key
  const { key, prefix, hash } = generateApiKey();
  await prisma.apiKey.create({
    data: {
      userId: user.id,
      name: "Default Key",
      keyHash: hash,
      keyPrefix: prefix,
    },
  });

  return NextResponse.json(
    {
      message: "Account created successfully",
      user: { id: user.id, email: user.email, name: user.name },
      apiKey: key,
    },
    { status: 201 }
  );
}
