import { ogImage, ogSize } from "@/lib/og";
import { getArticles, reader } from "@/lib/content";

export const alt = "Article du blog NOVA";
export const size = ogSize;
export const contentType = "image/png";

export async function generateStaticParams() {
  const articles = await getArticles("blog");
  return articles.map((a) => ({ slug: a.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const a = await reader.collections.articles.read((await params).slug);
  return ogImage({ title: a?.title ?? "NOVA", label: "Blog" });
}
