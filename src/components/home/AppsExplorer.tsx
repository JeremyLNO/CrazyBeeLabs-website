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
import { useT } from "@/lib/i18n/LanguageProvider";
import { DownloadButton } from "@/components/apps/DownloadButton";

const CATS: (Category | "all")[] = ["all", ...CATEGORY_ORDER];
const DEVS: (Device | "all")[] = ["all", "mac", "iphone"];

export function AppsExplorer() {
  const { t } = useT();
  const [cat, setCat] = useState<Category | "all">("all");
  const [dev, setDev] = useState<Device | "all">("all");

  const apps = SHOWCASE.filter(
    (a) => (cat === "all" || a.category === cat) && (dev === "all" || a.device === dev),
  );

  return (
    <div>
      <div className="filters">
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

function AppCard({ app }: { app: ShowcaseApp }) {
  const { t } = useT();
  const isMac = app.device === "mac";
  const catalog = isMac ? getApp(app.slug) : undefined;
  const priceMain = isMac
    ? catalog?.plans[0]
      ? `${t("apps.from")} ${catalog.plans[0].priceLabel}`
      : t("apps.free")
    : t("apps.onAppStore");
  const priceNote = isMac ? t("apps.freeTrialNote") : t("apps.appStoreNote");

  const Tile = (
    <div className="app-tile">
      <span className="app-icon has-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.icon} alt="" />
      </span>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{app.name}</div>
        <div className="muted" style={{ fontSize: 13 }}>
          {app.tagline}
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
        <span className="card-price-main">{priceMain}</span>
        <span className="card-price-note">{priceNote}</span>
      </div>

      <div className="row-between mt-m">
        <span className="device-pill">{t(`devices.${app.device}`)}</span>
        <div className="app-card-actions">
          <Link className="link-btn" href={app.href}>
            {t("apps.openApp")}
          </Link>
          {isMac ? (
            <DownloadButton appName={app.name} downloadUrl={catalog?.downloadUrl} />
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
