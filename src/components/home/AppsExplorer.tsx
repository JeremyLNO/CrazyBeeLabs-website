"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SHOWCASE,
  CATEGORY_LABELS,
  DEVICE_LABELS,
  type Category,
  type Device,
  type ShowcaseApp,
} from "@/lib/showcase";
import { getApp } from "@/lib/catalog";

const CATS: (Category | "all")[] = ["all", "work-smarter", "personal", "games"];
const DEVS: (Device | "all")[] = ["all", "mac", "iphone", "web"];

export function AppsExplorer() {
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
              {c === "all" ? "All" : CATEGORY_LABELS[c]}
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
              {d === "all" ? "All devices" : DEVICE_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-cards mt-m">
        {apps.map((a) => (
          <AppCard key={a.slug} app={a} />
        ))}
      </div>
      {apps.length === 0 && (
        <p className="muted mt-m">No apps match these filters.</p>
      )}
    </div>
  );
}

/** Price/availability line shown on each card. */
function priceMeta(app: ShowcaseApp): { price: string; note: string } {
  if (app.device === "mac") {
    const from = getApp(app.slug)?.plans[0]?.priceLabel;
    return {
      price: from ? `From ${from}` : "Licensed here",
      note: "Free download · 7-day trial",
    };
  }
  if (app.device === "iphone") {
    return { price: "On the App Store", note: "Free download" };
  }
  return { price: "Free", note: "Play in your browser" };
}

function AppCard({ app }: { app: ShowcaseApp }) {
  const meta = priceMeta(app);
  return (
    <div className="card">
      <div className="app-tile">
        <span className={`app-icon${app.icon ? " has-img" : " glyph-tile"}`}>
          {app.icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={app.icon} alt="" />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: app.glyph ?? "" }} />
          )}
        </span>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
            {app.name}
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            {app.tagline}
          </div>
        </div>
      </div>

      <div className="card-price">
        <span className="card-price-main">{meta.price}</span>
        <span className="card-price-note">{meta.note}</span>
      </div>

      <div className="row-between mt-m">
        <span className="device-pill">{DEVICE_LABELS[app.device]}</span>
        {app.external ? (
          <a
            className="btn btn-accent btn-sm"
            href={app.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {app.cta}
          </a>
        ) : (
          <Link className="btn btn-accent btn-sm" href={app.href}>
            {app.cta}
          </Link>
        )}
      </div>
    </div>
  );
}
