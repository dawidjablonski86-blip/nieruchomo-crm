"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function PropertyPhotoUpload({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const supabase = createSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id ?? "anon";

    const newUrls: string[] = [];

    for (const file of Array.from(files)) {
      const filePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("property-photos").upload(filePath, file);
      if (uploadError) {
        setError("Nie udało się wgrać jednego ze zdjęć: " + uploadError.message);
        continue;
      }
      const { data } = supabase.storage.from("property-photos").getPublicUrl(filePath);
      newUrls.push(data.publicUrl);
    }

    setUploading(false);
    onChange([...photos, ...newUrls]);
    e.target.value = "";
  }

  function removePhoto(url: string) {
    onChange(photos.filter((p) => p !== url));
  }

  return (
    <div>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} disabled={uploading} />
      {uploading && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>Wgrywam…</div>}
      {error && <div style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{error}</div>}

      {photos.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
          {photos.map((url) => (
            <div key={url} style={{ position: "relative" }}>
              <img src={url} alt="Zdjęcie nieruchomości" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #E2E8F0" }} />
              <button type="button" onClick={() => removePhoto(url)}
                style={{
                  position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                  background: "#DC2626", color: "#fff", border: "2px solid #fff", fontSize: 11, lineHeight: "16px",
                  cursor: "pointer", padding: 0,
                }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}