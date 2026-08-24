"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint, confirmText }: { endpoint: string; confirmText?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(confirmText || "Czy na pewno chcesz usunąć?")) return;
    setLoading(true);
    await fetch(endpoint, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      style={{ background: "none", border: "none", color: "#DC2626", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>
      {loading ? "…" : "Usuń"}
    </button>
  );
}