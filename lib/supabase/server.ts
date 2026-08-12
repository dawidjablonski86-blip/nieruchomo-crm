import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Używany w Server Components, Server Actions i Route Handlers (app/api/**).
// Czyta sesję użytkownika z ciasteczek żądania.
export function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Wywołanie z Server Component (bez zapisu) - middleware.ts i tak odświeży sesję.
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {}
        },
      },
    }
  );
}

// Zwraca zalogowanego użytkownika albo null. Użyj na początku każdej chronionej
// strony/route'a, żeby wiedzieć, czyje dane pobierać z Prisma.
export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
