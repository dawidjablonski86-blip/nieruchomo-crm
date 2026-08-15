"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPropertyForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("MIESZKANIE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, address, price, type }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać nieruchomości.");
      return;
    }

    setTitle("");
    setAddress("");
    setPrice("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", margin: "12px 0" }}>
      <input placeholder="Tytuł" required value={title} onChange={(e) => setTitle(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }} />
      <input placeholder="Adres" required value={address} onChange={(e) => setAddress(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }} />
      <input placeholder="Cena" type="number" value={price} onChange={(e) => setPrice(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9", width: 110 }} />
      <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, borderRadius: 6, border: "1px solid #E2DCC9" }}>
        <option value="MIESZKANIE">Mieszkanie</option>
        <option value="DOM">Dom</option>
        <option value="DZIALKA">Działka</option>
        <option value="LOKAL_UZYTKOWY">Lokal użytkowy</option>
      </select>
      <button type="submit" disabled={loading}
        style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: "#204D3E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
        {loading ? "Dodaję…" : "Dodaj nieruchomość"}
      </button>
      {error && <span style={{ color: "#9C4A33", fontSize: 12.5 }}>{error}</span>}
    </form>
  );
}