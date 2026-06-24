"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: [string, string][] = [
  ["/account", "Overview"],
  ["/account/licenses", "Licenses"],
  ["/account/invoices", "Invoices"],
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav className="account-nav" aria-label="Account">
      {ITEMS.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? "active" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
