"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: [string, string][] = [
  ["/admin", "Overview"],
  ["/admin/orders", "Orders"],
  ["/admin/licenses", "Licenses"],
  ["/admin/downloads", "Downloads"],
  ["/admin/database", "Database"],
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="account-nav" aria-label="Admin">
      {ITEMS.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? "active" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
