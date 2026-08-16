"use client";

import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    setLoading(false);

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={loading}
      style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: "#204D3E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
      {loading ? "Przekierowuję…" : "Przejdź na Pro"}
    </button>
  );
}