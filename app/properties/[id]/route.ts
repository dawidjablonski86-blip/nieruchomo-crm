import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/properties/[id] - szczegóły jednej nieruchomości (własnej)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const property = await prisma.property.findFirst({
    where: { id: params.id, userId: authUser.id },
  });

  if (!property) return NextResponse.json({ error: "Nie znaleziono nieruchomości." }, { status: 404 });

  return NextResponse.json(property);
}

// PATCH /api/properties/[id] - aktualizacja nieruchomości (własnej)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.property.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono nieruchomości." }, { status: 404 });

  const body = await request.json();

  if (!body.title?.trim() || !body.address?.trim()) {
    return NextResponse.json({ error: "Tytuł i adres są wymagane." }, { status: 400 });
  }

  const updated = await prisma.property.update({
    where: { id: params.id },
    data: {
      title: body.title,
      address: body.address,
      price: body.price ? Number(body.price) : null,
      type: body.type ?? existing.type,
      status: body.status ?? existing.status,
      photos: Array.isArray(body.photos) ? body.photos : existing.photos,
    },
  });

  return NextResponse.json(updated);
}