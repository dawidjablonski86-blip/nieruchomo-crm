"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  type: string;
  status: string;
  budgetMin: number | null;
  budgetMax: number | null;
  location: string | null;
  areaMin: number | null;
  areaMax: number | null;
  rooms: number | null;
  propertyType: string | null;
  notes: string | null;
};

const TYPES = ["KUPUJACY", "SPRZEDAJACY", "WYNAJMUJACY", "NAJEMCA"];
const TYPE_LABELS: Record<string, string> = {
  KUPUJACY: "Kupujący", SPRZEDAJACY: "Sprzedający", WYNAJMUJACY: "Wynajmujący", NAJEMCA: "Najemca",
};
const STATUSES = ["NOWY", "AKTYWNY", "W_TRAKCIE", "NIEAKTYWNY", "ZAKONCZONY"];
const STATUS_LABELS: Record<string, string> = {
  NOWY: "Nowy", AKTYWNY: "Aktywny", W_TRAKCIE: "W trakcie", NIEAKTYWNY: "Nieaktywny", ZAKONCZONY: "Zakończony",
};
const PROPERTY_TYPES = ["MIESZKANIE", "DOM", "DZIALKA", "LOKAL_UZYTKOWY"];
const PROPERTY_TYPE_LABELS: Record<string, string> = {
  MIESZKANIE: "Mieszkanie", DOM: "Dom", DZIALKA: "Działka", LOKAL_UZYTKOWY: "Lokal użytkowy",
};

export default function EditClientForm({ client }: { client: Client }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(client.firstName);
  const [lastName, setLastName] = useState(client.lastName);
  const [phone, setPhone] = useState(client.phone ?? "");
  const [email, setEmail] = useState(client.email ?? "");
  const [type, setType] = useState(client.type);
  const [status, setStatus] = useState(client.status);
  const [budgetMin, setBudgetMin] = useState(client.budgetMin?.toString() ?? "");
  const [budgetMax, setBudgetMax] = useState(client.budgetMax?.toString() ?? "");
  const [location, setLocation] = useState(client.location ?? "");
  const [areaMin, setAreaMin] = useState(client.areaMin?.toString() ?? "");
  const [areaMax, setAreaMax] = useState(client.areaMax?.toString() ?? "");
  const [rooms, setRooms] = useState(client.rooms?.toString() ?? "");
  const [propertyType, setPropertyType] = useState(client.propertyType ?? "MIESZKANIE");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const inputStyle = { padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch(`/api/clients/${client.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName, lastName, phone, email, type, status,
        budgetMin, budgetMax, location, areaMin, areaMax, rooms, propertyType, notes,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się zapisać zmian.");
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Imię" required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
        <input placeholder="Nazwisko" required value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
        <input placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
        <input placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
          {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginTop: 4 }}>
        Preferencje
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Budżet min." type="number" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        <input placeholder="Budżet maks." type="number" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} style={{ ...inputStyle, width: 130 }} />
        <input placeholder="Lokalizacja" value={location} onChange={(e) => setLocation(e.target.value)} style={{ ...inputStyle, width: 160 }} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input placeholder="Metraż min." type="number" value={areaMin} onChange={(e) => setAreaMin(e.target.value)} style={{ ...inputStyle, width: 120 }} />
        <input placeholder="Metraż maks." type="number" value={areaMax} onChange={(e) => setAreaMax(e.target.value)} style={{ ...inputStyle, width: 120 }} />
        <input placeholder="Pokoje" type="number" value={rooms} onChange={(e) => setRooms(e.target.value)} style={{ ...inputStyle, width: 90 }} />
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={inputStyle}>
          {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>)}
        </select>
      </div>

      <textarea placeholder="Notatki" value={notes} onChange={(e) => setNotes(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0", minHeight: 70 }} />

      <div>
        <button type="submit" disabled={loading}
          style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Zapisuję…" : "Zapisz zmiany"}
        </button>
        {saved && <span style={{ color: "#16A34A", fontSize: 12.5, marginLeft: 10 }}>Zapisano.</span>}
        {error && <span style={{ color: "#DC2626", fontSize: 12.5, marginLeft: 10 }}>{error}</span>}
      </div>
    </form>
  );
}