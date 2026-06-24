import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lint is available via `npm run lint`, but shouldn't block a deploy.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
