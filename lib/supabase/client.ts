import { createBrowserClient } from "@supabase/ssr";

// Używany w komponentach klienckich ("use client"), np. na ekranie logowania.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
