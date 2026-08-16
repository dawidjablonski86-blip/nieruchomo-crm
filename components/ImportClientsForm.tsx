"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ImportClientsForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const csv = await file.text();

    const res = await fetch("/api/clients/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się zaimportować pliku.");
      return;
    }

    const data = await res.json();
    setResult(data);
    if (fileInputRef.current) fileInputRef.current.value = "";
    router.refresh();
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 16, margin: "12px 0" }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Import klientów z pliku CSV</div>
      <div style={{ fontSize: 12, color: "#8A93A6", marginBottom: 10 }}>
        Kolumny: imię, nazwisko, telefon, email, typ, budżet_min, budżet_max, lokalizacja
      </div>
      <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} disabled={loading} />
      {loading && <div style={{ fontSize: 12.5, color: "#8A93A6", marginTop: 8 }}>Importuję…</div>}
      {result && (
        <div style={{ fontSize: 12.5, color: "#204D3E", marginTop: 8 }}>
          Zaimportowano: {result.imported}. Pominięto: {result.skipped}.
        </div>
      )}
      {error && <div style={{ fontSize: 12.5, color: "#9C4A33", marginTop: 8 }}>{error}</div>}
    </div>
  );
}