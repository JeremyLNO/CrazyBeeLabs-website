"use client";

import { useEffect, useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";
import { useCart } from "@/components/cart/CartProvider";
import { getPlan } from "@/lib/catalog";
import {
  isPaddleClientConfigured,
  paddleClientToken,
  paddleEnv,
} from "@/lib/paddle";

export function CheckoutButton({
  user,
}: {
  user: { id: string; email: string } | null;
}) {
  const { items } = useCart();
  const [paddle, setPaddle] = useState<Paddle>();
  const configured = isPaddleClientConfigured();

  useEffect(() => {
    if (!configured) return;
    const token = paddleClientToken();
    if (!token) return;
    initializePaddle({ token, environment: paddleEnv() })
      .then((p) => setPaddle(p))
      .catch(() => {});
  }, [configured]);

  const priced = items.map((i) => ({
    item: i,
    priceId: getPlan(i.appSlug, i.interval)?.paddlePriceId || "",
  }));
  const missingPrice = priced.some((p) => !p.priceId);

  if (!user) {
    return (
      <a className="btn btn-primary btn-block" href="/login?callbackUrl=/cart">
        Log in to check out
      </a>
    );
  }

  if (!configured || missingPrice) {
    return (
      <div>
        <button className="btn btn-primary btn-block" disabled aria-disabled="true">
          Checkout coming soon
        </button>
        <p className="form-note mt-s">
          Payments aren&apos;t live yet — Paddle isn&apos;t configured.
        </p>
      </div>
    );
  }

  function checkout() {
    if (!paddle || !user) return;
    paddle.Checkout.open({
      items: priced.map((p) => ({ priceId: p.priceId, quantity: 1 })),
      customer: { email: user.email },
      customData: { userId: user.id, items },
      settings: {
        displayMode: "overlay",
        theme: "light",
        successUrl: `${window.location.origin}/account/licenses?purchase=success`,
      },
    });
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-block"
      onClick={checkout}
      disabled={!paddle || items.length === 0}
    >
      {paddle ? "Pay with Paddle" : "Loading checkout…"}
    </button>
  );
}
