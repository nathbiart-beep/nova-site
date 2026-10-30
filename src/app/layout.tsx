import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SITE_URL, site } from "@/lib/site";

const montserrat = localFont({
  src: [
    { path: "../fonts/montserrat-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/montserrat-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/montserrat-latin-800-normal.woff2", weight: "800" },
    { path: "../fonts/montserrat-latin-900-normal.woff2", weight: "900" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const script = localFont({
  src: "../fonts/great-vibes-latin-400-normal.woff2",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Nova Student · Soirées étudiantes à Bruxelles, Namur et Louvain-la-Neuve",
    template: "%s · NOVA",
  },
  description: site.description,
  keywords: site.keywords,
  applicationName: "Nova Student",
  authors: [{ name: "NOVA" }],
  creator: "NOVA",
  publisher: "NOVA",
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/rss.xml", title: "NOVA, blog et actualités" }] } },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: SITE_URL,
    siteName: "Nova Student",
    title: "Nova Student · Soirées étudiantes à Bruxelles, Namur et Louvain-la-Neuve",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  verification: {
    // Ajoutez ici le code de Google Search Console après avoir créé votre propriété (voir README).
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#55ff22",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr-BE" className={`${montserrat.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
