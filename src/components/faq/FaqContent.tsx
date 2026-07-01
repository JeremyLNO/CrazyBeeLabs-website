"use client";

import { useT } from "@/lib/i18n/LanguageProvider";
import { getContent } from "@/lib/content";
import { Hex } from "@/components/ui/Hex";
import { FaqList } from "@/components/faq/FaqList";

export function FaqContent() {
  const { t, lang } = useT();
  const faq = getContent(lang).globalFaq;
  return (
    <section className="section">
      <div className="wrap wrap-narrow">
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("faqPage.kicker")}
          </span>
          <h1>{t("faqPage.title")}</h1>
          <p className="lead">{t("faqPage.lead")}</p>
        </div>
        <FaqList items={faq} />
      </div>
    </section>
  );
}
