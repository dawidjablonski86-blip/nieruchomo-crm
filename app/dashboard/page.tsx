import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import NewClientForm from "./NewClientForm";
import NewPropertyForm from "./NewPropertyForm";
import NewTaskForm from "./NewTaskForm";
import SignOutButton from "./SignOutButton";
import { redirect } from "next/navigation";

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

  const clients = await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
    take: 20,
  });
  const clientCount = await prisma.client.count({ where: { userId: user.id } });
  const propertyCount = await prisma.property.count({ where: { userId: user.id } });

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
      <h1 style={{ fontSize: 24 }}>Witaj, {user.email}</h1>

      <div style={{ display: "flex", gap: 16, margin: "20px 0" }}>
        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, flex: 1 }}>
          <div style={{ fontSize: 12, color: "#8A93A6" }}>KLIENCI</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{clientCount} / {CLIENT_LIMIT}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, flex: 1 }}>
          <div style={{ fontSize: 12, color: "#8A93A6" }}>NIERUCHOMOŚCI</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{propertyCount} / {PROPERTY_LIMIT}</div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, flex: 1 }}>
          <div style={{ fontSize: 12, color: "#8A93A6" }}>ZADANIA</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{tasks.filter(t => t.status === "DO_ZROBIENIA").length}</div>
        </div>
      </div>

      <h2 style={{ fontSize: 16 }}>Klienci</h2>
      <NewClientForm />
      <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden",