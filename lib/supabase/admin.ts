import { createClient } from "@supabase/supabase-js";

// Klient administracyjny Supabase - używany WYŁĄCZNIE po stronie serwera,
// nigdy nie trafia do przeglądarki. Pozwala m.in. usunąć konto logowania użytkownika.
export function createSupabaseAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}