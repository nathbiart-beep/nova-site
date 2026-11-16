import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Breadcrumbs, PageHero } from "@/components/layout-parts";

export const metadata: Metadata = {
  title: "Ajoute ton event à l'agenda NOVA",
  description:
    "Cercle, régionale ou kot-à-projet à Bruxelles, Namur ou LLN ? Ajoute gratuitement ta soirée à l'agenda étudiant NOVA en 1 minute.",
  alternates: { canonical: "/ajoute-ton-event" },
};

export default function AjouteTonEventPage() {
  return (
    <>
      <PageHero
        eyebrow="Agenda"
        title="Ajoute ton event à l'agenda NOVA"
        intro="Tu organises un TD, un cantus, un banquet ou une soirée à Bruxelles, Namur ou Louvain-la-Neuve ? Remplis le formulaire : c'est gratuit et ça prend une minute."
      />
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Agenda", href: "/agenda" }, { name: "Ajoute ton event" }]} />
          <div className="grid-3">
            <div className="card pillar">
              <h2 className="h3">Ce qu'on fait</h2>
              <p className="muted">On vérifie les infos et on ajoute ton event à l'agenda en ligne de novastudent.be (sous 48 h).</p>
            </div>
            <div className="card pillar">
              <h2 className="h3">Les stories</h2>
              <p className="muted">
                Chaque lundi, on fait une sélection des soirées de la semaine en story. On ne peut pas tout mettre, mais un event complet
                (lieu, heure, @Insta, lien) a beaucoup plus de chances d'y être.
              </p>
            </div>
            <div className="card pillar">
              <h2 className="h3">Bon à savoir</h2>
              <p className="muted">Les events réservés aux membres ne sont pas publiés.</p>
            </div>
          </div>
          <p style={{ marginTop: "2rem" }}>
            <a className="btn" href={site.eventForm} target="_blank" rel="noopener">
              Ajouter mon event
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
