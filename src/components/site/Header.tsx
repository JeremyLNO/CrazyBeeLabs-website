"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CartButton } from "@/components/cart/CartButton";
import { LanguageSwitcher } from "@/components/site/LanguageSwitcher";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CATEGORY_ORDER, showcaseByCategory } from "@/lib/showcase";

export function Header() {
  const { t } = useT();
  const { data: session } = useSession();
  const { openAuth } = useAuthModal();
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] || null;

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="brand" aria-label="Crazy Bee Labs — home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-wordmark.png" alt="Crazy Bee Labs" className="brand-wordmark" />
        </Link>

        <nav className="header-nav" aria-label="Primary">
          <div className="has-mega">
            <Link href="/apps" className="mega-trigger">
              {t("nav.ourApps")}
              <span className="mega-caret" aria-hidden="true">▾</span>
            </Link>
            <div className="mega" role="menu">
              <div className="mega-inner">
                {CATEGORY_ORDER.map((cat) => {
                  const apps = showcaseByCategory(cat);
                  return (
                    <div className="mega-col" key={cat}>
                      <div className="mega-col-title">{t(`categories.${cat}`)}</div>
                      {apps.length ? (
                        <ul>
                          {apps.map((a) => (
                            <li key={a.slug}>
                              {a.external ? (
                                <a href={a.href} target="_blank" rel="noopener noreferrer">
                                  {a.name}
                                </a>
                              ) : (
                                <Link href={a.href}>{a.name}</Link>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mega-empty">{t("categories.comingSoon")}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <Link href="/studio">{t("footer.studio")}</Link>
          <Link href="/commitment">{t("footer.commitment")}</Link>
          <Link href="/support">{t("nav.support")}</Link>
        </nav>

        <div className="header-actions">
          <LanguageSwitcher />
          <CartButton />
          {user ? (
            <Link href="/account" className="btn btn-primary btn-sm">
              {firstName ? t("nav.greeting", { name: firstName }) : t("nav.account")}
            </Link>
          ) : (
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => openAuth()}
              >
                {t("nav.login")}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => openAuth()}
              >
                {t("nav.createAccount")}
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
