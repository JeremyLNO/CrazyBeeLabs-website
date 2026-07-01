"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";

export function Footer() {
  const { t } = useT();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Crazy Bee Labs">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Crazy Bee Labs" />
        </Link>
        <div className="footer-links">
          <Link href="/account">{t("footer.account")}</Link>
          <Link href="/support">{t("footer.support")}</Link>
        </div>
        <span style={{ fontSize: 13 }}>© 2026 Crazy Bee Labs</span>
      </div>
    </footer>
  );
}
