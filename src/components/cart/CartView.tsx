"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { getApp, getPlan, PLAN_LABELS } from "@/lib/catalog";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { useT } from "@/lib/i18n/LanguageProvider";

export function CartView({
  user,
}: {
  user: { id: string; email: string } | null;
}) {
  const { items, remove, clear, ready } = useCart();
  const { t } = useT();

  if (!ready) return <div className="muted">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="empty">
        <h3>{t("cart.emptyTitle")}</h3>
        <p className="muted mt-s">{t("cart.emptyBody")}</p>
        <div className="mt-m">
          <Link className="btn btn-primary" href="/apps">
            {t("cart.browse")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-grid">
      <div className="stack">
        {items.map((i) => {
          const app = getApp(i.appSlug);
          const plan = getPlan(i.appSlug, i.interval);
          return (
            <div className="license-row" key={i.appSlug}>
              <span className="app-icon">
                {app && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={app.icon} alt="" />
                )}
              </span>
              <div className="lr-main">
                <div className="lr-app">{app?.name ?? i.appSlug}</div>
                <div className="lr-sub">
                  {PLAN_LABELS[i.interval]} · {plan?.priceLabel}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => remove(i.appSlug)}
              >
                Remove
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          style={{ alignSelf: "flex-start" }}
          onClick={clear}
        >
          Clear cart
        </button>
      </div>

      <aside className="cart-summary card">
        <h3>Summary</h3>
        <div className="muted mt-s" style={{ fontSize: 14 }}>
          {items.length} item{items.length > 1 ? "s" : ""}
        </div>
        <p className="form-note mt-s">
          Final total and your local taxes are shown securely at checkout.
        </p>
        <div className="mt-m">
          <CheckoutButton user={user} />
        </div>
      </aside>
    </div>
  );
}
