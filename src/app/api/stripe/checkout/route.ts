import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
});

const checkoutSchema = z.object({
  priceId: z.enum(["pro", "scale"]),
});

const PRICE_MAP: Record<string, string | undefined> = {
  pro: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  scale: process.env.STRIPE_SCALE_MONTHLY_PRICE_ID,
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const { priceId } = parsed.data;
  const stripePriceId = PRICE_MAP[priceId];

  if (!stripePriceId) {
    return NextResponse.json(
      { error: "Stripe price not configured" },
      { status: 500 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Get or create Stripe customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: user.name || undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create checkout session with 30-day free trial (no CC required for trial)
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_collection: "if_required", // No CC required for trial
    line_items: [{ price: stripePriceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 30,
      trial_settings: {
        end_behavior: {
          missing_payment_method: "cancel", // Cancel if no payment method after trial
        },
      },
    },
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
    allow_promotion_codes: true,
    metadata: { userId: user.id, priceId },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
