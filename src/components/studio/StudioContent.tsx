"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent } from "@/lib/content";
import { Hex } from "@/components/ui/Hex";

export function StudioContent() {
  const { t, lang } = useT();
  const s = getContent(lang).studio;
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("studioPage.kicker")}
          </span>
          <h1>{s.title}</h1>
          <p className="lead">{s.lead}</p>
        </div>
        <div className="studio-sections">
          {s.sections.map((sec, i) => (
            <div className="studio-section" key={i}>
              <h2>{sec.h}</h2>
              <p className="muted">{sec.p}</p>
            </div>
          ))}
        </div>
        <div className="mt-l home-cta">
          <Link className="btn btn-primary" href="/support">
            {t("nav.support")}
          </Link>
          <Link className="btn btn-secondary" href="/apps">
            {t("home.browseApps")}
          </Link>
        </div>
      </div>
    </section>
  );
}
