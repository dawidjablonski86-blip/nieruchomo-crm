"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button onClick={handleSignOut} style={{ background: "none", border: "none", color: "#5B6478", fontSize: 12.5, cursor: "pointer", padding: 0 }}>
      Wyloguj się
    </button>
  );
}