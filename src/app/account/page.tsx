import { auth } from "@/lib/auth";
import { getUserById } from "@/lib/users";
import { getMyDownloads } from "@/lib/downloads";
import { AccountOverview } from "@/components/account/AccountOverview";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user ? await getUserById(session.user.id) : null;
  if (!user) return null;

  let downloads: Awaited<ReturnType<typeof getMyDownloads>> = [];
  try {
    downloads = await getMyDownloads(user.id);
  } catch (e) {
    console.error("[account] getMyDownloads failed", e);
  }

  return (
    <AccountOverview
      email={user.email}
      verified={Boolean(user.emailVerifiedAt)}
      name={user.name ?? ""}
      lastName={user.lastName ?? ""}
      birthDate={user.birthDate ?? ""}
      downloads={downloads.map((d) => ({
        id: d.id,
        appSlug: d.appSlug,
        platform: d.platform,
        createdAt: d.createdAt,
      }))}
    />
  );
}
