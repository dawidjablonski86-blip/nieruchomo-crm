"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PropertyPhotoUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? "anon";
    const filePath = `${userId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("property-photos").upload(filePath, file);

    setUploading(false);

    if (uploadError) {
      setError("Nie udało się wgrać zdjęcia: " + uploadError.message);
      return;
    }

    const { data } = supabase.storage.from("property-photos").getPublicUrl(filePath);
    setPreviewUrl(data.publicUrl);
    onUploaded(data.publicUrl);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <span style={{ fontSize: 12, color: "#94A3B8" }}>Wgrywam…</span>}
      {error && <span style={{ fontSize: 12, color: "#DC2626" }}>{error}</span>}
      {previewUrl && (
        <img src={previewUrl} alt="Podgląd zdjęcia" style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, border: "1px solid #E2E8F0" }} />
      )}
    </div>
  );
}