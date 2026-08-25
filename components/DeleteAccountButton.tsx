"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DeleteAccountButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleDelete() {
    if (confirmText !== "USUŃ") {
      setError('Wpisz dokładnie słowo "USUŃ", żeby potwierdzić.');
      return;
    }

    setError(null);
    setLoading(true);

    const res = await fetch("/api/account", { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Nie udało się usunąć konta.");
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (!showConfirm) {
    return (
      <button onClick={() => setShowConfirm(true)}
        style={{ background: "none", border: "1px solid #DC2626", color: "#DC2626", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: "8px 14px", borderRadius: 8 }}>
        Usuń konto i wszystkie moje dane
      </button>
    );
  }

  return (
    <div style={{ background: "#FEF2F2", border: "1px solid #DC2626", borderRadius: 10, padding: 16, marginTop: 10 }}>
      <p style={{ fontSize: 13, color: "#7F1D1D", marginBottom: 10 }}>
        To usunie <strong>trwale</strong> Twoje konto oraz wszystkich klientów, nieruchomości, zadania i pozostałe dane. Tej operacji nie można cofnąć.
      </p>
      <p style={{ fontSize: 12.5, color: "#7F1D1D", marginBottom: 6 }}>
        Wpisz słowo <strong>USUŃ</strong>, żeby potwierdzić:
      </p>
      <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)}
        style={{ padding: 8, borderRadius: 8, border: "1px solid #DC2626", marginBottom: 10, width: 160 }} />
      <div>
        <button onClick={handleDelete} disabled={loading}
          style={{ background: "#DC2626", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontWeight: 600, fontSize: 12.5, cursor: "pointer", marginRight: 8 }}>
          {loading ? "Usuwam…" : "Usuń trwale"}
        </button>
        <button onClick={() => { setShowConfirm(false); setConfirmText(""); setError(null); }}
          style={{ background: "none", border: "none", color: "#475569", fontSize: 12.5, cursor: "pointer" }}>
          Anuluj
        </button>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 12.5, marginTop: 8 }}>{error}</div>}
    </div>
  );
}