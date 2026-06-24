import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Edge middleware uses the providerless config (just the `authorized` callback).
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
