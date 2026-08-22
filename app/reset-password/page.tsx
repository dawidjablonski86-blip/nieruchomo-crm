"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Jeśli sesja odzyskiwania już istnieje w momencie wejścia na stronę
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setInfo("Hasło zostało zmienione. Możesz się teraz zalogować.");
    setTimeout(() => router.push("/login"), 2000);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 360 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Nowe hasło</h1>

        {!ready && !info && (
          <p style={{ fontSize: 13, color: "#475569", marginTop: 10 }}>
            Otwórz tę stronę z linku wysłanego na e-mail. Jeśli przyszedłeś/aś tu inaczej, link mógł wygasnąć.
          </p>
        )}

        {ready && !info && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Nowe hasło</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 9, borderRadius: 8, border: "1px solid #E2E8F0" }} />

            {error && <div style={{ fontSize: 12.5, color: "#DC2626" }}>{error}</div>}

            <button type="submit" disabled={loading}
              style={{ padding: 10, borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
              {loading ? "Zapisuję…" : "Ustaw nowe hasło"}
            </button>
          </form>
        )}

        {info && <div style={{ fontSize: 13, color: "#16A34A", marginTop: 12 }}>{info}</div>}
      </div>
    </div>
  );
}