import { ogImage, ogSize } from "@/lib/og";
import { villeList, villes, type VilleSlug } from "@/lib/site";

export const alt = "Soirées étudiantes de la semaine";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return villeList.map((v) => ({ ville: v.slug }));
}

export default async function Image({ params }: { params: Promise<{ ville: string }> }) {
  const v = villes[(await params).ville as VilleSlug];
  return ogImage({ title: `Les soirées étudiantes à ${v?.name ?? "Bruxelles"}`, label: v?.short ?? "Agenda" });
}
