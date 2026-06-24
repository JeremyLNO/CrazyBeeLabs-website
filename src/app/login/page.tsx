import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) redirect(callbackUrl || "/account");

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="lead">Log in to manage your licenses and invoices.</p>
        <LoginForm callbackUrl={callbackUrl} />
        <p className="auth-foot">
          No account yet? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
