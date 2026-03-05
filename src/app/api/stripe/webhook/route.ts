import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { Plan } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2026-02-25.clover",
});

const PRICE_TO_PLAN: Record<string, Plan> = {
  [process.env.STRIPE_PRO_MONTHLY_PRICE_ID || ""]: Plan.PRO,
  [process.env.STRIPE_SCALE_MONTHLY_PRICE_ID || ""]: Plan.SCALE,
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : "Webhook error";
    return NextResponse.json({ error: errMsg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.metadata?.userId) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || Plan.PRO;

        await prisma.user.update({
          where: { id: session.metadata.userId },
          data: {
            plan,
            stripeSubscriptionId: subscription.id,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(
              (subscription.items.data[0]?.current_period_end ?? 0) * 1000
            ),
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const user = await prisma.user.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      });

      if (user) {
        const priceId = subscription.items.data[0]?.price.id;
        const plan =
          subscription.status === "active" || subscription.status === "trialing"
            ? PRICE_TO_PLAN[priceId] || Plan.PRO
            : Plan.FREE;

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan,
            stripePriceId: priceId,
            stripeCurrentPeriodEnd: new Date(
              (subscription.items.data[0]?.current_period_end ?? 0) * 1000
            ),
            trialEndsAt: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          },
        });
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          plan: Plan.FREE,
          stripeSubscriptionId: null,
          stripePriceId: null,
          stripeCurrentPeriodEnd: null,
        },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = (invoice as { subscription?: string }).subscription;
      if (subId) {
        await prisma.user.updateMany({
          where: { stripeSubscriptionId: subId },
          data: { plan: Plan.FREE },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
