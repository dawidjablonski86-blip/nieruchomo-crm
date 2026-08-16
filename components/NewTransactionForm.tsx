"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export default function NewTransactionForm({ clients, properties }: { clients: Option[]; properties: Option[] }) {
  const router = useRouter();
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!clientId || !propertyId) {
      setError("Potrzebujesz co najmniej jednego klienta i jednej nieruchomości.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, propertyId }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać transakcji.");
      return;
    }

    router.refresh();
  }

  if (clients.length === 0 || properties.length === 0) {
    return <p style={{ color: "#8A93A6", fontSize: 13, margin: "12px 0" }}>Potrzebujesz co najmniej jednego klienta i jednej nieruchomości, żeby dodać transakcję.</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <select value={clientId} onChange={(e) => setClientId(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }}>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.label}</option>
        ))}
      </select>
      <select value={propertyId} onChange={(e) => setPropertyId(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }}>
        {properties.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "#204D3E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Nowa transakcja"}
      </button>
      {error && <span style={{ color: "#9C4A33", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}