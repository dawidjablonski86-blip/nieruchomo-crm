import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Nav from "@/components/Nav";
import NewPropertyForm from "@/components/NewPropertyForm";

const PROPERTY_LIMIT_FREE = 50;
const PROPERTY_LIMIT_PRO = 200;

export default async function PropertiesPage() {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.upsert({
    where: { id: authUser.id },
    update: {},
    create: { id: authUser.id, email: authUser.email ?? "" },
  });

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const propertyCount = properties.length;
  const propertyLimit = user.plan === "pro" ? PROPERTY_LIMIT_PRO : PROPERTY_LIMIT_FREE;

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontSize: 22 }}>Nieruchomości</h1>
        <p style={{ color: "#8A93A6", fontSize: 13, marginTop: 4 }}>
          {propertyCount} / {propertyLimit} {user.plan === "pro" && "(plan Pro)"}
        </p>

        <NewPropertyForm />

        <div style={{ background: "#fff", border: "1px solid #E2DCC9", borderRadius: 10, overflow: "hidden", marginTop: 16 }}>
          {properties.length === 0 && <div style={{ padding: 16, color: "#8A93A6", fontSize: 13 }}>Brak nieruchomości — dodaj pierwszą powyżej.</div>}
          {properties.map((p) => (
            <div key={p.id} style={{ padding: "12px 16px", borderBottom: "1px solid #EBE6D6", fontSize: 13.5 }}>
              <strong>{p.title}</strong>
              <span style={{ color: "#8A93A6" }}> — {p.address} {p.price ? `— ${p.price.toLocaleString("pl-PL")} zł` : ""}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}