"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/LanguageProvider";
import {
  showcaseByCategory,
  getShowcaseApp,
  type ShowcaseApp,
} from "@/lib/showcase";
import { getAppCopy } from "@/lib/content";
import { NewsletterSignup } from "@/components/home/NewsletterSignup";

/** Per-app accent gradient [from, to] — from the design handoff (1a Clean Bento). */
const GRAD: Record<string, [string, string]> = {
  shotbox: ["#6EA8FE", "#3B82F6"],
  "macnap-blocker": ["#A78BFA", "#7C3AED"],
  "energy-manager": ["#34D399", "#059669"],
  fastrename: ["#FBBF24", "#F59E0B"],
  spaceonmydisk: ["#F472B6", "#DB2777"],
  "never-miss-a-meeting": ["#FB7185", "#E11D48"],
  "opti-worktime": ["#22D3EE", "#0891B2"],
  spacespilot: ["#818CF8", "#4F46E5"],
  qualiscan: ["#4ADE80", "#16A34A"],
  sunshine: ["#FDE047", "#F59E0B"],
  deskmate: ["#FCA5A5", "#EF4444"],
  cycles: ["#5EEAD4", "#14B8A6"],
  "menu-island": ["#C4B5FD", "#8B5CF6"],
  "dualcam-oxo": ["#93C5FD", "#2563EB"],
};
const grad = (slug: string) => {
  const g = GRAD[slug] ?? ["#FFCE4B", "#F5A623"];
  return `linear-gradient(135deg, ${g[0]}, ${g[1]})`;
};

// Floating hero-cluster positions (px, left/top within a 420px-tall box).
const HERO_POS: [number, number][] = [
  [26, 36], [190, 6], [356, 52],
  [88, 158], [262, 148], [406, 176],
  [40, 292], [214, 288], [360, 300],
];

const FEATURED = [
  { slug: "shotbox", descKey: "home2.featShotbox" },
  { slug: "spacespilot", descKey: "home2.featSpacespilot" },
  { slug: "menu-island", descKey: "home2.featMenuisland" },
];

function AppIcon({ app, size }: { app: ShowcaseApp; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="home2-appicon"
      src={app.icon}
      alt=""
      style={{ width: size, height: size }}
    />
  );
}

export function HomeContent() {
  const { t, lang } = useT();
  const work = showcaseByCategory("work-smarter");
  const personal = showcaseByCategory("personal");

  // Split the hero title around ⟨highlighted⟩ word.
  const raw = t("home2.title");
  const m = raw.match(/^(.*)⟨(.*)⟩(.*)$/);

  return (
    <div className="home2">
      {/* Hero */}
      <section className="home2-wrap home2-hero">
        <div className="home2-reveal">
          <span className="home2-eyebrow">{t("home.kicker")}</span>
          <h1 className="home2-h1">
            {m ? (
              <>
                {m[1]}
                <span className="home2-hl">{m[2]}</span>
                {m[3]}
              </>
            ) : (
              raw
            )}
          </h1>
          <p className="home2-sub">{t("home2.lead")}</p>
          <div className="home2-cta-row">
            <Link className="home2-cta" href="/apps">
              {t("home.browseApps")}
            </Link>
          </div>
          <div className="home2-stats">
            <span>
              <b>{t("home2.statAppsN")}</b> {t("home2.statApps")}
            </span>
            <span>
              <b>{t("home2.statTrialN")}</b> {t("home2.statTrial")}
            </span>
            <span>
              <b>{t("home2.statTrackersN")}</b> {t("home2.statTrackers")}
            </span>
          </div>
        </div>

        {/* Floating app-icon cluster */}
        <div className="home2-cluster" aria-hidden="true">
          {work.slice(0, 9).map((app, i) => (
            <Link
              key={app.slug}
              href={app.href}
              className="home2-tile"
              style={{
                left: HERO_POS[i][0],
                top: HERO_POS[i][1],
                animationDuration: `${4 + i * 0.4}s`,
                animationDelay: `${i * -0.5}s`,
              }}
            >
              <AppIcon app={app} size={74} />
            </Link>
          ))}
        </div>
      </section>

      {/* In the spotlight */}
      <section className="home2-wrap home2-section">
        <div className="home2-head">
          <h2>{t("home2.spotlightTitle")}</h2>
          <span className="home2-head-sub">{t("home2.spotlightSub")}</span>
        </div>
        <div className="home2-featured-grid">
          {FEATURED.map((f, i) => {
            const app = getShowcaseApp(f.slug);
            if (!app) return null;
            return (
              <Link
                key={f.slug}
                href={app.href}
                className="home2-fcard home2-reveal"
                style={{ animationDelay: `${i * 90}ms` }}
              >
                <div className="home2-fcard-head">
                  <AppIcon app={app} size={52} />
                  <div>
                    <div className="home2-fcard-name">{app.name}</div>
                    <div className="home2-fcard-kind">
                      {t(`categories.${app.category}`)}
                    </div>
                  </div>
                </div>
                {/* Mock app-window preview */}
                <div className="home2-mock">
                  <div className="home2-mock-bar" style={{ background: grad(f.slug) }}>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="home2-mock-body">
                    <div className="home2-bar" style={{ width: "70%", opacity: 0.9 }} />
                    <div className="home2-bar" style={{ width: "90%" }} />
                    <div className="home2-bar" style={{ width: "55%" }} />
                    <div className="home2-mock-btn" style={{ background: grad(f.slug) }} />
                  </div>
                </div>
                <p className="home2-fcard-desc">{t(f.descKey)}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* The full collection */}
      <section className="home2-wrap home2-section">
        <h2 className="home2-collection-title">{t("home2.collectionTitle")}</h2>

        <p className="home2-group-label">{t("categories.work-smarter")}</p>
        <div className="home2-collection-grid">
          {work.map((app, i) => (
            <CollectionCard key={app.slug} app={app} lang={lang} index={i} />
          ))}
        </div>

        <p className="home2-group-label mt">{t("categories.personal")}</p>
        <div className="home2-collection-grid">
          {personal.map((app, i) => (
            <CollectionCard key={app.slug} app={app} lang={lang} index={i} />
          ))}
        </div>
      </section>

      {/* Dark "how it works" band */}
      <section className="home2-wrap">
        <div className="home2-steps">
          <div className="home2-steps-eyebrow">{t("home.how.kicker")}</div>
          <h2>{t("home.how.title")}</h2>
          <div className="home2-steps-grid">
            <div>
              <div className="home2-step-num">01</div>
              <div className="home2-step-title">{t("home.how.s1t")}</div>
              <p>{t("home.how.s1b")}</p>
            </div>
            <div>
              <div className="home2-step-num">02</div>
              <div className="home2-step-title">{t("home.how.s2t")}</div>
              <p>{t("home.how.s2b")}</p>
            </div>
            <div>
              <div className="home2-step-num">03</div>
              <div className="home2-step-title">{t("home.how.s3t")}</div>
              <p>{t("home.how.s3b")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter (kept from the existing site) */}
      <NewsletterSignup />
    </div>
  );
}

function CollectionCard({
  app,
  lang,
  index,
}: {
  app: ShowcaseApp;
  lang: string;
  index: number;
}) {
  const tagline = getAppCopy(lang as never, app.slug)?.tagline ?? app.tagline;
  return (
    <Link
      href={app.href}
      className="home2-ccard home2-reveal"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <AppIcon app={app} size={48} />
      <div className="home2-ccard-text">
        <div className="home2-ccard-name">{app.name}</div>
        <div className="home2-ccard-tag">{tagline}</div>
      </div>
    </Link>
  );
}
