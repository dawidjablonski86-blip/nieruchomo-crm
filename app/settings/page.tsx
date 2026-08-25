import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import UpgradeButton from "@/components/UpgradeButton";
import DeleteAccountButton from "@/components/DeleteAccountButton";

export default async function SettingsPage({ searchParams }: { searchParams: { success?: string; canceled?: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (!user) redirect("/dashboard");

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Ustawienia</h1>

        {searchParams.success && (
          <div style={{ background: "#E4EEE9", color: "#204D3E", padding: 12, borderRadius: 8, marginTop: 16, fontSize: 13.5 }}>
            Płatność zakończona sukcesem! Twój plan zostanie zaktualizowany za chwilę.
          </div>
        )}
        {searchParams.canceled && (
          <div style={{ background: "#EDEAE0", color: "#8A93A6", padding: 12, borderRadius: 8, marginTop: 16, fontSize: 13.5 }}>
            Płatność anulowana.
          </div>
        )}

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#8A93A6", textTransform: "uppercase", fontWeight: 700 }}>Twój plan</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
            {user.plan === "pro" ? "Pro" : "Darmowy"}
          </div>

          {user.plan !== "pro" && (
            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 13, color: "#5B6478", marginBottom: 10 }}>
                Plan Pro daje wyższe limity klientów i nieruchomości oraz priorytetowe wsparcie.
              </p>
              <UpgradeButton />
            </div>
          )}
        </div>

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, padding: 20, marginTop: 16 }}>
          <div style={{ fontSize: 12, color: "#8A93A6", textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }}>
            Strefa zagrożenia
          </div>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}