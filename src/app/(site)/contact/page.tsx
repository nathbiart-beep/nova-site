import type { Metadata } from "next";
import { site } from "@/lib/site";
import { Breadcrumbs, PageHero } from "@/components/layout-parts";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contacter NOVA : ajouter une soirée à l'agenda, proposer un partenariat ou nous poser une question.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" title="On en parle ?" intro="Le plus rapide, c'est un DM sur Instagram. Pour les partenariats, écris-nous plutôt par e-mail." />
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Contact" }]} />
          <div className="grid-3">
            <div className="card pillar">
              <h2 className="h3">Ajouter ta soirée</h2>
              <p className="muted">Envoie-nous la date, l'heure, le lieu, l'organisateur et l'affiche en DM.</p>
              <a className="btn" href={site.instagram} target="_blank" rel="noopener">
                DM sur Instagram
              </a>
            </div>
            <div className="card pillar">
              <h2 className="h3">Partenariats</h2>
              <p className="muted">Marques, bars, organisateurs, associations : présentez-nous votre projet.</p>
              <p className="selectable">
                <strong>{site.email}</strong>
              </p>
              <a className="btn btn-ghost" href={`mailto:${site.email}`}>
                Envoyer un e-mail
              </a>
            </div>
            <div className="card pillar">
              <h2 className="h3">LinkedIn</h2>
              <p className="muted">Pour suivre nos projets et nos partenariats côté pro.</p>
              <a className="btn btn-ghost" href={site.linkedin} target="_blank" rel="noopener">
                Page LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
