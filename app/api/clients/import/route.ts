import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const CLIENT_LIMIT_FREE = 100;
const CLIENT_LIMIT_PRO = 500;
const VALID_TYPES = ["KUPUJACY", "SPRZEDAJACY", "WYNAJMUJACY", "NAJEMCA"];

// Zamienia jedną linijkę CSV (rozdzieloną przecinkami) na obiekt klienta.
// Oczekiwana kolejność kolumn: imię,nazwisko,telefon,email,typ,budzet_min,budzet_max,lokalizacja
function parseLine(line: string) {
  const parts = line.split(",").map((p) => p.trim());
  const [firstName, lastName, phone, email, type, budgetMin, budgetMax, location] = parts;
  return {
    firstName,
    lastName,
    phone: phone || null,
    email: email || null,
    type: VALID_TYPES.includes(type?.toUpperCase()) ? type.toUpperCase() : "KUPUJACY",
    budgetMin: budgetMin ? Number(budgetMin) : null,
    budgetMax: budgetMax ? Number(budgetMax) : null,
    location: location || null,
  };
}

// POST /api/clients/import - wgrywa plik CSV i dodaje wielu klientów naraz
export async function POST(request: Request) {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const body = await request.json();
  const csvText: string = body.csv ?? "";

  if (!csvText.trim()) {
    return NextResponse.json({ error: "Plik jest pusty." }, { status: 400 });
  }

  const lines = csvText.split("\n").map((l) => l.trim()).filter(Boolean);
  // Pomijamy pierwszą linijkę, jeśli wygląda na nagłówek (nie zaczyna się literą imienia, tylko np. "imię")
  const startIndex = lines[0]?.toLowerCase().includes("imi") ? 1 : 0;
  const dataLines = lines.slice(startIndex);

  const existingCount = await prisma.client.count({ where: { userId: user.id } });
  const limit = user.plan === "pro" ? CLIENT_LIMIT_PRO : CLIENT_LIMIT_FREE;
  const availableSlots = limit - existingCount;

  if (availableSlots <= 0) {
    return NextResponse.json({ error: "Osiągnięto limit klientów. Nie można zaimportować nowych." }, { status: 403 });
  }

  const toImport = dataLines.slice(0, availableSlots);
  let imported = 0;
  let skipped = 0;

  for (const line of toImport) {
    const parsed = parseLine(line);
    if (!parsed.firstName || !parsed.lastName) {
      skipped++;
      continue;
    }
    await prisma.client.create({
      data: { userId: user.id, status: "NOWY", ...parsed },
    });
    imported++;
  }

  const remainingSkipped = dataLines.length - toImport.length;

  return NextResponse.json({
    imported,
    skipped: skipped + remainingSkipped,
  });
}