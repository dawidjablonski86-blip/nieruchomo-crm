import { getCurrentUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/Nav";
import EditClientForm from "@/components/EditClientForm";

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const authUser = await getCurrentUser();
  if (!authUser) redirect("/login");

  const client = await prisma.client.findFirst({
    where: { id: params.id, userId: authUser.id },
  });

  if (!client) notFound();

  return (
    <div>
      <Nav />
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "40px 20px" }}>
        <Link href="/clients" style={{ fontSize: 12.5, color: "#475569", textDecoration: "none" }}>← Wróć do listy klientów</Link>
        <h1 style={{ fontSize: 22, marginTop: 10 }}>Edytuj: {client.firstName} {client.lastName}</h1>

        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 16, marginTop: 16 }}>
          <EditClientForm client={client} />
        </div>
      </div>
    </div>
  );
}