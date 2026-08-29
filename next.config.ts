import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stagehand resolves its bundled browser-extension assets from a
  // package-relative `import.meta.url`, which the bundler cannot follow — it has
  // to stay an external require at runtime.
  serverExternalPackages: ["pdf-parse", "@browserbasehq/stagehand"],
  images: {
    // Without this the optimizer inherits the upstream `max-age=0, must-revalidate`
    // from /public and every navigation re-fetches each image, making the logo and
    // hero screenshot visibly blank out and reload.
    minimumCacheTTL: 2678400,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://us-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
