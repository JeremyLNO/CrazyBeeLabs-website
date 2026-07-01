"use client";

import { useRouter } from "next/navigation";
import { AuthFlow } from "@/components/auth/AuthFlow";

export function LoginContent({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <AuthFlow
          onSuccess={() => {
            router.push(callbackUrl || "/account");
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
