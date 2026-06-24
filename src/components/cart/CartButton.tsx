"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartButton() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/cart"
      className="cart-button"
      aria-label={count ? `Cart, ${count} item${count > 1 ? "s" : ""}` : "Cart"}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="20" r="1.4" />
        <circle cx="18" cy="20" r="1.4" />
        <path d="M2 3h3l2.4 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L22 7H6" />
      </svg>
      {ready && count > 0 && <span className="cart-count">{count}</span>}
    </Link>
  );
}
