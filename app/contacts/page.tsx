import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import NewContactForm from "@/components/NewContactForm";

export default async function ContactsPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { firstName: "asc" },
    select: { id: true, firstName: true, lastName: true },
  });

  const contacts = await prisma.contact.findMany({
    where: { client: { userId: user.id } },
    orderBy: { date: "desc" },
    include: { client: true },
  });

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Kontakty</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>{contacts.length} zapisanych kontaktów</p>

        <NewContactForm clients={clients} />

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
          {contacts.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak kontaktów — dodaj pierwszy powyżej.</div>}
          {contacts.map((ct) => (
            <div key={ct.id} style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5 }}>
              <strong>{ct.client.firstName} {ct.client.lastName}</strong>
              <span style={{ color: "#8A93A6" }}> — {ct.type} — {new Date(ct.date).toLocaleString("pl-PL")}</span>
              {ct.note && <div style={{ color: "#5B6478", fontSize: 12.5, marginTop: 3 }}>{ct.note}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}