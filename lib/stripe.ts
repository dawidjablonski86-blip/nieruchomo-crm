import Stripe from "stripe";

// Jeden, współdzielony klient Stripe używany po stronie serwera (API routes).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
apiVersion: "2026-07-29.dahlia",
});

// Price ID Twojego planu Pro ze Stripe (Product catalog -> Plan Pro -> Price ID)
export const PRO_PRICE_ID = "price_1U4yBqK2T1htPDjLPxoyF6qT";