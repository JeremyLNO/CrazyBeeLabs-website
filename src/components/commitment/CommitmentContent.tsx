"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent, getAppCopy } from "@/lib/content";
import { getShowcaseApp, type ShowcaseApp } from "@/lib/showcase";
import { Hex } from "@/components/ui/Hex";
import { appGradientCss as grad } from "@/lib/appGradients";
import { AccentTitle } from "@/lib/text";

/** Apps this commitment is actually about — kept to a short, honest list. */
const HEALTH_APP_SLUGS = ["cycles", "respire", "pillo"];

const VALUE_ICONS = [
  <path key="g" d="M20 7h-3.2a2.5 2.5 0 0 0-4.8-1.4A2.5 2.5 0 0 0 7.2 7H4v4h16V7Z" />,
  <path key="h" d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" />,
  <path key="l" d="M12 3c0 9-4.5 10.5-4.5 10.5S3 12 3 8c4-2 9-3 9-5Z" />,
  <path key="ha" d="m11 15-3-3 1.4-1.4L11 12.2l4.6-4.6L17 9l-6 6Z" />,
];
const VALUE_COLORS = ["", "pink", "green", "violet"];

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

function HealthAppCard({ app, lang, learnMore }: { app: ShowcaseApp; lang: string; learnMore: string }) {
  const tagline = getAppCopy(lang as never, app.slug)?.tagline ?? app.tagline;
  return (
    <Link href={app.href} className="home2-fcard home2-reveal health-app-card">
      <div className="home2-fcard-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="home2-appicon" src={app.icon} alt="" style={{ width: 44, height: 44 }} />
        <div>
          <div className="home2-fcard-name">{app.name}</div>
          <span className="badge badge-active health-app-free">FREE</span>
        </div>
      </div>
      <div className="home2-mock">
        <div className="home2-mock-bar" style={{ background: grad(app.slug) }}>
          <span />
          <span />
          <span />
        </div>
        <div className="home2-mock-body">
          <div className="home2-bar" style={{ width: "65%", opacity: 0.9 }} />
          <div className="home2-bar" style={{ width: "85%" }} />
        </div>
      </div>
      <p className="home2-fcard-desc">{tagline}</p>
      <span className="health-app-learn">{learnMore} →</span>
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
            <h1 className="mt-s"><AccentTitle text={c.title} /></h1>
            <p className="lead mt-s">{c.lead}</p>
            <div className="trust-inline">
              <div className="trust-inline-item">
                <span className="trust-inline-icon pink" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" /></svg>
                </span>
                <div>
                  <div className="trust-inline-title">{t("home2.trust1Title")}</div>
                  <div className="trust-inline-sub">{t("home2.trust1Body")}</div>
                </div>
              </div>
              <div className="trust-inline-item">
                <span className="trust-inline-icon green" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>
                </span>
                <div>
                  <div className="trust-inline-title">{t("home2.trust2Title")}</div>
                  <div className="trust-inline-sub">{t("home2.trust2Body")}</div>
                </div>
              </div>
              <div className="trust-inline-item">
                <span className="trust-inline-icon violet" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7 9 18l-5-5" /></svg>
                </span>
                <div>
                  <div className="trust-inline-title">{t("home2.trust4Title")}</div>
                  <div className="trust-inline-sub">{t("home2.trust4Body")}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="editorial-hero-visual" aria-hidden="true">
            <div className="editorial-hero-visual-inner">
              <div className="editorial-hero-glyph">
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#B7791F" strokeWidth="1.6">
                  <path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" />
                </svg>
              </div>
            </div>
            <div className="hero-widget hero-widget-1">
              <div className="hero-widget-head">Cycles</div>
              <div className="hero-widget-value">Day 14</div>
            </div>
            <div className="hero-widget hero-widget-2">
              <div className="hero-widget-head">Respire</div>
              <div className="hero-widget-row">
                <span className="hero-widget-dot" /> Session active
              </div>
            </div>
            <span className="hero-bee hero-bee-1">🐝</span>
          </div>
        </div>

        <div className="principle-grid mt-l">
          {c.sections.map((sec, i) => (
            <div className="principle-card" key={i}>
              <span className="principle-num-tag">{String(i + 1).padStart(2, "0")}</span>
              <span className={`principle-icon ${VALUE_COLORS[i]}`} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  {VALUE_ICONS[i]}
                </svg>
              </span>
              <div className="principle-title">{sec.h}</div>
              <p className="principle-body">{renderWithLink(sec.p)}</p>
            </div>
          ))}
        </div>

        {healthApps.length > 0 && (
          <div className="mt-l">
            <h2>{t("commitmentPage.healthAppsTitle")}</h2>
            <div className="commitment-apps-grid mt-m">
              {healthApps.map((app) => (
                <HealthAppCard key={app.slug} app={app} lang={lang} learnMore={t("apps.openApp")} />
              ))}
            </div>
          </div>
        )}

        <div className="cta-band">
          <span className="cta-band-icon" aria-hidden="true">🐝</span>
          <div>
            <h3>{t("commitmentPage.ctaTitle")}</h3>
            <p className="muted mt-s">{t("commitmentPage.ctaBody")}</p>
          </div>
          <Link className="cta-arrow-btn" href="/support" aria-hidden="true" tabIndex={-1}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
          </Link>
          <Link className="btn btn-primary" href="/support">
            {t("nav.support")}
          </Link>
        </div>
      </div>
    </section>
  );
}
