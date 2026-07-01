import { auth } from "@/lib/auth";
import { SupportContent } from "@/components/support/SupportContent";

export const metadata = {
  title: "Support & ideas",
  description: "Get help with a Crazy Bee Labs app or send us an idea.",
};

export default async function SupportPage() {
  const session = await auth();
  return (
    <SupportContent
      initialEmail={session?.user?.email ?? ""}
      initialFirstName={session?.user?.name ?? ""}
    />
  );
}
