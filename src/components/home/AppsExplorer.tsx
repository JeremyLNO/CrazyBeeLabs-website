"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SHOWCASE,
  CATEGORY_ORDER,
  type Category,
  type Device,
  type ShowcaseApp,
} from "@/lib/showcase";
import { getApp } from "@/lib/catalog";
import { getAppCopy } from "@/lib/content";
import { useT } from "@/lib/i18n/LanguageProvider";
import { DownloadButton } from "@/components/apps/DownloadButton";
import { WaitlistButton } from "@/components/apps/WaitlistButton";

const CATS: (Category | "all")[] = ["all", ...CATEGORY_ORDER];
const DEVS: (Device | "all")[] = ["all", "mac", "iphone"];

/** One app put in the spotlight above the grid — kept fixed, not random, so the page is stable across visits. */
const FEATURED_SLUG = "shotbox";

export function AppsExplorer() {
  const { t, lang } = useT();
  const [cat, setCat] = useState<Category | "all">("all");
  const [dev, setDev] = useState<Device | "all">("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const apps = SHOWCASE.filter((a) => {
    if (cat !== "all" && a.category !== cat) return false;
    if (dev !== "all" && a.device !== dev) return false;
    if (!q) return true;
    const tagline = getAppCopy(lang, a.slug)?.tagline ?? a.tagline;
    return a.name.toLowerCase().includes(q) || tagline.toLowerCase().includes(q);
  });

  const featured = !q && cat === "all" && dev === "all"
    ? SHOWCASE.find((a) => a.slug === FEATURED_SLUG)
    : null;

  return (
    <div>
      {featured && <FeaturedApp app={featured} />}

      <div className="filters">
        <div className="app-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("apps.searchPlaceholder")}
            aria-label={t("apps.searchPlaceholder")}
          />
        </div>
        <div className="filter-row" role="group" aria-label="Category">
          {CATS.map((c) => (
            <button
              key={c}
              type="button"
              className={`chip${cat === c ? " active" : ""}`}
              onClick={() => setCat(c)}
            >
              {c === "all" ? t("apps.all") : t(`categories.${c}`)}
            </button>
          ))}
        </div>
        <div className="filter-row" role="group" aria-label="Device">
          {DEVS.map((d) => (
            <button
              key={d}
              type="button"
              className={`chip${dev === d ? " active" : ""}`}
              onClick={() => setDev(d)}
            >
              {d === "all" ? t("apps.allDevices") : t(`devices.${d}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-cards mt-m">
        {apps.map((a) => (
          <AppCard key={a.slug} app={a} />
        ))}
      </div>
      {apps.length === 0 && <p className="muted mt-m">{t("apps.noMatch")}</p>}
    </div>
  );
}

function FeaturedApp({ app }: { app: ShowcaseApp }) {
  const { t, lang } = useT();
  const tagline = getAppCopy(lang, app.slug)?.tagline ?? app.tagline;
  return (
    <Link href={app.href} className="featured-app mb-m">
      <span className="app-icon big has-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt="" />
      </span>
      <div>
        <span className="kicker">{t("apps.featured")}</span>
        <div className="featured-app-name">{app.name}</div>
        <p className="muted mt-s">{tagline}</p>
      </div>
      <span className="btn btn-primary btn-sm featured-app-cta">{t("apps.openApp")}</span>
    </Link>
  );
}

function AppCard({ app }: { app: ShowcaseApp }) {
  const { t, lang } = useT();
  const isMac = app.device === "mac";
  const catalog = isMac ? getApp(app.slug) : undefined;
  const tagline = getAppCopy(lang, app.slug)?.tagline ?? app.tagline;
  // Prices are shown on each app's detail page, not on the cards.
  const priceMain = isMac || app.comingSoon ? null : t("apps.onAppStore");
  const priceNote = app.comingSoon
    ? t("categories.comingSoon")
    : isMac
      ? t("apps.freeTrialNote")
      : t("apps.appStoreNote");

  const Tile = (
    <div className="app-tile">
      <span className="app-icon has-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt="" />
      </span>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{app.name}</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {tagline}
        </div>
      </div>
    </div>
  );

  return (
    <div className="card app-card">
      <Link href={app.href} className="app-card-tile-link" aria-label={app.name}>
        {Tile}
      </Link>

      <div className="card-price">
        {priceMain && <span className="card-price-main">{priceMain}</span>}
        <span className="card-price-note">{priceNote}</span>
      </div>

      <div className="row-between mt-m">
        <span className="device-pill">{t(`devices.${app.device}`)}</span>
        <div className="app-card-actions">
          <Link className="link-btn" href={app.href}>
            {t("apps.openApp")}
          </Link>
          {app.comingSoon ? (
            <WaitlistButton appSlug={app.slug} appName={app.name} className="btn btn-secondary btn-sm" />
          ) : isMac ? (
            <DownloadButton appSlug={app.slug} appName={app.name} downloadUrl={catalog?.downloadUrl} />
          ) : (
            <a
              className="btn btn-accent btn-sm"
              href={app.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("apps.download")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
