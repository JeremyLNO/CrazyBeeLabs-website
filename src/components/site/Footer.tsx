"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";

export function Footer() {
  const { t } = useT();
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="brand" aria-label="Crazy Bee Labs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Crazy Bee Labs" />
            </Link>
            <p className="muted">{t("footer.tagline")}</p>
          </div>

          <nav className="footer-col" aria-label={t("nav.ourApps")}>
            <Link href="/apps">{t("nav.ourApps")}</Link>
            <Link href="/studio">{t("footer.studio")}</Link>
            <Link href="/faq">{t("footer.faq")}</Link>
            <Link href="/support">{t("nav.support")}</Link>
          </nav>

          <nav className="footer-col" aria-label={t("footer.account")}>
            <Link href="/account">{t("footer.account")}</Link>
            <Link href="/login">{t("footer.login")}</Link>
          </nav>

          <nav className="footer-col" aria-label={t("footer.legalTitle")}>
            <Link href="/legal/privacy">{t("footer.privacy")}</Link>
            <Link href="/legal/terms">{t("footer.terms")}</Link>
            <Link href="/legal/refund">{t("footer.refund")}</Link>
            <Link href="/legal/notice">{t("footer.notice")}</Link>
            <Link href="/legal/apps">{t("footer.appsPrivacy")}</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Crazy Bee Labs</span>
        </div>
      </div>
    </footer>
  );
}
