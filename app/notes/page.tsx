import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import NewNoteForm from "@/components/NewNoteForm";

export default async function NotesPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const clientsRaw = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { firstName: "asc" },
  });
  const propertiesRaw = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { title: "asc" },
  });
  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { client: true, property: true },
  });

  const clients = clientsRaw.map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName}` }));
  const properties = propertiesRaw.map((p) => ({ id: p.id, label: p.title }));

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Notatki</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>{notes.length} zapisanych notatek</p>

        <NewNoteForm clients={clients} properties={properties} />

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
          {notes.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak notatek — dodaj pierwszą powyżej.</div>}
          {notes.map((n) => (
            <div key={n.id} style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5 }}>
              <strong>{n.client ? `${n.client.firstName} ${n.client.lastName}` : n.property?.title}</strong>
              <span style={{ color: "#8A93A6" }}> — {new Date(n.createdAt).toLocaleDateString("pl-PL")}</span>
              <div style={{ color: "#5B6478", fontSize: 12.5, marginTop: 3 }}>{n.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}