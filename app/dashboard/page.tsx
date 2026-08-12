import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import NewClientForm from "./NewClientForm";
import SignOutButton from "./SignOutButton";
import { redirect } from "next/navigation";

const CLIENT_LIMIT = 100;

export default async function DashboardPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  // Pierwsze logowanie: załóż profil agenta w naszej bazie (tabela User),
  // jeśli jeszcze nie istnieje. Supabase Auth i baza aplikacji to dwa różne miejsca.
  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const clientCount = await prisma.client.count({ where: { userId: user.id } });
  const propertyCount = await prisma.property.count({ where: { userId: user.id } });

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 24 }}>Witaj, {user.email}</h1>
      <p style={{ color: "#5B6478", fontSize: 13 }}>
        To jest szkielet dowodzący, że logowanie, baza danych i limit klientów działają razem.
        Kolejny krok to przeniesienie tu widoków z prototypu (nieruchomosci-crm.jsx).
      </p>

      <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, flex: 1 }}>
          <div style={{ fontSize: 12, color: "#8A93A6" }}>KLIENCI</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{clientCount} / {CLIENT_LIMIT}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, flex: 1 }}>
          <div style={{ fontSize: 12, color: "#8A93A6" }}>NIERUCHOMOŚCI</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{propertyCount} / 50</div>
        </div>
      </div>

      <h2 style={{ fontSize: 16 }}>Klienci</h2>
      <NewClientForm />

      <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden" }}>
        {clients.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak klientów — dodaj pierwszego powyżej.</div>}
        {clients.map((c) => (
          <div key={c.id} style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5 }}>
            <strong>{c.firstName} {c.lastName}</strong>
            <span style={{ color: "#8A93A6" }}> — {c.type}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <SignOutButton />
      </div>
    </div>
  );
}
