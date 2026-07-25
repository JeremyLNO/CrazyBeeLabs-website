"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent } from "@/lib/content";
import { Hex } from "@/components/ui/Hex";

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
            <h1 className="mt-s">{s.title}</h1>
            <p className="lead mt-s">{s.lead}</p>
          </div>
          <div className="editorial-hero-visual" aria-hidden="true">
            <div className="editorial-hero-glyph">
              <Hex size={92} />
            </div>
            <div className="editorial-quote">
              <div className="editorial-quote-stars">🐝🐝🐝</div>
              <p>Small studio. Big focus.</p>
              <span>Crazy Bee Labs</span>
            </div>
          </div>
        </div>

        <div className="principle-grid mt-l">
          {values.map((sec, i) => (
            <div className="principle-card" key={i}>
              <span className="principle-num">{String(i + 1).padStart(2, "0")}</span>
              <div className="principle-title">{sec.h}</div>
              <p className="principle-body">{renderWithLink(sec.p)}</p>
            </div>
          ))}
        </div>

        {closer && (
          <div className="cta-band">
            <div>
              <h3>{closer.h}</h3>
              <p className="muted mt-s" style={{ maxWidth: "56ch" }}>
                {renderWithLink(closer.p)}
              </p>
            </div>
            <Link className="btn btn-primary" href="/apps">
              {t("home.browseApps")}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
