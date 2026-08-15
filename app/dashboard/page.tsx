import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";

const CLIENT_LIMIT = 100;
const PROPERTY_LIMIT = 50;

export default async function DashboardPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const clientCount = await prisma.client.count({ where: { userId: user.id } });
  const propertyCount = await prisma.property.count({ where: { userId: user.id } });
  const openTaskCount = await prisma.task.count({ where: { userId: user.id, status: "DO_ZROBIENIA" } });
  const eventCount = await prisma.calendarEvent.count({ where: { userId: user.id } });

  const cards = [
    { href: "/clients", label: "Klienci", value: `${clientCount} / ${CLIENT_LIMIT}` },
    { href: "/properties", label: "Nieruchomości", value: `${propertyCount} / ${PROPERTY_LIMIT}` },
    { href: "/tasks", label: "Zadania", value: `${openTaskCount} do zrobienia` },
    { href: "/calendar", label: "Kalendarz", value: `${eventCount} wydarzeń` },
  ];

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 24 }}>Witaj, {user.email}</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>Wybierz moduł, żeby zobaczyć szczegóły.</p>

        <div style={{ display: "flex", gap: 16, margin: "20px 0", flexWrap: "wrap" }}>
          {cards.map((card) => (
            <Link key={card.href} href={card.href} style={{ textDecoration: "none", color: "inherit", flex: 1, minWidth: 160 }}>
              <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 12, color: "#8A93A6" }}>{card.label.toUpperCase()}</div>
                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 4 }}>{card.value}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}