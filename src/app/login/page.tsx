import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Log in" };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Welcome back</h1>
        <p className="lead">Log in to manage your licenses and invoices.</p>
        <LoginForm />
        <p className="auth-foot">
          No account yet? <Link href="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
