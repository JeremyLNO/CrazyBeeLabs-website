import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Create account" };

export default async function SignupPage() {
  const session = await auth();
  if (session?.user) redirect("/account");

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Create your account</h1>
        <p className="lead">
          One account for every Crazy Bee Labs app license.
        </p>
        <SignupForm />
        <p className="auth-foot">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
