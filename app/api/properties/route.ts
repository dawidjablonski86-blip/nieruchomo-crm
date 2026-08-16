import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const PROPERTY_LIMIT_FREE = 50;
const PROPERTY_LIMIT_PRO = 200;

// GET /api/properties - lista nieruchomości zalogowanego agenta
export async function GET() {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const properties = await prisma.property.findMany({
    where: { userId: authUser.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

// POST /api/properties - dodanie nieruchomości, z limitem zależnym od planu
export async function POST(request: Request) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const body = await request.json();

  if (!body.title?.trim() || !body.address?.trim()) {
    return NextResponse.json({ error: "Tytuł i adres są wymagane." }, { status: 400 });
  }

  const count = await prisma.property.count({ where: { userId: user.id } });
  const limit = user.plan === "pro" ? PROPERTY_LIMIT_PRO : PROPERTY_LIMIT_FREE;
  if (count >= limit) {
    return NextResponse.json(
      { error: `Osiągnięto limit ${limit} nieruchomości. Usuń istniejącą lub zmień plan.` },
      { status: 403 }
    );
  }

  const property = await prisma.property.create({
    data: {
      userId: user.id,
      title: body.title,
      address: body.address,
      city: body.city ?? null,
      district: body.district ?? null,
      price: body.price ? Number(body.price) : null,
      area: body.area ? Number(body.area) : null,
      rooms: body.rooms ? Number(body.rooms) : null,
      type: body.type ?? "MIESZKANIE",
      status: body.status ?? "POZYSKANA",
    },
  });

  return NextResponse.json(property, { status: 201 });
}