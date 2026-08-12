"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [type, setType] = useState("KUPUJACY");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, type }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać klienta.");
      return;
    }

    setFirstName("");
    setLastName("");
    router.refresh(); // odświeża dane pobrane po stronie serwera na tej stronie
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <input placeholder="Imię" required value={firstName} onChange={(e) => setFirstName(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }} />
      <input placeholder="Nazwisko" required value={lastName} onChange={(e) => setLastName(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }} />
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }}>
        <option value="KUPUJACY">Kupujący</option>
        <option value="SPRZEDAJACY">Sprzedający</option>
        <option value="WYNAJMUJACY">Wynajmujący</option>
        <option value="NAJEMCA">Najemca</option>
      </select>
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "#204D3E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Dodaj klienta"}
      </button>
      {error && <span style={{ color: "#9C4A33", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}
