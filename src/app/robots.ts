import type { MetadataRoute } from "next";

const BASE_URL = "https://www.crazybeelabs.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/api", "/cart"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
