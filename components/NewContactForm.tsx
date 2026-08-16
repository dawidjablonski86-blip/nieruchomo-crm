"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ClientOption = { id: string; firstName: string; lastName: string };

export default function NewContactForm({ clients }: { clients: ClientOption[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [date, setDate] = useState("");
  const [type, setType] = useState("TELEFON");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, date, type, note }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać kontaktu.");
      return;
    }

    setDate("");
    setNote("");
    router.refresh();
  }

  if (clients.length === 0) {
    return <p style={{ color: "#8A93A6", fontSize: 13, margin: "12px 0" }}>Dodaj najpierw klienta, żeby móc zapisać kontakt.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <select value={clientId} onChange={(e) => setClientId(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }}>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
        ))}
      </select>
      <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }} />
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }}>
        <option value="TELEFON">Telefon</option>
        <option value="EMAIL">E-mail</option>
        <option value="SMS">SMS</option>
        <option value="SPOTKANIE">Spotkanie</option>
        <option value="PREZENTACJA">Prezentacja</option>
        <option value="INNE">Inne</option>
      </select>
      <input placeholder="Notatka (opcjonalnie)" value={note} onChange={(e) => setNote(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9", flex: 1, minWidth: 160 }} />
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "#204D3E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Dodaj kontakt"}
      </button>
      {error && <span style={{ color: "#9C4A33", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}