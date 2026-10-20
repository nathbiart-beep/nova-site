import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are generated statically at build time for maximum speed (good for SEO).
  trailingSlash: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Short, memorable admin address: /admin opens the content editor.
      { source: "/admin", destination: "/keystatic", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/keystatic/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
