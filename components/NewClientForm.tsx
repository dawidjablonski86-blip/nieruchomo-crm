"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewClientForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [type, setType] = useState("KUPUJACY");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [location, setLocation] = useState("");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [rooms, setRooms] = useState("");
  const [propertyType, setPropertyType] = useState("MIESZKANIE");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName, lastName, type,
        budgetMin, budgetMax, location, areaMin, areaMax, rooms, propertyType,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się dodać klienta.");
      return;
    }

    setFirstName("");
    setLastName("");
    setBudgetMin("");
    setBudgetMax("");
    setLocation("");
    setAreaMin("");
    setAreaMax("");
    setRooms("");
    router.refresh();
  }

  const inputStyle = { padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" };

  return (
    <form onSubmit={handleSubmit} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, margin: "12px 0", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Imię" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
        <input placeholder="Nazwisko" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
          <option value="KUPUJACY">Kupujący</option>
          <option value="SPRZEDAJACY">Sprzedający</option>
          <option value="WYNAJMUJACY">Wynajmujący</option>
          <option value="NAJEMCA">Najemca</option>
        </select>
      </div>

      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginTop: 4 }}>
        Preferencje (używane do dopasowania nieruchomości)
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Budżet min. (zł)" type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        <input placeholder="Budżet maks. (zł)" type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        <input placeholder="Lokalizacja (np. Rubinkowo)" value={location} onChange={(e) => setLocation(e.target.value)} style={{ ...inputStyle, width: 180 }} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Metraż min. (m²)" type="number" value={areaMin} onChange={(e) => setAreaMin(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        <input placeholder="Metraż maks. (m²)" type="number" value={areaMax} onChange={(e) => setAreaMax(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        <input placeholder="Liczba pokoi" type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} style={{ ...inputStyle, width: 110 }} />
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={inputStyle}>
          <option value="MIESZKANIE">Mieszkanie</option>
          <option value="DOM">Dom</option>
          <option value="DZIALKA">Działka</option>
          <option value="LOKAL_UZYTKOWY">Lokal użytkowy</option>
        </select>
      </div>

      <div>
        <button type="submit" disabled={loading}
          style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Dodaję…" : "Dodaj klienta"}
        </button>
        {error && <span style={{ color: "#DC2626", fontSize: 12.5, marginLeft: 10 }}>{error}</span>}
      </div>
    </form>
  );
}