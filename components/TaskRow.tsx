"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Task = {
  id: string;
  name: string;
  dueDate: string | Date;
  priority: string;
  status: string;
};

export default function TaskRow({ task }: { task: Task }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const done = task.status === "WYKONANE";

  async function toggleDone() {
    setLoading(true);
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: done ? "DO_ZROBIENIA" : "WYKONANE" }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Usunąć zadanie „${task.name}"?`)) return;
    setLoading(true);
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5, display: "flex", alignItems: "center", gap: 10 }}>
      <input type="checkbox" checked={done} onChange={toggleDone} disabled={loading} style={{ width: 16, height: 16 }} />
      <div style={{ flex: 1 }}>
        <strong style={{ textDecoration: done ? "line-through" : "none", color: done ? "#94A3B8" : "#0F172A" }}>{task.name}</strong>
        <span style={{ color: "#8A93A6" }}> — termin: {new Date(task.dueDate).toLocaleDateString("pl-PL")} — {task.priority}</span>
      </div>
      <button onClick={handleDelete} disabled={loading}
        style={{ background: "none", border: "none", color: "#DC2626", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>
        Usuń
      </button>
    </div>
  );
}