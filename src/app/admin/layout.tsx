import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-auth";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (!isAdminEmail(session.user.email)) notFound();

  return (
    <section className="section">
      <div className="wrap">
        <div className="account">
          <AdminNav />
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}
