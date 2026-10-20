import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NOVA · Soirées étudiantes",
    short_name: "NOVA",
    description: "L'agenda des soirées étudiantes à Bruxelles, Namur et Louvain-la-Neuve.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef6ee",
    theme_color: "#55ff22",
    lang: "fr-BE",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
  };
}
