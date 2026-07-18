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

export function CommitmentContent() {
  const { t, lang } = useT();
  const c = getContent(lang).commitment;
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
        <div className="mt-l home-cta">
          <Link className="btn btn-primary" href="/apps">
            {t("home.browseApps")}
          </Link>
        </div>
      </div>
    </section>
  );
}
