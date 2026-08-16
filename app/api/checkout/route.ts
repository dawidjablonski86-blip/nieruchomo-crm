import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { stripe, PRO_PRICE_ID } from "@/lib/stripe";

// POST /api/checkout - tworzy sesję płatności Stripe i zwraca link, na który przekierowujemy usera
export async function POST(request: Request) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const origin = request.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/settings?success=1`,
    cancel_url: `${origin}/settings?canceled=1`,
    metadata: { userId: user.id },
  });

  return NextResponse.json({ url: session.url });
}