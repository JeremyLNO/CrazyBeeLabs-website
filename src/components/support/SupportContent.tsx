"use client";

import { Hex } from "@/components/ui/Hex";
import { SupportForm } from "@/components/support/SupportForm";
import { useT } from "@/lib/i18n/LanguageProvider";

export function SupportContent({
  initialEmail = "",
  initialFirstName = "",
}: {
  initialEmail?: string;
  initialFirstName?: string;
}) {
  const { t } = useT();
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("support.kicker")}
          </span>
          <h1>{t("support.title")}</h1>
          <p className="lead">{t("support.lead")}</p>
        </div>
        <SupportForm initialEmail={initialEmail} initialFirstName={initialFirstName} />
      </div>
    </section>
  );
}
