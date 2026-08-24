import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/tasks/[id] - aktualizacja zadania (własnego), w tym oznaczenie jako wykonane
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono zadania." }, { status: 404 });

  const body = await request.json();

  const updated = await prisma.task.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      description: body.description !== undefined ? body.description : existing.description,
      dueDate: body.dueDate ? new Date(body.dueDate) : existing.dueDate,
      priority: body.priority ?? existing.priority,
      status: body.status ?? existing.status,
    },
  });

  return NextResponse.json(updated);
}

// DELETE /api/tasks/[id] - usunięcie zadania (własnego)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const existing = await prisma.task.findFirst({
    where: { id: params.id, userId: authUser.id },
  });
  if (!existing) return NextResponse.json({ error: "Nie znaleziono zadania." }, { status: 404 });

  await prisma.task.delete({ where: { id: params.id } });

  return NextResponse.json({ deleted: true });
}