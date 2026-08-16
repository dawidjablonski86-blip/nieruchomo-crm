import Link from "next/link";
import SignOutButton from "./SignOutButton";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clients", label: "Klienci" },
  { href: "/properties", label: "Nieruchomości" },
  { href: "/tasks", label: "Zadania" },
  { href: "/calendar", label: "Kalendarz" },
  { href: "/contacts", label: "Kontakty" },
];

export default function Nav() {
  return (
    <div style={{ borderBottom: "1px solid #E2DCC9", background: "#fff" }}>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} style={{ fontSize: 13.5, fontWeight: 600, color: "#182338", textDecoration: "none" }}>
              {link.label}
            </Link>
          ))}
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}