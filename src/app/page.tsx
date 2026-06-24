import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { Hex } from "@/components/ui/Hex";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="wrap">
          <span className="kicker">
            <Hex /> Crazy Bee Labs
          </span>
          <h1 className="mt-s">Your apps, your licenses, one account.</h1>
          <p className="lead mt-s">
            Download our macOS apps for free and try them for 7 days. Buy a license
            here to keep using them — monthly, quarterly, annual, or lifetime.
          </p>
          <div className="home-cta">
            <Link className="btn btn-primary" href="/signup">
              Create your account
            </Link>
            <Link className="btn btn-secondary" href="/login">
              Log in
            </Link>
          </div>
        </div>
      </section>

      <section className="section" id="apps">
        <div className="wrap">
          <div className="page-head">
            <span className="kicker">
              <Hex /> macOS apps
            </span>
            <h2>Apps with a license</h2>
            <p className="lead">
              Free to download, 7-day trial, then a plan from the prices below.
            </p>
          </div>

          <div className="grid-cards">
            {CATALOG.map((app) => (
              <div className="card" key={app.slug}>
                <div className="app-tile">
                  <span className="app-icon">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={app.icon} alt="" />
                  </span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
                      {app.name}
                    </div>
                    <div className="muted" style={{ fontSize: 13 }}>
                      {app.tagline}
                    </div>
                  </div>
                </div>
                <div className="row-between mt-m">
                  <span className="muted" style={{ fontSize: 14 }}>
                    From{" "}
                    <b style={{ color: "var(--color-black)" }}>
                      {app.plans[0].priceLabel}
                    </b>
                  </span>
                  <Link className="btn btn-accent btn-sm" href="/signup">
                    Get a license
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="form-note mt-l">
            iOS apps (QualiScan, Cycles) are on the App Store — no license needed here.
          </p>
        </div>
      </section>
    </>
  );
}
