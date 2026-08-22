"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewEventForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [type, setType] = useState("SPOTKANIE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startsAt, type }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać wydarzenia.");
      return;
    }

    setTitle("");
    setStartsAt("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <input placeholder="Nazwa wydarzenia" required value={title} onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
      <input type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}>
        <option value="TELEFON">Telefon</option>
        <option value="SPOTKANIE">Spotkanie</option>
        <option value="PREZENTACJA">Prezentacja</option>
        <option value="PODPISANIE_UMOWY">Podpisanie umowy</option>
        <option value="FOLLOW_UP">Follow-up</option>
        <option value="INNE">Inne</option>
      </select>
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Dodaj wydarzenie"}
      </button>
      {error && <span style={{ color: "#DC2626", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}