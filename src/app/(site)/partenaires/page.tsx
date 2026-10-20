import type { Metadata } from "next";
import Image from "next/image";
import { getPartenaires } from "@/lib/content";
import { site } from "@/lib/site";
import { Star } from "@/components/brand";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/layout-parts";

export const metadata: Metadata = {
  title: "Devenir partenaire : marketing étudiant à Bruxelles, Namur et LLN",
  description:
    "Touchez les étudiants de Bruxelles, Namur et Louvain-la-Neuve avec NOVA : stories, concours, activations sur les campus, sampling, événements et code promo dédié.",
  alternates: { canonical: "/partenaires" },
};

const offres = [
  ["Story à la une Partenaires", "Votre marque présente en permanence dans notre story à la une."],
  ["Stories dédiées", "Des stories régulières pour présenter vos produits, vos offres ou vos événements."],
  ["Flyers et visuels", "Votre nom et votre logo sur nos flyers, nos visuels et notre agenda."],
  ["Concours", "Des concours avec vos produits ou vos places, pour créer de l'engagement."],
  ["Événements et activations", "Co-organisation de soirées, tournées des campus, distributions et sampling."],
  ["Code promo NOVA", "Un code dédié pour mesurer précisément ce que le partenariat vous rapporte."],
];

const operations = [
  ["Tournée des unifs avant le blocus", "Distribution gratuite sur les campus de Bruxelles, Namur et Louvain-la-Neuve, début décembre."],
  ["Kit de survie blocus", "Des kits complets à gagner et une carte NOVA avec les codes promo de nos partenaires."],
  ["Carte des spots de blocus", "Les meilleurs endroits pour étudier dans chaque ville."],
  ["Saint-V", "Couverture complète du 20 novembre à Bruxelles."],
  ["Tournée retour des soirées", "Après les examens, on fête le retour des soirées sur les campus."],
  ["NOVA Awards", "Les meilleures soirées de l'année, votées par les étudiants."],
];

export default async function PartenairesPage() {
  const partenaires = await getPartenaires();
  return (
    <>
      <PageHero
        eyebrow="Partenaires"
        title="Touchez les étudiants là où ils sont"
        intro="NOVA connecte les marques aux étudiants de Bruxelles, Namur et Louvain-la-Neuve : en ligne, sur les campus et en soirée. Chaque partenariat est construit sur mesure."
      >
        <div className="btn-row">
          <a className="btn" href={`mailto:${site.email}?subject=Partenariat%20NOVA`}>
            Nous écrire
          </a>
          <a className="btn btn-ghost" href={site.instagram} target="_blank" rel="noopener">
            Voir notre Instagram
          </a>
        </div>
        <p className="muted small selectable">{site.email}</p>
      </PageHero>

      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Partenaires" }]} />
          <div className="stats">
            <div className="stat card">
              <strong>100 %</strong>
              <span>étudiants, surtout en Bac 2</span>
            </div>
            <div className="stat card">
              <strong>3 villes</strong>
              <span>Bruxelles, Namur, Louvain-la-Neuve</span>
            </div>
            <div className="stat card">
              <strong>70 000</strong>
              <span>vues par mois pendant notre campagne d'avril-mai 2026</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <h2>Ce qu'on vous propose</h2>
          <div className="grid-3">
            {offres.map(([t, d]) => (
              <div key={t} className="card pillar">
                <Star size={30} className="accent" />
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
          <p className="pill pill-solid big-pill">Formules sur mesure, à discuter ensemble</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>Nos opérations 2026-2027</h2>
          <p className="muted">Associez votre marque à l'opération de votre choix.</p>
          <ol className="ops">
            {operations.map(([t, d]) => (
              <li key={t} className="card">
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {partenaires.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2>Ils nous ont fait confiance</h2>
            <div className="partner-grid">
              {partenaires.map((p) => (
                <div key={p.slug} className="card partner">
                  {p.entry.logo ? (
                    <Image src={p.entry.logo} alt={`Logo ${p.entry.name}`} width={160} height={80} />
                  ) : (
                    <strong className="partner-name">{p.entry.name}</strong>
                  )}
                  {p.entry.description && <p className="muted small">{p.entry.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>On en parle ?</h2>
              <p>Dites-nous ce que vous cherchez : notoriété, ventes, téléchargements. On vous propose une formule adaptée sous 48 heures.</p>
              <p className="selectable">
                <strong>{site.email}</strong>
              </p>
            </div>
            <a className="btn btn-dark" href={`mailto:${site.email}?subject=Partenariat%20NOVA`}>
              Envoyer un e-mail
            </a>
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: "Partenariats et marketing étudiant",
          provider: { "@type": "Organization", name: "NOVA" },
          areaServed: ["Bruxelles", "Namur", "Louvain-la-Neuve"],
          audience: { "@type": "Audience", audienceType: "Étudiants" },
          description: metadata.description,
        }}
      />
    </>
  );
}
