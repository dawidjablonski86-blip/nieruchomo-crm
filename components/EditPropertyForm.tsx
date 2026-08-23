"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PropertyPhotoUpload from "./PropertyPhotoUpload";

type Property = {
  id: string;
  title: string;
  address: string;
  price: number | null;
  type: string;
  status: string;
  photos: string[];
};

const TYPES = ["MIESZKANIE", "DOM", "DZIALKA", "LOKAL_UZYTKOWY"];
const TYPE_LABELS: Record<string, string> = {
  MIESZKANIE: "Mieszkanie", DOM: "Dom", DZIALKA: "Działka", LOKAL_UZYTKOWY: "Lokal użytkowy",
};
const STATUSES = ["POZYSKANA", "PRZYGOTOWANIE", "AKTYWNA", "PREZENTACJE", "NEGOCJACJE", "SPRZEDANA", "WYNAJETA", "NIEAKTYWNA"];
const STATUS_LABELS: Record<string, string> = {
  POZYSKANA: "Pozyskana", PRZYGOTOWANIE: "Przygotowanie", AKTYWNA: "Aktywna", PREZENTACJE: "Prezentacje",
  NEGOCJACJE: "Negocjacje", SPRZEDANA: "Sprzedana", WYNAJETA: "Wynajęta", NIEAKTYWNA: "Nieaktywna",
};

export default function EditPropertyForm({ property }: { property: Property }) {
  const router = useRouter();
  const [title, setTitle] = useState(property.title);
  const [address, setAddress] = useState(property.address);
  const [price, setPrice] = useState(property.price?.toString() ?? "");
  const [type, setType] = useState(property.type);
  const [status, setStatus] = useState(property.status);
  const [photos, setPhotos] = useState<string[]>(property.photos ?? []);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);

    const res = await fetch(`/api/properties/${property.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, address, price, type, status, photos }),
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
        <input placeholder="Tytuł" required value={title} onChange={(e) => setTitle(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
        <input placeholder="Adres" required value={address} onChange={(e) => setAddress(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }} />
        <input placeholder="Cena" type="number" value={price} onChange={(e) => setPrice(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0", width: 110 }} />
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select value={type} onChange={(e) => setType(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}>
          {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #E2E8F0" }}>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <PropertyPhotoUpload photos={photos} onChange={setPhotos} />

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