import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import NewTaskForm from "@/components/NewTaskForm";
import TaskRow from "@/components/TaskRow";

export default async function TasksPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) redirect("/dashboard");

  const tasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
  });

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Zadania</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>{tasks.filter(t => t.status === "DO_ZROBIENIA").length} do zrobienia</p>

        <NewTaskForm />

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
          {tasks.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak zadań — dodaj pierwsze powyżej.</div>}
          {tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      </div>
    </div>
  );
}