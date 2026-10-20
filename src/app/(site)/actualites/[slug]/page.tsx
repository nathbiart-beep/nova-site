import { ArticlePage, articleMetadata, articleParams } from "@/components/article-page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => articleParams("actualite");
export async function generateMetadata({ params }: Props) {
  return articleMetadata((await params).slug, "actualite");
}
export default async function Page({ params }: Props) {
  return <ArticlePage slug={(await params).slug} category="actualite" />;
}
