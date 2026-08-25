import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/events/[id] - aktualizacja wydarzenia (własnego)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.calendarEvent.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono wydarzenia." }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.calendarEvent.update({
    where: { id: params.id },
    data: {
      title: body.title ?? existing.title,
      type: body.type ?? existing.type,
      startsAt: body.startsAt ? new Date(body.startsAt) : existing.startsAt,
      notes: body.notes !== undefined ? body.notes : existing.notes,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/events/[id] - usunięcie wydarzenia (własnego)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.calendarEvent.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono wydarzenia." }, { status: 404 });

  await prisma.calendarEvent.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}