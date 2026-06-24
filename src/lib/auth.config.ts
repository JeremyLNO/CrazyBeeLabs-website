import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no DB / bcrypt imports). Used by middleware and
 * spread into the full config in auth.ts. The Credentials provider — which
 * needs Node APIs — is added only in auth.ts.
 */
export const authConfig = {
  // Vercel sets a dynamic host; trust it so Auth.js doesn't reject the callback URL.
  trustHost: true,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const onAccount = nextUrl.pathname.startsWith("/account");
      if (onAccount && !isLoggedIn) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) session.user.id = token.id as string;
      return session;
    },
  },
} satisfies NextAuthConfig;
