"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STAGES = ["LEAD", "KONTAKT", "SPOTKANIE", "PREZENTACJA", "NEGOCJACJE", "UMOWA", "ZAKONCZONA"];
const STAGE_LABELS: Record<string, string> = {
  LEAD: "Lead",
  KONTAKT: "Kontakt",
  SPOTKANIE: "Spotkanie",
  PREZENTACJA: "Prezentacja",
  NEGOCJACJE: "Negocjacje",
  UMOWA: "Umowa",
  ZAKONCZONA: "Zakończona",
};

type Props = {
  id: string;
  stage: string;
  clientName: string;
  propertyTitle: string;
};

export default function TransactionCard({ id, stage, clientName, propertyTitle }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const currentIndex = STAGES.indexOf(stage);
  const nextStage = STAGES[currentIndex + 1];
  const isLast = currentIndex === STAGES.length - 1;

  async function moveToNextStage() {
    if (!nextStage) return;
    setLoading(true);
    await fetch("/api/transactions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stage: nextStage }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <div>
        <strong>{clientName}</strong>
        <span style={{ color: "#94A3B8" }}> ↔ {propertyTitle}</span>
        <div style={{ marginTop: 4 }}>
          <span style={{ fontSize: 11.5, padding: "3px 9px", borderRadius: 999, background: "#EFF6FF", color: "#2563EB", fontWeight: 600 }}>
            {STAGE_LABELS[stage]}
          </span>
        </div>
      </div>
      {!isLast && (
        <button onClick={moveToNextStage} disabled={loading}
          style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#2563EB", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          {loading ? "…" : `Przesuń do: ${STAGE_LABELS[nextStage]} →`}
        </button>
      )}
    </div>
  );
}