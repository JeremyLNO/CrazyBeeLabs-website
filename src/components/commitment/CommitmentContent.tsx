"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent, getAppCopy } from "@/lib/content";
import { getShowcaseApp, type ShowcaseApp } from "@/lib/showcase";
import { Hex } from "@/components/ui/Hex";

/** Apps this commitment is actually about — kept to a short, honest list. */
const HEALTH_APP_SLUGS = ["cycles", "respire", "pillo"];

/** Renders a paragraph, turning a ⟨…⟩-marked phrase into a link to /support. */
function renderWithLink(p: string) {
  const m = p.match(/^(.*)⟨(.*)⟩(.*)$/);
  if (!m) return p;
  return (
    <>
      {m[1]}
      <Link className="text-link" href="/support">
        {m[2]}
      </Link>
      {m[3]}
    </>
  );
}

function HealthAppCard({ app, lang }: { app: ShowcaseApp; lang: string }) {
  const tagline = getAppCopy(lang as never, app.slug)?.tagline ?? app.tagline;
  return (
    <Link href={app.href} className="home2-ccard home2-reveal">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="home2-appicon" src={app.icon} alt="" style={{ width: 48, height: 48 }} />
      <div className="home2-ccard-text">
        <div className="home2-ccard-name">{app.name}</div>
        <div className="home2-ccard-tag">{tagline}</div>
      </div>
    </Link>
  );
}

export function CommitmentContent() {
  const { t, lang } = useT();
  const c = getContent(lang).commitment;
  const healthApps = HEALTH_APP_SLUGS.map(getShowcaseApp).filter(
    (a): a is ShowcaseApp => !!a,
  );
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="editorial-hero">
          <div>
            <span className="kicker">
              <Hex /> {t("commitmentPage.kicker")}
            </span>
            <h1 className="mt-s">{c.title}</h1>
            <p className="lead mt-s">{c.lead}</p>
          </div>
          <div className="editorial-hero-visual" aria-hidden="true">
            <div className="editorial-hero-glyph">
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth="1.6">
                <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="principle-grid mt-l">
          {c.sections.map((sec, i) => (
            <div className="principle-card" key={i}>
              <span className="principle-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="principle-title">{sec.h}</div>
              <p className="principle-body">{renderWithLink(sec.p)}</p>
            </div>
          ))}
        </div>

        {healthApps.length > 0 && (
          <div className="mt-l">
            <h2>{t("commitmentPage.healthAppsTitle")}</h2>
            <div className="commitment-apps mt-m">
              {healthApps.map((app) => (
                <HealthAppCard key={app.slug} app={app} lang={lang} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
