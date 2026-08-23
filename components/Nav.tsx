"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import SignOutButton from "./SignOutButton";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Klienci" },
  { href: "/properties", label: "Nieruchomości" },
  { href: "/tasks", label: "Zadania" },
  { href: "/calendar", label: "Kalendarz" },
  { href: "/contacts", label: "Kontakty" },
  { href: "/notes", label: "Notatki" },
  { href: "/matching", label: "Matching" },
  { href: "/transactions", label: "Transakcje" },
  { href: "/settings", label: "Ustawienia" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid #E2E8F0", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{
        maxWidth: 900, margin: "0 auto", padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} style={{
                fontSize: 15.5, fontWeight: 600, textDecoration: "none",
                padding: "7px 12px", borderRadius: 8,
                color: active ? "#2563EB" : "#475569",
                background: active ? "#EFF6FF" : "transparent",
              }}>
                {link.label}
              </Link>
            );
          })}
        </div>
        <div style={{ color: "#475569" }}>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}