import { ArticlePage, articleMetadata, articleParams } from "@/components/article-page";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => articleParams("blog");
export async function generateMetadata({ params }: Props) {
  return articleMetadata((await params).slug, "blog");
}
export default async function Page({ params }: Props) {
  return <ArticlePage slug={(await params).slug} category="blog" />;
}
