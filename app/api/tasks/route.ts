import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks - lista zadań zalogowanego agenta
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(tasks);
}

// POST /api/tasks - dodanie zadania
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.name?.trim() || !body.dueDate) {
    return NextResponse.json({ error: "Nazwa i termin są wymagane." }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      userId: user.id,
      name: body.name,
      description: body.description ?? null,
      dueDate: new Date(body.dueDate),
      priority: body.priority ?? "SREDNI",
      status: "DO_ZROBIENIA",
    },
  });

  return NextResponse.json(task, { status: 201 });
}