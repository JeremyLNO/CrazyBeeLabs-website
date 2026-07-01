import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginContent } from "@/components/auth/LoginContent";

export const metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  const { callbackUrl } = await searchParams;
  if (session?.user) redirect(callbackUrl || "/account");

  return <LoginContent callbackUrl={callbackUrl} />;
}
