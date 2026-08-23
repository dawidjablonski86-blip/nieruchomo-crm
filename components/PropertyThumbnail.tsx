"use client";

import { useState } from "react";

export default function PropertyThumbnail({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return <div style={{ width: 48, height: 48, borderRadius: 8, background: "#F1F5F9", flexShrink: 0 }} />;
  }

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  function next(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % photos.length);
  }

  function prev(e: React.MouseEvent) {
    e.stopPropagation();
    setIndex((prevIndex) => (prevIndex - 1 + photos.length) % photos.length);
  }

  return (
    <>
      <img
        src={photos[0]}
        alt={title}
        onClick={() => openAt(0)}
        style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8, flexShrink: 0, cursor: "pointer" }}
      />

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, padding: 20,
          }}
        >
          <button onClick={() => setOpen(false)}
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", fontSize: 28, cursor: "pointer" }}>
            ×
          </button>

          {photos.length > 1 && (
            <button onClick={prev}
              style={{ position: "absolute", left: 20, background: "none", border: "none", color: "#fff", fontSize: 36, cursor: "pointer" }}>
              ‹
            </button>
          )}

          <img
            src={photos[index]}
            alt={title}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "90%", maxHeight: "85vh", borderRadius: 12, objectFit: "contain" }}
          />

          {photos.length > 1 && (
            <button onClick={next}
              style={{ position: "absolute", right: 20, background: "none", border: "none", color: "#fff", fontSize: 36, cursor: "pointer" }}>
              ›
            </button>
          )}

          {photos.length > 1 && (
            <div style={{ position: "absolute", bottom: 20, color: "#fff", fontSize: 13 }}>
              {index + 1} / {photos.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}