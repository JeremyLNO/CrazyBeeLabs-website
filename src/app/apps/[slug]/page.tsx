import { notFound } from "next/navigation";
import { CATALOG, getApp } from "@/lib/catalog";
import { IPHONE_APPS, getShowcaseApp } from "@/lib/showcase";
import { AppDetail, type DetailApp } from "@/components/apps/AppDetail";

export function generateStaticParams() {
  return [
    ...CATALOG.map((a) => ({ slug: a.slug })),
    ...IPHONE_APPS.map((a) => ({ slug: a.slug })),
  ];
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

  // macOS app — licensed here (plans + gated download).
  const mac = getApp(slug);
  if (mac) {
    const detail: DetailApp = {
      kind: "mac",
      slug: mac.slug,
      name: mac.name,
      tagline: mac.tagline,
      icon: mac.icon,
      downloadUrl: mac.downloadUrl ?? null,
      screenshots: mac.screenshots ?? [],
      plans: mac.plans.map((p) => ({
        interval: p.interval,
        priceLabel: p.priceLabel,
        recommended: p.recommended,
      })),
    };
    return <AppDetail app={detail} />;
  }

  // iPhone app — on-site page whose only App Store link is the download button.
  const ios = getShowcaseApp(slug);
  if (ios && ios.device === "iphone") {
    const detail: DetailApp = {
      kind: "ios",
      slug: ios.slug,
      name: ios.name,
      tagline: ios.tagline,
      icon: ios.icon,
      appStoreUrl: ios.appStoreUrl,
      screenshots: ios.screenshots ?? [],
      plans: [],
    };
    return <AppDetail app={detail} />;
  }

  notFound();
}
