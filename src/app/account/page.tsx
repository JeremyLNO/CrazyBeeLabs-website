import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user ? await getUserById(session.user.id) : null;
  if (!user) return null;

  return (
    <>
      <div className="page-head">
        <span className="kicker">Account</span>
        <h1>Your account</h1>
      </div>

      <div className="card stack">
        <div>
          <div className="muted" style={{ fontSize: 13 }}>
            Name
          </div>
          <div>{user.name || "—"}</div>
        </div>
        <hr style={{ border: "none", borderTop: "1px solid var(--color-border)" }} />
        <div className="row-between">
          <div>
            <div className="muted" style={{ fontSize: 13 }}>
              Email
            </div>
            <div>{user.email}</div>
          </div>
          {user.emailVerifiedAt ? (
            <span className="badge badge-active">Verified</span>
          ) : (
            <span className="badge badge-past_due">Unverified</span>
          )}
        </div>
      </div>

      <div className="mt-m">
        <SignOutButton />
      </div>
    </>
  );
}
