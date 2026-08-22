import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import { matchScore } from "@/lib/matching";

const SEEKER_TYPES = ["KUPUJACY", "NAJEMCA"];

export default async function MatchingPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) redirect("/dashboard");

  const clients = await prisma.client.findMany({
    where: { userId: user.id, type: { in: SEEKER_TYPES as any } },
    select: {
      firstName: true, lastName: true, budgetMin: true, budgetMax: true,
      location: true, areaMin: true, areaMax: true, rooms: true, propertyType: true,
    },
  });
  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    select: {
      title: true, price: true, area: true, rooms: true, type: true, city: true, district: true,
    },
  });

  const pairs: { clientName: string; propertyTitle: string; score: number; reasons: { ok: boolean; text: string }[] }[] = [];

  for (const client of clients) {
    for (const property of properties) {
      const result = matchScore(client, property);
      if (result.score > 0) {
        pairs.push({
          clientName: `${client.firstName} ${client.lastName}`,
          propertyTitle: property.title,
          score: result.score,
          reasons: result.reasons,
        });
      }
    }
  }

  pairs.sort((a, b) => b.score - a.score);
  const topPairs = pairs.slice(0, 30);

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Matching</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>
          Automatyczne dopasowanie klientów szukających (kupujący, najemcy) do dostępnych nieruchomości.
        </p>

        {topPairs.length === 0 && (
          <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, marginTop: 16, color: "#8A93A6", fontSize: 13 }}>
            Brak dopasowań — dodaj klientów typu Kupujący/Najemca oraz nieruchomości.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12, marginTop: 16 }}>
          {topPairs.map((pair, i) => (
            <div key={i} style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{pair.clientName}</strong>
                  <span style={{ color: "#8A93A6" }}> ↔ {pair.propertyTitle}</span>
                </div>
                <div style={{
                  fontFamily: "monospace",
                  fontWeight: 700,
                  fontSize: 16,
                  color: pair.score >= 80 ? "#204D3E" : pair.score >= 70 ? "#96692A" : "#8A93A6",
                }}>
                  {pair.score}%
                </div>
              </div>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {pair.reasons.map((r, idx) => (
                  <span key={idx} style={{
                    fontSize: 11.5,
                    padding: "3px 8px",
                    borderRadius: 999,
                    background: r.ok ? "#E4EEE9" : "#EDEAE0",
                    color: r.ok ? "#204D3E" : "#8A93A6",
                  }}>
                    {r.ok ? "✓" : "✗"} {r.text}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}