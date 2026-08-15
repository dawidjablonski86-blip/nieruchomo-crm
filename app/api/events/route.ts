import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/events - lista wydarzeń zalogowanego agenta
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json(events);
}

// POST /api/events - dodanie wydarzenia
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.title?.trim() || !body.startsAt) {
    return NextResponse.json({ error: "Nazwa i data są wymagane." }, { status: 400 });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: body.title,
      type: body.type ?? "SPOTKANIE",
      startsAt: new Date(body.startsAt),
      notes: body.notes ?? null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}