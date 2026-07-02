import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { AccountOverview } from "@/components/account/AccountOverview";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user ? await getUserById(session.user.id) : null;
  if (!user) return null;

  return (
    <AccountOverview
      email={user.email}
      verified={Boolean(user.emailVerifiedAt)}
      name={user.name ?? ""}
      lastName={user.lastName ?? ""}
      birthDate={user.birthDate ?? ""}
    />
  );
}
