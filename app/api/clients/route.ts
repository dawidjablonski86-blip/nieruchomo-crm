import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const CLIENT_LIMIT_FREE = 100;
const CLIENT_LIMIT_PRO = 500;

// GET /api/clients - lista klientów zalogowanego agenta
export async function GET() {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

// POST /api/clients - dodanie klienta, z limitem zależnym od planu, sprawdzanym na serwerze
export async function POST(request: Request) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const body = await request.json();

  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return NextResponse.json({ error: "Imię i nazwisko są wymagane." }, { status: 400 });
  }

  const count = await prisma.client.count({ where: { userId: user.id } });
  const limit = user.plan === "pro" ? CLIENT_LIMIT_PRO : CLIENT_LIMIT_FREE;
  if (count >= limit) {
    return NextResponse.json(
      { error: `Osiągnięto limit ${limit} klientów. Usuń istniejącego klienta lub zmień plan.` },
      { status: 403 }
    );
  }

  const client = await prisma.client.create({
    data: {
      userId: user.id,
      firstName: body.firstName,
      lastName: body.lastName,
      type: body.type ?? "KUPUJACY",
      status: "NOWY",
      budgetMin: body.budgetMin ? Number(body.budgetMin) : null,
      budgetMax: body.budgetMax ? Number(body.budgetMax) : null,
      location: body.location || null,
      areaMin: body.areaMin ? Number(body.areaMin) : null,
      areaMax: body.areaMax ? Number(body.areaMax) : null,
      rooms: body.rooms ? Number(body.rooms) : null,
      propertyType: body.propertyType || null,
    },
  });

  return NextResponse.json(client, { status: 201 });
}