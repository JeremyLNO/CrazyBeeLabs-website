import { notFound } from "next/navigation";
import { CATALOG, getApp } from "@/lib/catalog";
import { AppDetail } from "@/components/apps/AppDetail";

export function generateStaticParams() {
  return CATALOG.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  return { title: app ? app.name : "App" };
}

export default async function AppDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const app = getApp(slug);
  if (!app) notFound();

  return (
    <AppDetail
      app={{
        slug: app.slug,
        name: app.name,
        tagline: app.tagline,
        icon: app.icon,
        downloadUrl: app.downloadUrl ?? null,
        screenshots: app.screenshots ?? [],
        plans: app.plans.map((p) => ({
          interval: p.interval,
          priceLabel: p.priceLabel,
          recommended: p.recommended,
        })),
      }}
    />
  );
}
