import Link from "next/link";
import { getArticles, getEvents, dayParts } from "@/lib/content";
import { site, villeList, villeName } from "@/lib/site";
import { ArticleCard, EmptyAgenda, EventRow } from "@/components/cards";
import { Star, Wordmark } from "@/components/brand";
import { JsonLd } from "@/components/layout-parts";

export const revalidate = 3600;

const faq = [
  {
    q: "C'est quoi NOVA ?",
    a: "NOVA est un collectif étudiant actif à Bruxelles, Namur et Louvain-la-Neuve. On publie chaque semaine l'agenda des soirées étudiantes, on organise des événements et on monte des partenariats entre les marques et les étudiants.",
  },
  {
    q: "Où trouver l'agenda des soirées étudiantes de la semaine ?",
    a: "Sur la page Agenda de ce site et en story à la une sur Instagram (@novastudent.be), avec une story par ville : Bruxelles, Namur et Louvain-la-Neuve.",
  },
  {
    q: "Je suis dans un cercle : comment faire apparaître notre soirée ?",
    a: "Envoie-nous ton événement en DM sur Instagram ou par e-mail avec la date, l'heure, le lieu et l'organisateur. On identifie toujours les cercles et les organisateurs.",
  },
  {
    q: "Je suis une marque : comment travailler avec NOVA ?",
    a: "On propose des formules sur mesure : visibilité en story, concours, flyers, activations sur les campus et code promo dédié. Tout est expliqué sur la page Partenaires.",
  },
];

export default async function Home() {
  const [events, articles] = await Promise.all([getEvents({ upcomingOnly: true }), getArticles()]);
  const next = events.slice(0, 5);

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="pill">Bruxelles · Namur · Louvain-la-Neuve</p>
            <h1>
              Les soirées étudiantes, <span className="hl">chaque semaine</span>, au même endroit.
            </h1>
            <p className="lead">
              NOVA est le collectif étudiant qui fait vivre la nuit et la vie étudiante : l'agenda des soirées par ville, des événements, des guides et des bons plans. Par des étudiants, pour des étudiants.
            </p>
            <div className="btn-row">
              <Link className="btn" href="/agenda">
                Voir l'agenda
              </Link>
              <a className="btn btn-ghost" href={site.instagram} target="_blank" rel="noopener">
                Suivre {site.instagramHandle}
              </a>
            </div>
          </div>

          <div className="story-mock" aria-label="Aperçu de l'agenda de la semaine">
            <div className="story-head">
              <Wordmark size="2.4rem" />
              <span className="pill pill-solid">Cette semaine</span>
            </div>
            {next.length > 0 ? (
              <ul className="story-list">
                {next.slice(0, 4).map((e) => {
                  const d = dayParts(e.entry.date);
                  return (
                    <li key={e.slug}>
                      <span className="story-time">
                        {d.weekday} {d.day}
                      </span>
                      <Link href={`/agenda/${e.slug}`} className="story-card">
                        <strong>{e.entry.title}</strong>
                        <span>{e.entry.lieu || villeName(e.entry.ville)}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <ul className="story-list">
                {villeList.map((v) => (
                  <li key={v.slug}>
                    <span className="story-time">{v.short}</span>
                    <Link href={`/villes/${v.slug}`} className="story-card">
                      <strong>Soirées à {v.name}</strong>
                      <span>Agenda de la semaine</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="story-foot">
              Ta soirée sur notre story ? <strong>Envoie-la en DM</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Les soirées par ville</h2>
            <p className="muted">Une page par ville, mise à jour chaque semaine.</p>
          </div>
          <div className="grid-3">
            {villeList.map((v) => (
              <Link key={v.slug} href={`/villes/${v.slug}`} className="card city-card">
                <span className="city-short">{v.short}</span>
                <span className="city-name">Soirées étudiantes à {v.name}</span>
                <span className="muted small">{v.campus.slice(0, 3).join(" · ")}</span>
                <span className="arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>Prochainement</h2>
            <Link href="/agenda" className="link-strong">
              Tout l'agenda →
            </Link>
          </div>
          {next.length ? (
            <div className="event-list">
              {next.map((e) => (
                <EventRow key={e.slug} e={e} />
              ))}
            </div>
          ) : (
            <EmptyAgenda />
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Ce qu'on fait</h2>
          </div>
          <div className="grid-4">
            {[
              ["Média", "L'agenda hebdo des soirées par ville, des stories, des concours et des micro-trottoirs."],
              ["Événements", "On organise et co-organise des soirées et des événements avec les cercles, les bars et les boîtes."],
              ["Activations", "Tournées des campus, distributions gratuites, kits de survie blocus."],
              ["Partenariats", "On connecte les marques aux étudiants, en ligne et sur le terrain."],
            ].map(([t, d]) => (
              <div key={t} className="card pillar">
                <Star size={34} className="accent" />
                <h3>{t}</h3>
                <p className="muted">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {articles.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-head">
              <h2>Guides et actus</h2>
              <Link href="/blog" className="link-strong">
                Tous les articles →
              </Link>
            </div>
            <div className="grid-3">
              {articles.slice(0, 3).map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Vous voulez toucher les étudiants ?</h2>
              <p>
                Marques, organisateurs, associations : visibilité en story, concours, activations sur les campus, code promo dédié. On construit la formule avec vous.
              </p>
            </div>
            <Link href="/partenaires" className="btn btn-dark">
              Devenir partenaire
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow">
          <h2>Questions fréquentes</h2>
          <div className="faq">
            {faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
    </>
  );
}
