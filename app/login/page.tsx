"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
      setError("Konto utworzone. Sprawdź e-mail, jeśli Supabase wymaga potwierdzenia, albo po prostu się zaloguj.");
      setMode("login");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#163629" }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: "#fff", borderRadius: 16, padding: 32, width: 360, display: "flex", flexDirection: "column", gap: 12 }}
      >
        <h1 style={{ fontSize: 20, margin: 0 }}>Nieruchomo CRM</h1>
        <p style={{ fontSize: 13, color: "#5B6478", margin: "0 0 8px" }}>
          {mode === "login" ? "Zaloguj się do panelu agenta." : "Załóż nowe konto agenta."}
        </p>

        <label style={{ fontSize: 12, fontWeight: 600 }}>E-mail</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 9, borderRadius: 7, border: "1px solid #E2DCC9" }} />

        <label style={{ fontSize: 12, fontWeight: 600 }}>Hasło</label>
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
          style={{ padding: 9, borderRadius: 7, border: "1px solid #E2DCC9" }} />

        {error && <div style={{ fontSize: 12.5, color: "#9C4A33" }}>{error}</div>}

        <button type="submit" disabled={loading}
          style={{ marginTop: 8, padding: 10, borderRadius: 8, border: "none", background: "#204D3E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
          {loading ? "Chwileczkę…" : mode === "login" ? "Zaloguj się" : "Zarejestruj się"}
        </button>

        <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}
          style={{ background: "none", border: "none", color: "#5B6478", fontSize: 12.5, cursor: "pointer", marginTop: 4 }}>
          {mode === "login" ? "Nie masz konta? Zarejestruj się" : "Masz już konto? Zaloguj się"}
        </button>
      </form>
    </div>
  );
}
