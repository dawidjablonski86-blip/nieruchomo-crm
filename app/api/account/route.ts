import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

// DELETE /api/account - usuwa wszystkie dane użytkownika oraz jego konto logowania (RODO)
export async function DELETE() {
  const authUser = await getCurrentUser();
  if (!authUser) return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });

  // Usuwa profil z naszej bazy. Klienci, nieruchomości, zadania, itd. kasują się
  // automatycznie razem z nim (skonfigurowane w schemacie jako onDelete: Cascade).
  await prisma.user.delete({ where: { id: authUser.id } }).catch(() => {
    // Jeśli rekordu profilu nie było (np. user nigdy nie odwiedził dashboardu), to nic się nie stało.
  });

  // Usuwa samo konto logowania (e-mail, hasło) z Supabase Auth.
  const adminClient = createSupabaseAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(authUser.id);

  if (error) {
    return NextResponse.json({ error: "Nie udało się usunąć konta logowania: " + error.message }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}