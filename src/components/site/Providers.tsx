"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { CartProvider } from "@/components/cart/CartProvider";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <CartProvider>
          <AuthModalProvider>{children}</AuthModalProvider>
        </CartProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}
