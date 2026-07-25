"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent } from "@/lib/content";
import { Hex } from "@/components/ui/Hex";
import { AccentTitle } from "@/lib/text";

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

const VALUE_ICONS = [
  // person (made by Mac lovers)
  <path key="p" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0" />,
  // wrench (we build what we need)
  <path key="w" d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2 2.5-2.5Z" />,
  // shield (native, minimal, private)
  <path key="s" d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />,
  // bee/independent
  <path key="b" d="M12 8c2 0 3.5 1.6 3.5 4S14 16 12 16s-3.5-1.6-3.5-4S10 8 12 8Zm0-5v3m0 12v2m-7-9h2m10 0h2" />,
];
const VALUE_COLORS = ["", "violet", "green", "pink"];

export function StudioContent() {
  const { t, lang } = useT();
  const s = getContent(lang).studio;
  const values = s.sections.slice(0, 4);
  const closer = s.sections[4];
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="editorial-hero">
          <div>
            <span className="kicker">
              <Hex /> {t("studioPage.kicker")}
            </span>
            <h1 className="mt-s"><AccentTitle text={s.title} /></h1>
            <p className="lead mt-s">{s.lead}</p>
            <div className="trust-inline">
              <div className="trust-inline-item">
                <span className="trust-inline-icon violet" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8c2 0 3.5 1.6 3.5 4S14 16 12 16s-3.5-1.6-3.5-4S10 8 12 8Z" /><path d="M12 3v3m0 12v3m-9-9h3m12 0h3" /></svg>
                </span>
                <div>
                  <div className="trust-inline-title">{t("studioPage.trust1Title")}</div>
                  <div className="trust-inline-sub">{t("studioPage.trust1Body")}</div>
                </div>
              </div>
              <div className="trust-inline-item">
                <span className="trust-inline-icon green" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></svg>
                </span>
                <div>
                  <div className="trust-inline-title">{t("studioPage.trust2Title")}</div>
                  <div className="trust-inline-sub">{t("studioPage.trust2Body")}</div>
                </div>
              </div>
              <div className="trust-inline-item">
                <span className="trust-inline-icon pink" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.35-9.5-8.5C.5 8.5 3 5 6.5 5c2 0 3.5 1.5 5.5 4 2-2.5 3.5-4 5.5-4C21 5 23.5 8.5 21.5 12.5 19 16.65 12 21 12 21Z" /></svg>
                </span>
                <div>
                  <div className="trust-inline-title">{t("studioPage.trust3Title")}</div>
                  <div className="trust-inline-sub">{t("studioPage.trust3Body")}</div>
                </div>
              </div>
            </div>
          </div>
          <div className="editorial-hero-visual" aria-hidden="true">
            <div className="editorial-hero-visual-inner">
              <div className="editorial-hero-glyph">
                <Hex size={92} />
              </div>
            </div>
            <div className="hero-note">{t("studioPage.quote")}</div>
            <span className="hero-bee hero-bee-1">🐝</span>
          </div>
        </div>

        <div className="section-lede mt-l">
          <span className="section-lede-line" aria-hidden="true" />
          <span>{t("studioPage.principlesTitle")}</span>
          <span className="section-lede-line" aria-hidden="true" />
        </div>
        <p className="section-lede-sub">{t("studioPage.principlesSub")}</p>

        <div className="principle-grid mt-m">
          {values.map((sec, i) => (
            <div className="principle-card" key={i}>
              <span className="principle-num-tag">{String(i + 1).padStart(2, "0")}</span>
              <span className={`principle-icon ${VALUE_COLORS[i]}`} aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  {VALUE_ICONS[i]}
                </svg>
              </span>
              <div className="principle-title">{sec.h}</div>
              <p className="principle-body">{renderWithLink(sec.p)}</p>
            </div>
          ))}
        </div>

        {closer && (
          <div className="cta-band">
            <span className="cta-band-icon" aria-hidden="true">🐝</span>
            <div>
              <h3>{closer.h}</h3>
              <p className="muted mt-s" style={{ maxWidth: "56ch" }}>
                {renderWithLink(closer.p)}
              </p>
            </div>
            <Link className="cta-arrow-btn" href="/apps" aria-hidden="true" tabIndex={-1}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14m-6-6 6 6-6 6" /></svg>
            </Link>
            <Link className="btn btn-primary" href="/apps">
              {t("home.browseApps")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
