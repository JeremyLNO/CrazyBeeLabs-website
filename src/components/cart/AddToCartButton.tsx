"use client";

import { useCart } from "@/components/cart/CartProvider";
import type { PlanInterval } from "@/lib/catalog";

export function AddToCartButton({
  appSlug,
  interval,
}: {
  appSlug: string;
  interval: PlanInterval;
}) {
  const { itemFor, add, remove } = useCart();
  const current = itemFor(appSlug);
  const inCart = current?.interval === interval;
  const otherInCart = !!current && current.interval !== interval;

  function toggle() {
    if (inCart) remove(appSlug);
    else add({ appSlug, interval });
  }

  return (
    <button
      type="button"
      className={`btn btn-block ${inCart ? "btn-secondary" : "btn-primary"}`}
      onClick={toggle}
    >
      {inCart ? "✓ In cart" : otherInCart ? "Choose this plan" : "Add to cart"}
    </button>
  );
}
