"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Option = { id: string; label: string };

export default function NewNoteForm({ clients, properties }: { clients: Option[]; properties: Option[] }) {
  const router = useRouter();
  const [entityType, setEntityType] = useState<"client" | "property">("client");
  const options = entityType === "client" ? clients : properties;
  const [entityId, setEntityId] = useState(options[0]?.id ?? "");
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleTypeChange(newType: "client" | "property") {
    setEntityType(newType);
    const newOptions = newType === "client" ? clients : properties;
    setEntityId(newOptions[0]?.id ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!entityId) {
      setError("Brak dostępnego klienta/nieruchomości do wybrania.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entityType, entityId, text }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać notatki.");
      return;
    }

    setText("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <select value={entityType} onChange={(e) => handleTypeChange(e.target.value as "client" | "property")}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}>
        <option value="client">Klient</option>
        <option value="property">Nieruchomość</option>
      </select>
      <select value={entityId} onChange={(e) => setEntityId(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
      <input placeholder="Treść notatki" required value={text} onChange={(e) => setText(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0", flex: 1, minWidth: 160 }} />
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Dodaj notatkę"}
      </button>
      {error && <span style={{ color: "#DC2626", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}