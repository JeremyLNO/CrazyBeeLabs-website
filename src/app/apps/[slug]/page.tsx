import { notFound } from "next/navigation";
import { CATALOG, getApp } from "@/lib/catalog";
import { IPHONE_APPS, getShowcaseApp } from "@/lib/showcase";
import { AppDetail, type DetailApp } from "@/components/apps/AppDetail";

export function generateStaticParams() {
  const slugs = new Set([
    ...CATALOG.map((a) => a.slug),
    ...IPHONE_APPS.map((a) => a.slug),
  ]);
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug) ?? getShowcaseApp(slug);
  return { title: app ? app.name : "App" };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // App licensed here (plans + AddToCart). macOS gets a gated direct download;
  // a licensed iOS app (e.g. Record Seconds) links out to the App Store instead.
  const licensed = getApp(slug);
  if (licensed) {
    const showcase = getShowcaseApp(slug);
    const plans = licensed.plans.map((p) => ({
      interval: p.interval,
      priceLabel: p.priceLabel,
      recommended: p.recommended,
    }));
    const detail: DetailApp =
      licensed.platform === "ios"
        ? {
            kind: "ios",
            slug: licensed.slug,
            name: licensed.name,
            tagline: licensed.tagline,
            icon: licensed.icon,
            appStoreUrl: showcase?.appStoreUrl,
            comingSoon: showcase?.comingSoon,
            screenshots: licensed.screenshots ?? [],
            plans,
          }
        : {
            kind: "mac",
            slug: licensed.slug,
            name: licensed.name,
            tagline: licensed.tagline,
            icon: licensed.icon,
            downloadUrl: licensed.downloadUrl ?? null,
            screenshots: licensed.screenshots ?? [],
            plans,
          };
    return <AppDetail app={detail} />;
  }

  // Free iPhone app — on-site page whose only App Store link is the download button.
  const ios = getShowcaseApp(slug);
  if (ios && ios.device === "iphone") {
    const detail: DetailApp = {
      kind: "ios",
      slug: ios.slug,
      name: ios.name,
      tagline: ios.tagline,
      icon: ios.icon,
      appStoreUrl: ios.appStoreUrl,
      comingSoon: ios.comingSoon,
      screenshots: ios.screenshots ?? [],
      plans: [],
    };
    return <AppDetail app={detail} />;
  }

  notFound();
}
