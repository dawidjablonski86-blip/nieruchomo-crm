import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const PROPERTY_LIMIT = 50;

// GET /api/properties - lista nieruchomości zalogowanego agenta
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(properties);
}

// POST /api/properties - dodanie nieruchomości. Limit sprawdzany tu, na serwerze.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.title?.trim() || !body.address?.trim()) {
    return NextResponse.json({ error: "Tytuł i adres są wymagane." }, { status: 400 });
  }

  const count = await prisma.property.count({ where: { userId: user.id } });
  if (count >= PROPERTY_LIMIT) {
    return NextResponse.json(
      { error: `Osiągnięto limit ${PROPERTY_LIMIT} nieruchomości. Usuń istniejącą lub zmień plan.` },
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