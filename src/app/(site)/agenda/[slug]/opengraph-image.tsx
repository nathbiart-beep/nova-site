import { ogImage, ogSize } from "@/lib/og";
import { formatDate, reader } from "@/lib/content";
import { villeName } from "@/lib/site";

export const alt = "Soirée étudiante dans l'agenda NOVA";
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  const slugs = await reader.collections.evenements.list();
  return slugs.map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const e = await reader.collections.evenements.read((await params).slug);
  return ogImage({ title: e?.title ?? "Agenda NOVA", label: e ? `${formatDate(e.date)} · ${villeName(e.ville)}` : "Agenda" });
}
