"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import { CATALOG, type PlanInterval } from "@/lib/catalog";
import { SHOWCASE, getShowcaseApp } from "@/lib/showcase";
import { Hex } from "@/components/ui/Hex";

const COL_KEYS: Record<PlanInterval, string> = {
  month: "pricingPage.colMonthly",
  quarter: "pricingPage.colQuarterly",
  year: "pricingPage.colAnnual",
  lifetime: "pricingPage.colLifetime",
};
const COL_ORDER: PlanInterval[] = ["month", "quarter", "year", "lifetime"];

export function PricingContent() {
  const { t } = useT();
  const catalogSlugs = new Set(CATALOG.map((a) => a.slug));
  const freeApps = SHOWCASE.filter(
    (a) => a.device === "iphone" && !catalogSlugs.has(a.slug),
  );

  return (
    <section className="section">
      <div className="wrap">
        <div className="page-head">
          <span className="kicker">
            <Hex /> {t("pricingPage.kicker")}
          </span>
          <h1>{t("pricingPage.title")}</h1>
          <p className="lead">{t("pricingPage.lead")}</p>
        </div>

        {freeApps.length > 0 && (
          <>
            <h2 className="mt-l">{t("pricingPage.freeAppsTitle")}</h2>
            <div className="table-wrap mt-m">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{t("pricingPage.colApp")}</th>
                    <th>{t("pricingPage.colPrice")}</th>
                  </tr>
                </thead>
                <tbody>
                  {freeApps.map((app) => (
                    <tr key={app.slug}>
                      <td>
                        <Link href={app.href}>{app.name}</Link>
                      </td>
                      <td>{app.comingSoon ? t("pricingPage.comingSoonNote") : t("pricingPage.freeOnAppStore")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <h2 className="mt-l">{t("pricingPage.paidAppsTitle")}</h2>
        <div className="table-wrap mt-m">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("pricingPage.colApp")}</th>
                {COL_ORDER.map((interval) => (
                  <th key={interval}>{t(COL_KEYS[interval])}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CATALOG.map((app) => {
                const showcase = getShowcaseApp(app.slug);
                const comingSoon = showcase?.comingSoon;
                return (
                  <tr key={app.slug}>
                    <td>
                      <Link href={`/apps/${app.slug}`}>{app.name}</Link>
                      {comingSoon && (
                        <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>
                          ({t("pricingPage.comingSoonNote")})
                        </span>
                      )}
                    </td>
                    {COL_ORDER.map((interval) => (
                      <td key={interval}>
                        {app.plans.find((p) => p.interval === interval)?.priceLabel ?? "—"}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="form-note mt-m">{t("pricingPage.note")}</p>
      </div>
    </section>
  );
}
