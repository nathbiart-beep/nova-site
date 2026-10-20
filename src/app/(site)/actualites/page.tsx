import type { Metadata } from "next";
import { ArticleList } from "@/components/article-page";
import { Breadcrumbs, PageHero } from "@/components/layout-parts";

export const metadata: Metadata = {
  title: "Actualités de la vie étudiante",
  description:
    "Les actualités de la vie étudiante à Bruxelles, Namur et Louvain-la-Neuve : grands événements, nouveautés des cercles et news de NOVA.",
  alternates: { canonical: "/actualites" },
};

export default function ActualitesPage() {
  return (
    <>
      <PageHero
        eyebrow="Actualités"
        title="L'actu de la vie étudiante"
        intro="Grands événements, nouveautés des cercles et news de NOVA à Bruxelles, Namur et Louvain-la-Neuve."
      />
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Actualités" }]} />
          <ArticleList category="actualite" />
        </div>
      </section>
    </>
  );
}
