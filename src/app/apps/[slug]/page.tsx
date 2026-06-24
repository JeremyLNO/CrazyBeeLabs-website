import { notFound } from "next/navigation";
import Link from "next/link";
import { CATALOG, getApp, PLAN_LABELS } from "@/lib/catalog";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export function generateStaticParams() {
  return CATALOG.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  return { title: app ? `${app.name} — Pricing` : "Pricing" };
}

export default async function AppPricingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  return (
    <section className="section">
      <div className="wrap">
        <div className="breadcrumb">
          <Link href="/pricing">Pricing</Link>
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

        <p className="muted mt-s">
          Free to download · 7-day trial · then choose a plan:
        </p>

        <div className="plan-grid mt-m">
          {app.plans.map((plan) => (
            <div
              className={`plan-card${plan.recommended ? " recommended" : ""}`}
              key={plan.interval}
            >
              {plan.recommended && <span className="plan-flag">Best value</span>}
              <div className="plan-name">{PLAN_LABELS[plan.interval]}</div>
              <div className="plan-price">{plan.priceLabel}</div>
              <div className="plan-note muted">{plan.note ?? " "}</div>
              <div className="mt-m">
                <AddToCartButton appSlug={app.slug} interval={plan.interval} />
              </div>
            </div>
          ))}
        </div>

        <p className="form-note mt-l">
          Prices shown are indicative; the exact amount and your local taxes are
          confirmed at checkout. iOS apps are sold separately on the App Store.
        </p>
      </div>
    </section>
  );
}
