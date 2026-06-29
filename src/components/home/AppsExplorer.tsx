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

function AppCard({ app }: { app: ShowcaseApp }) {
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
