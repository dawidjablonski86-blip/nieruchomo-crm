import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const CLIENT_LIMIT = 100;

// GET /api/clients - lista klientów zalogowanego agenta
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

// POST /api/clients - dodanie klienta. Limit sprawdzany TU, nie tylko w interfejsie -
// ktoś mógłby ominąć front-end i wysłać żądanie bezpośrednio, więc backend musi pilnować sam.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return NextResponse.json({ error: "Imię i nazwisko są wymagane." }, { status: 400 });
  }

  const count = await prisma.client.count({ where: { userId: user.id } });
  if (count >= CLIENT_LIMIT) {
    return NextResponse.json(
      { error: `Osiągnięto limit ${CLIENT_LIMIT} klientów. Usuń istniejącego klienta lub zmień plan.` },
      { status: 403 }
    );
  }

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone ?? null,
      email: body.email ?? null,
      type: body.type ?? "KUPUJACY",
      budgetMin: body.budgetMin ?? null,
      budgetMax: body.budgetMax ?? null,
      location: body.location ?? null,
      areaMin: body.areaMin ?? null,
      areaMax: body.areaMax ?? null,
      rooms: body.rooms ?? null,
      propertyType: body.propertyType ?? null,
      preferences: body.preferences ?? null,
      notes: body.notes ?? null,
      status: body.status ?? "NOWY",
    },
  });

  return NextResponse.json(client, { status: 201 });
}
