import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lint is available via `npm run lint`, but shouldn't block a deploy.
  eslint: { ignoreDuringBuilds: true },
  async redirects() {
    return [
      // WallSpaces was renamed to 1space1wallpaper — keep old links/bookmarks working.
      { source: "/apps/wallspaces", destination: "/apps/1space1wallpaper", permanent: true },
    ];
  },
};

export default nextConfig;
