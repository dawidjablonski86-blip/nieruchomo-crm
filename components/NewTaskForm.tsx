"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTaskForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("SREDNI");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, dueDate, priority }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać zadania.");
      return;
    }

    setName("");
    setDueDate("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <input placeholder="Nazwa zadania" required value={name} onChange={(e) => setName(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
      <input type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
      <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}>
        <option value="NISKI">Niski priorytet</option>
        <option value="SREDNI">Średni priorytet</option>
        <option value="WYSOKI">Wysoki priorytet</option>
      </select>
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Dodaj zadanie"}
      </button>
      {error && <span style={{ color: "#DC2626", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}