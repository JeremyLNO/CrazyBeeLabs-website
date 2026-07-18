"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useT } from "@/lib/i18n/LanguageProvider";

export function AccountNav() {
  const path = usePathname();
  const { t } = useT();
  const { data: session } = useSession();
  const isAdmin = session?.user?.isAdmin;

  const items: [string, string][] = [
    ["/account", t("account.navOverview")],
    ["/account/licenses", t("account.navLicenses")],
    ["/account/invoices", t("account.navInvoices")],
    ...(isAdmin ? ([["/admin", t("account.navAdmin")]] as [string, string][]) : []),
  ];

  return (
    <nav className="account-nav" aria-label="Account">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className={path === href ? "active" : ""}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
