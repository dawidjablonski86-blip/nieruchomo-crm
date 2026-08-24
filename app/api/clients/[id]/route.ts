import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/clients/[id] - szczegóły jednego klienta (własnego)
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: authUser.id },
  });

  if (!client) return NextResponse.json({ error: "Nie znaleziono klienta." }, { status: 404 });

  return NextResponse.json(client);
}

// PATCH /api/clients/[id] - aktualizacja klienta (własnego)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.client.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono klienta." }, { status: 404 });

  const body = await request.json();

  if (!body.firstName?.trim() || !body.lastName?.trim()) {
    return NextResponse.json({ error: "Imię i nazwisko są wymagane." }, { status: 400 });
  }

  const updated = await prisma.client.update({
    where: { id: params.id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
      email: body.email || null,
      type: body.type ?? existing.type,
      status: body.status ?? existing.status,
      budgetMin: body.budgetMin ? Number(body.budgetMin) : null,
      budgetMax: body.budgetMax ? Number(body.budgetMax) : null,
      location: body.location || null,
      areaMin: body.areaMin ? Number(body.areaMin) : null,
      areaMax: body.areaMax ? Number(body.areaMax) : null,
      rooms: body.rooms ? Number(body.rooms) : null,
      propertyType: body.propertyType || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/clients/[id] - usunięcie klienta (własnego)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.client.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono klienta." }, { status: 404 });

  await prisma.client.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}