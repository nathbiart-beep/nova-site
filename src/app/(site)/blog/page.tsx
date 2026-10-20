import type { Metadata } from "next";
import { ArticleList } from "@/components/article-page";
import { Breadcrumbs, PageHero } from "@/components/layout-parts";

export const metadata: Metadata = {
  title: "Blog : guides et bons plans de la vie étudiante",
  description:
    "Guides pratiques, bons plans et conseils pour la vie étudiante à Bruxelles, Namur et Louvain-la-Neuve : soirées, folklore, blocus, sorties.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Guides et bons plans de la vie étudiante"
        intro="Soirées, folklore, blocus, sorties : tout ce qu'il faut savoir pour profiter de tes années d'études à Bruxelles, Namur et Louvain-la-Neuve."
      />
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Blog" }]} />
          <ArticleList category="blog" />
        </div>
      </section>
    </>
  );
}
