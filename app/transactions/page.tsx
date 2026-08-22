import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import NewTransactionForm from "@/components/NewTransactionForm";
import TransactionCard from "@/components/TransactionCard";

const STAGES = ["LEAD", "KONTAKT", "SPOTKANIE", "PREZENTACJA", "NEGOCJACJE", "UMOWA", "ZAKONCZONA"];
const STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead",
  KONTAKT: "Kontakt",
  SPOTKANIE: "Spotkanie",
  PREZENTACJA: "Prezentacja",
  NEGOCJACJE: "Negocjacje",
  UMOWA: "Umowa",
  ZAKONCZONA: "Zakończona",
};

export default async function TransactionsPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) redirect("/dashboard");

  const clientsRaw = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true },
  });
  const propertiesRaw = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { title: "asc" },
    select: { id: true, title: true },
  });
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { firstName: true, lastName: true } },
      property: { select: { title: true } },
    },
  });

  const clients = clientsRaw.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }));
  const properties = propertiesRaw.map((p) => ({ id: p.id, label: p.title }));

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Transakcje</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>{transactions.length} transakcji w toku</p>

        <NewTransactionForm clients={clients} properties={properties} />

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 20 }}>
          {STAGES.map((stage) => {
            const items = transactions.filter((t) => t.stage === stage);
            if (items.length === 0) return null;
            return (
              <div key={stage}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#8A93A6", textTransform: "uppercase", marginBottom: 8 }}>
                  {STAGE_LABELS[stage]} ({items.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {items.map((t) => (
                    <TransactionCard
                      key={t.id}
                      id={t.id}
                      stage={t.stage}
                      clientName={`${t.client.firstName} ${t.client.lastName}`}
                      propertyTitle={t.property.title}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          {transactions.length === 0 && (
            <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, color: "#8A93A6", fontSize: 13 }}>
              Brak transakcji — dodaj pierwszą powyżej.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}