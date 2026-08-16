import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// POST /api/webhook - Stripe wywołuje ten adres automatycznie po zdarzeniach płatności.
// Nie wymaga logowania usera - zamiast tego sprawdzamy podpis Stripe (webhook secret).
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: "Nieprawidłowy podpis webhooka." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: { plan: "pro" },
      });
    }
  }

  return NextResponse.json({ received: true });
}