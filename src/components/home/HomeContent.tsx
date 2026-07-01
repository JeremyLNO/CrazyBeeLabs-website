"use client";

import Link from "next/link";
import { Hex } from "@/components/ui/Hex";
import { RotatingWord } from "@/components/home/RotatingWord";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";
import { useT } from "@/lib/i18n/LanguageProvider";

export function HomeContent() {
  const { t } = useT();
  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <div className="wrap">
          <span className="kicker">
            <Hex /> {t("home.kicker")}
          </span>
          <h1 className="home-hero-title mt-s">
            {t("home.titleBefore")} <RotatingWord /> {t("home.titleAfter")}
          </h1>
          <p className="lead mt-m" style={{ maxWidth: "48ch" }}>
            {t("home.lead")}
          </p>
          <div className="home-cta">
            <Link className="btn btn-primary" href="/apps">
              {t("home.browseApps")}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="section section-alt">
        <div className="wrap">
          <div className="page-head">
            <span className="kicker">
              <Hex /> {t("home.how.kicker")}
            </span>
            <h2>{t("home.how.title")}</h2>
          </div>
          <div className="grid-cards">
            <div className="card">
              <div className="step-num">1</div>
              <h3>{t("home.how.s1t")}</h3>
              <p className="muted">{t("home.how.s1b")}</p>
            </div>
            <div className="card">
              <div className="step-num">2</div>
              <h3>{t("home.how.s2t")}</h3>
              <p className="muted">{t("home.how.s2b")}</p>
            </div>
            <div className="card">
              <div className="step-num">3</div>
              <h3>{t("home.how.s3t")}</h3>
              <p className="muted">{t("home.how.s3b")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section">
        <div className="wrap">
          <div className="page-head">
            <span className="kicker">
              <Hex /> {t("home.why.kicker")}
            </span>
            <h2>{t("home.why.title")}</h2>
          </div>
          <div className="grid-cards">
            <div className="card">
              <h3>{t("home.why.c1t")}</h3>
              <p className="muted">{t("home.why.c1b")}</p>
            </div>
            <div className="card">
              <h3>{t("home.why.c2t")}</h3>
              <p className="muted">{t("home.why.c2b")}</p>
            </div>
            <div className="card">
              <h3>{t("home.why.c3t")}</h3>
              <p className="muted">{t("home.why.c3b")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterSignup />

      {/* CTA band */}
      <section className="section section-dark">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2>{t("home.cta.title")}</h2>
          <p
            className="lead"
            style={{ margin: "14px auto 26px", maxWidth: "44ch", color: "rgba(255,255,255,0.72)" }}
          >
            {t("home.cta.body")}
          </p>
          <Link className="btn btn-accent" href="/apps">
            {t("home.cta.button")}
          </Link>
        </div>
      </section>
    </>
  );
}
