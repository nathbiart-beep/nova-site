import { ogImage, ogSize } from "@/lib/og";

export const alt = "NOVA, les soirées étudiantes à Bruxelles, Namur et Louvain-la-Neuve";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: "Les soirées étudiantes, chaque semaine, au même endroit.", label: "Agenda" });
}
