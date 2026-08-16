import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

// GET /api/notes - lista notatek zalogowanego agenta
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { client: true, property: true },
  });
  return NextResponse.json(notes);
}

// POST /api/notes - dodanie notatki do klienta LUB nieruchomości
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const body = await request.json();

  if (!body.text?.trim() || !body.entityType || !body.entityId) {
    return NextResponse.json({ error: "Treść i powiązany rekord są wymagane." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      entityType: body.entityType,
      clientId: body.entityType === "client" ? body.entityId : null,
      propertyId: body.entityType === "property" ? body.entityId : null,
      text: body.text,
    },
  });

  return NextResponse.json(note, { status: 201 });
}