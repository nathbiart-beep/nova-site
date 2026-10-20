import type { Metadata } from "next";
import Image from "next/image";
import { team } from "@/lib/site";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/layout-parts";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "L'équipe NOVA : par des étudiants, pour des étudiants",
  description:
    "Qui se cache derrière NOVA ? Trois étudiants passionnés par la vie étudiante à Bruxelles, Namur et Louvain-la-Neuve : média, événements et partenariats.",
  alternates: { canonical: "/a-propos" },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="L'équipe"
        title="Par des étudiants, pour des étudiants"
        intro="NOVA, c'est trois étudiants qui font tous un peu de tout : l'agenda, les stories, les soirées, les partenariats. Notre objectif : être le partenaire de référence de la vie étudiante à Bruxelles, Namur et Louvain-la-Neuve."
      />
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "L'équipe" }]} />
          <div className="grid-3">
            {team.map((m) => (
              <figure key={m.name} className="card team-card">
                <div className="team-photo">
                  <Image src={m.photo} alt={`${m.name}, membre de l'équipe NOVA`} width={400} height={400} />
                </div>
                <figcaption>
                  <h2 className="team-name">{m.name}</h2>
                  <p className="muted">{m.bio}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className="section section-alt">
        <div className="container narrow">
          <h2>Notre histoire</h2>
          <p>
            NOVA est né à Bruxelles d'une envie simple : rassembler au même endroit toutes les soirées étudiantes de la semaine, et mettre en avant les cercles et les organisateurs qui font vivre la nuit étudiante.
          </p>
          <p>
            Aujourd'hui, NOVA couvre Bruxelles, Namur et Louvain-la-Neuve. On publie l'agenda chaque semaine, on organise des événements et on monte des partenariats avec des marques qui veulent rencontrer les étudiants autrement.
          </p>
        </div>
      </section>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: `${SITE_URL}/a-propos`,
          mainEntity: { "@id": `${SITE_URL}/#organization` },
        }}
      />
    </>
  );
}
