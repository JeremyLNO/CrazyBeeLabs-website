"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent, type LegalSlug } from "@/lib/content";
import { Hex } from "@/components/ui/Hex";

export function LegalView({ doc }: { doc: LegalSlug }) {
  const { t, lang } = useT();
  const d = getContent(lang).legal[doc];
  return (
    <section className="section">
      <div className="wrap wrap-narrow legal-doc">
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("legalPage.kicker")}
          </span>
          <h1>{d.title}</h1>
          <p className="muted">
            {t("legalPage.updated")}: {d.updated}
          </p>
        </div>
        {d.sections.map((s, i) => (
          <div className="legal-section" key={i}>
            <h2>{s.h}</h2>
            <p>{s.p}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
