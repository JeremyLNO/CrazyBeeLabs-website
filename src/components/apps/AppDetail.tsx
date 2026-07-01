"use client";

import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { DownloadButton } from "@/components/apps/DownloadButton";
import { useT } from "@/lib/i18n/LanguageProvider";
import type { PlanInterval } from "@/lib/catalog";

export interface DetailPlan {
  interval: PlanInterval;
  priceLabel: string;
  recommended?: boolean;
}

export interface DetailApp {
  kind: "mac" | "ios";
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  downloadUrl?: string | null;
  /** iPhone apps: the App Store URL the "Download" button links to. */
  appStoreUrl?: string;
  screenshots: string[];
  plans: DetailPlan[];
}

const PLAN_KEY: Record<PlanInterval, string> = {
  month: "detail.planMonthly",
  quarter: "detail.planQuarterly",
  year: "detail.planAnnual",
  lifetime: "detail.planLifetime",
};

export function AppDetail({ app }: { app: DetailApp }) {
  const { t } = useT();
  const shots = app.screenshots.length ? app.screenshots : [];
  const isIos = app.kind === "ios";

  return (
    <section className="section">
      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/apps">{t("detail.back")}</Link>
          <span aria-hidden="true">›</span>
          <span>{app.name}</span>
        </div>

        <div className="app-hero-head">
          <span className="app-icon big">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={app.icon} alt="" />
          </span>
          <div>
            <h1>{app.name}</h1>
            <p className="lead">{app.tagline}</p>
          </div>
        </div>

        {/* Banner + download (App Store link for iPhone, gated trial for macOS) */}
        <div className="trial-banner mt-m">
          <span className="trial-badge">{t("detail.freeBadge")}</span>
          {isIos ? (
            <>
              <p>{t("detail.availableAppStore")}</p>
              <a
                className="btn btn-primary"
                href={app.appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("detail.downloadAppStore", { app: app.name })}
              </a>
            </>
          ) : (
            <>
              <p>{t("detail.trialLead", { app: app.name, days: t("detail.days7") })}</p>
              <DownloadButton
                appName={app.name}
                downloadUrl={app.downloadUrl}
                label={t("detail.downloadApp", { app: app.name })}
                className="btn btn-primary"
              />
            </>
          )}
        </div>

        {/* Screenshots */}
        <h2 className="mt-l">{t("detail.screenshots")}</h2>
        <div className="shots mt-m">
          {shots.length ? (
            shots.map((src, i) => (
              <div className="shot" key={i}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`${app.name} screenshot ${i + 1}`} />
              </div>
            ))
          ) : (
            <>
              {[0, 1, 2].map((i) => (
                <div className="shot shot-ph" key={i}>
                  <span>{app.name}</span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Plans (macOS apps only) */}
        {!isIos && (
          <>
            <h2 className="mt-l" style={{ marginBottom: 4 }}>
              {t("detail.choosePlan")}
            </h2>
            <div className="plan-grid mt-m">
              {app.plans.map((plan) => (
                <div
                  className={`plan-card${plan.recommended ? " recommended" : ""}`}
                  key={plan.interval}
                >
                  {plan.recommended && <span className="plan-flag">{t("detail.bestValue")}</span>}
                  <div className="plan-name">{t(PLAN_KEY[plan.interval])}</div>
                  <div className="plan-price">{plan.priceLabel}</div>
                  <div className="plan-note muted">
                    {plan.recommended
                      ? t("detail.bestValue")
                      : plan.interval === "lifetime"
                        ? t("detail.payOnce")
                        : " "}
                  </div>
                  <div className="mt-m">
                    <AddToCartButton appSlug={app.slug} interval={plan.interval} />
                  </div>
                </div>
              ))}
            </div>

            <p className="form-note mt-l">{t("detail.checkoutNote")}</p>
          </>
        )}
      </div>
    </section>
  );
}
