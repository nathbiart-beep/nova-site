import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pages are generated statically at build time for maximum speed (good for SEO).
  trailingSlash: false,
  // Le contenu (soirées, articles) est lu au moment du rendu : on l'embarque
  // dans les fonctions serveur, sinon la régénération horaire voit un agenda vide.
  outputFileTracingIncludes: {
    "/**/*": ["./content/**/*"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      // Short, memorable admin address: /admin opens the content editor.
      { source: "/admin", destination: "/keystatic", permanent: false },
      // Lien court pour les albums photo (Saint-V, TD) sur la page Facebook NOVA.
      { source: "/saintv", destination: "https://www.facebook.com/profile.php?id=61596629136571&sk=photos", permanent: false },
      { source: "/photos", destination: "https://www.facebook.com/profile.php?id=61596629136571&sk=photos", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/keystatic/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
