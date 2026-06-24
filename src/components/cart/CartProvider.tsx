"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PlanInterval } from "@/lib/catalog";
import { getPlan } from "@/lib/catalog";

export interface CartItem {
  appSlug: string;
  interval: PlanInterval;
}

interface CartContextValue {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (appSlug: string) => void;
  clear: () => void;
  itemFor: (appSlug: string) => CartItem | undefined;
  count: number;
  ready: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "cbl_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  // hydrate from localStorage, dropping anything no longer in the catalogue
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        setItems(parsed.filter((i) => getPlan(i.appSlug, i.interval)));
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  // one plan per app: adding replaces any existing entry for that app
  const add = useCallback((item: CartItem) => {
    setItems((prev) => [...prev.filter((i) => i.appSlug !== item.appSlug), item]);
  }, []);

  const remove = useCallback((appSlug: string) => {
    setItems((prev) => prev.filter((i) => i.appSlug !== appSlug));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const itemFor = useCallback(
    (appSlug: string) => items.find((i) => i.appSlug === appSlug),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, add, remove, clear, itemFor, count: items.length, ready }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
