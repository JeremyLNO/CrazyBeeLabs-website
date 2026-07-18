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
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("commitmentPage.kicker")}
          </span>
          <h1>{c.title}</h1>
          <p className="lead">{c.lead}</p>
        </div>
        <div className="studio-sections">
          {c.sections.map((sec, i) => (
            <div className="studio-section" key={i}>
              <h2>{sec.h}</h2>
              <p className="muted">{renderWithLink(sec.p)}</p>
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
