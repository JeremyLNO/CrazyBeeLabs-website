import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Reset your password" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <ForgotPasswordForm initialEmail={email || ""} />
      </div>
    </div>
  );
}
