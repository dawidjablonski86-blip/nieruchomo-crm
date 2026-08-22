import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import NewEventForm from "@/components/NewEventForm";

export default async function CalendarPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) redirect("/dashboard");

  const events = await prisma.calendarEvent.findMany({
    where: { userId: user.id },
    orderBy: { startsAt: "asc" },
  });

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Kalendarz</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>{events.length} wydarzeń</p>

        <NewEventForm />

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
          {events.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak wydarzeń — dodaj pierwsze powyżej.</div>}
          {events.map((ev) => (
            <div key={ev.id} style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5 }}>
              <strong>{ev.title}</strong>
              <span style={{ color: "#8A93A6" }}> — {new Date(ev.startsAt).toLocaleString("pl-PL")} — {ev.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}