"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ImportClientsForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

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
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, margin: "12px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>Import klientów z pliku CSV</div>
        <button type="button" onClick={() => setShowHelp(!showHelp)}
          style={{ background: "none", border: "none", color: "#2563EB", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 }}>
          {showHelp ? "Ukryj instrukcję" : "Jak przygotować plik?"}
        </button>
      </div>

      {showHelp && (
        <div style={{ background: "#F8FAFC", borderRadius: 8, padding: 12, marginTop: 10, fontSize: 12.5, color: "#475569", lineHeight: 1.7 }}>
          <strong style={{ color: "#0F172A" }}>Jeśli masz klientów w Excelu:</strong>
          <ol style={{ margin: "6px 0 10px", paddingLeft: 18 }}>
            <li>Ustaw kolumny w tej kolejności: imię, nazwisko, telefon, email, typ, budżet_min, budżet_max, lokalizacja</li>
            <li>W Excelu: <strong>Plik → Zapisz jako</strong> → jako typ pliku wybierz <strong>CSV (rozdzielany przecinkami)</strong></li>
            <li>Wgraj zapisany plik przyciskiem poniżej</li>
          </ol>
          <strong style={{ color: "#0F172A" }}>Dozwolone wartości pola „typ":</strong> KUPUJACY, SPRZEDAJACY, WYNAJMUJACY, NAJEMCA
          <br /><br />
          Pola telefon, email, budżet i lokalizacja są opcjonalne — możesz je zostawić puste.
          Pierwsza linijka z nazwami kolumn (nagłówek) jest rozpoznawana automatycznie i pomijana.
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileChange} disabled={loading} />
      </div>
      {loading && <div style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 8 }}>Importuję…</div>}
      {result && (
        <div style={{ fontSize: 12.5, color: "#16A34A", marginTop: 8 }}>
          Zaimportowano: {result.imported}. Pominięto: {result.skipped}.
        </div>
      )}
      {error && <div style={{ fontSize: 12.5, color: "#DC2626", marginTop: 8 }}>{error}</div>}
    </div>
  );
}