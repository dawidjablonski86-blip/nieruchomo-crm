import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/contacts - lista kontaktów zalogowanego agenta (ze wszystkich klientów)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { client: { userId: user.id } },
    orderBy: { date: "desc" },
    include: { client: true },
  });
  return NextResponse.json(contacts);
}

// POST /api/contacts - dodanie kontaktu do konkretnego klienta
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.clientId || !body.date) {
    return NextResponse.json({ error: "Klient i data są wymagane." }, { status: 400 });
  }

  // Sprawdzamy, że ten klient faktycznie należy do zalogowanego agenta
  const client = await prisma.client.findFirst({
    where: { id: body.clientId, userId: user.id },
  });
  if (!client) {
    return NextResponse.json({ error: "Nie znaleziono klienta." }, { status: 404 });
  }

  const contact = await prisma.contact.create({
    data: {
      clientId: body.clientId,
      date: new Date(body.date),
      type: body.type ?? "TELEFON",
      note: body.note ?? null,
    },
  });

  // Aktualizujemy datę ostatniego kontaktu u klienta (przyda się do przyszłego follow-up)
  await prisma.client.update({
    where: { id: body.clientId },
    data: { lastContact: new Date(body.date) },
  });

  return NextResponse.json(contact, { status: 201 });
}