import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validators";
import { getUserByEmail } from "@/lib/users";
import { verifyPassword } from "@/lib/password";
import { allowUnverified } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await getUserByEmail(email);
        // No password set (Apple-only account) — credentials sign-in doesn't apply.
        if (!user?.passwordHash) return null;

        const ok = await verifyPassword(password, user.passwordHash);
        if (!ok) return null;

        if (!allowUnverified && !user.emailVerifiedAt) return null;

        return { id: user.id, email: user.email, name: user.name ?? null };
      },
    }),
  ],
});
