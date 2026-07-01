"use client";

import { AppsExplorer } from "@/components/home/AppsExplorer";
import { Hex } from "@/components/ui/Hex";
import { useT } from "@/lib/i18n/LanguageProvider";

export function OurApps() {
  const { t } = useT();
  return (
    <section className="section">
      <div className="wrap">
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("apps.kicker")}
          </span>
          <h1>{t("apps.title")}</h1>
          <p className="lead">{t("apps.lead")}</p>
        </div>
        <AppsExplorer />
      </div>
    </section>
  );
}
