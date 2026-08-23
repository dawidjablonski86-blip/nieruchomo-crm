import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import EditPropertyForm from "@/components/EditPropertyForm";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const property = await prisma.property.findFirst({
    where: { id: params.id, userId: authUser.id },
  });

  if (!property) notFound();

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <Link href="/properties" style={{ fontSize: 12.5, color: "#475569", textDecoration: "none" }}>← Wróć do listy nieruchomości</Link>
        <h1 style={{ fontSize: 22, marginTop: 10 }}>Edytuj: {property.title}</h1>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginTop: 16 }}>
          <EditPropertyForm property={property} />
        </div>
      </div>
    </div>
  );
}