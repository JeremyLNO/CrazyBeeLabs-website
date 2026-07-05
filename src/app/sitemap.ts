import type { MetadataRoute } from "next";
import { CATALOG } from "@/lib/catalog";
import { IPHONE_APPS } from "@/lib/showcase";
import { LEGAL_DOCS } from "@/lib/content";

const BASE_URL = "https://www.crazybeelabs.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", "/apps", "/studio", "/faq", "/support", "/login"].map(
    (path) => ({
      url: `${BASE_URL}${path}`,
      lastModified: new Date(),
    }),
  );

  const appRoutes = [
    ...CATALOG.map((a) => a.slug),
    ...IPHONE_APPS.map((a) => a.slug),
  ].map((slug) => ({
    url: `${BASE_URL}/apps/${slug}`,
    lastModified: new Date(),
  }));

  const legalRoutes = LEGAL_DOCS.map((doc) => ({
    url: `${BASE_URL}/legal/${doc}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...appRoutes, ...legalRoutes];
}
