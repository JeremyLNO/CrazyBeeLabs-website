import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AccountNav } from "@/components/account/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <section className="section">
      <div className="wrap">
        <div className="account">
          <AccountNav />
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
