import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const STAGES = ["LEAD", "KONTAKT", "SPOTKANIE", "PREZENTACJA", "NEGOCJACJE", "UMOWA", "ZAKONCZONA"];

// GET /api/transactions - lista transakcji zalogowanego agenta
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { client: true, property: true },
  });
  return NextResponse.json(transactions);
}

// POST /api/transactions - dodanie nowej transakcji (start pipeline'u)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.clientId || !body.propertyId) {
    return NextResponse.json({ error: "Klient i nieruchomość są wymagane." }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: user.id,
      clientId: body.clientId,
      propertyId: body.propertyId,
      stage: "LEAD",
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}

// PATCH /api/transactions - zmiana etapu istniejącej transakcji
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.id || !STAGES.includes(body.stage)) {
    return NextResponse.json({ error: "Brak ID transakcji lub nieprawidłowy etap." }, { status: 400 });
  }

  const existing = await prisma.transaction.findFirst({
    where: { id: body.id, userId: user.id },
  });
  if (!existing) {
    return NextResponse.json({ error: "Nie znaleziono transakcji." }, { status: 404 });
  }

  const updated = await prisma.transaction.update({
    where: { id: body.id },
    data: { stage: body.stage },
  });

  return NextResponse.json(updated);
}