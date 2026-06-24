import Link from "next/link";
import { CATALOG } from "@/lib/catalog";
import { Hex } from "@/components/ui/Hex";

export const metadata = { title: "Pricing" };

export default function PricingPage() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="page-head">
          <span className="kicker">
            <Hex /> Pricing
          </span>
          <h1>Buy a license</h1>
          <p className="lead">
            Every macOS app is free to download with a 7-day trial. Keep using it
            with a plan — monthly, quarterly, annual, or pay once for lifetime.
          </p>
        </div>

        <div className="grid-cards">
          {CATALOG.map((app) => (
            <Link className="card app-link" href={`/apps/${app.slug}`} key={app.slug}>
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
                <span className="btn btn-accent btn-sm">View plans</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
