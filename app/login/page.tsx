"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
        return;
      }
      setInfo("Wysłaliśmy link do zresetowania hasła na podany e-mail. Sprawdź skrzynkę.");
      return;
    }

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signup") {
      setInfo("Konto utworzone. Sprawdź e-mail, jeśli Supabase wymaga potwierdzenia, albo po prostu się zaloguj.");
      setMode("login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0F172A" }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", borderRadius: 16, padding: 32, width: 360, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <h1 style={{ fontSize: 20, margin: 0 }}>Nieruchomo CRM</h1>
        <p style={{ fontSize: 13, color: "#475569", margin: "0 0 8px" }}>
          {mode === "login" && "Zaloguj się do panelu agenta."}
          {mode === "signup" && "Załóż nowe konto agenta."}
          {mode === "reset" && "Podaj e-mail, na który wyślemy link do zresetowania hasła."}
        </p>

        <label style={{ fontSize: 12, fontWeight: 600 }}>E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 9, borderRadius: 8, border: "1px solid #E2E8F0" }} />

        {mode !== "reset" && (
          <>
            <label style={{ fontSize: 12, fontWeight: 600 }}>Hasło</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              style={{ padding: 9, borderRadius: 8, border: "1px solid #E2E8F0" }} />
          </>
        )}

        {error && <div style={{ fontSize: 12.5, color: "#DC2626" }}>{error}</div>}
        {info && <div style={{ fontSize: 12.5, color: "#16A34A" }}>{info}</div>}

        <button type="submit" disabled={loading}
          style={{ marginTop: 8, padding: 10, borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Chwileczkę…" : mode === "login" ? "Zaloguj się" : mode === "signup" ? "Zarejestruj się" : "Wyślij link resetujący"}
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <button type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setInfo(null); }}
            style={{ background: "none", border: "none", color: "#475569", fontSize: 12.5, cursor: "pointer", padding: 0 }}>
         {mode !== "reset" && (
            <button type="button" onClick={() => { setMode("reset"); setError(null); setInfo(null); }}
              style={{ background: "none", border: "none", color: "#475569", fontSize: 12.5, cursor: "pointer", padding: 0 }}>
              Zapomniałem hasła
            </button>
          )}
        </div>

        <a href="/privacy-policy" target="_blank" style={{ fontSize: 11.5, color: "#94A3B8", textAlign: "center", textDecoration: "none", marginTop: 6 }}>
          Polityka ochrony danych osobowych
        </a>
      </form>
    </div>
  );
}