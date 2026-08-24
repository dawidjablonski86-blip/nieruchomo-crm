import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import NewClientForm from "@/components/NewClientForm";
import ImportClientsForm from "@/components/ImportClientsForm";
import DeleteButton from "@/components/DeleteButton";

const CLIENT_LIMIT_FREE = 100;
const CLIENT_LIMIT_PRO = 500;

export default async function ClientsPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) redirect("/dashboard");

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const clientCount = clients.length;
  const clientLimit = user.plan === "pro" ? CLIENT_LIMIT_PRO : CLIENT_LIMIT_FREE;

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Klienci</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>
          {clientCount} / {clientLimit} {user.plan === "pro" && "(plan Pro)"}
        </p>

        <NewClientForm />
        <ImportClientsForm />

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
          {clients.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak klientów — dodaj pierwszego powyżej.</div>}
          {clients.map((c) => (
            <div key={c.id} style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <strong>{c.firstName} {c.lastName}</strong>
                <span style={{ color: "#8A93A6" }}> — {c.type}</span>
                {(c.budgetMin || c.budgetMax) && (
                  <div style={{ color: "#5B6478", fontSize: 12, marginTop: 3 }}>
                    Budżet: {c.budgetMin?.toLocaleString("pl-PL") ?? "?"} – {c.budgetMax?.toLocaleString("pl-PL") ?? "?"} zł
                    {c.location ? ` · ${c.location}` : ""}
                  </div>
                )}
              </div>
              <Link href={`/clients/${c.id}/edit`} style={{ fontSize: 12.5, color: "#2563EB", textDecoration: "none", fontWeight: 600 }}>
                Edytuj
              </Link>
              <DeleteButton endpoint={`/api/clients/${c.id}`} confirmText={`Usunąć klienta ${c.firstName} ${c.lastName}?`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}