import type { MetadataRoute } from "next";
import { CATALOG } from "@/lib/catalog";
import { IPHONE_APPS } from "@/lib/showcase";
import { LEGAL_DOCS } from "@/lib/content";

const BASE_URL = "https://www.crazybeelabs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "/",
    "/apps",
    "/studio",
    "/commitment",
    "/pricing",
    "/faq",
    "/support",
    "/login",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
  }));

  // Deduped: a licensed iOS app (e.g. QualiScan) appears in both lists, and
  // listing the same URL twice is a crawl error.
  const appSlugs = new Set([
    ...CATALOG.map((a) => a.slug),
    ...IPHONE_APPS.map((a) => a.slug),
  ]);
  const appRoutes = [...appSlugs].map((slug) => ({
    url: `${BASE_URL}/apps/${slug}`,
    lastModified: new Date(),
  }));

  const legalRoutes = LEGAL_DOCS.map((doc) => ({
    url: `${BASE_URL}/legal/${doc}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...appRoutes, ...legalRoutes];
}
