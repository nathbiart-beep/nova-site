import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticles, getEvents } from "@/lib/content";
import { SITE_URL, site, villeList, villes, type VilleSlug } from "@/lib/site";
import { ArticleCard, EmptyAgenda, EventRow } from "@/components/cards";
import { Breadcrumbs, JsonLd, PageHero } from "@/components/layout-parts";

export const revalidate = 3600;
export const dynamicParams = false;

export function generateStaticParams() {
  return villeList.map((v) => ({ ville: v.slug }));
}

type Props = { params: Promise<{ ville: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const v = villes[ville as VilleSlug];
  if (!v) return {};
  return {
    title: v.title,
    description: v.metaDescription,
    alternates: { canonical: `/villes/${v.slug}` },
    openGraph: { title: v.title, description: v.metaDescription },
  };
}

export default async function VillePage({ params }: Props) {
  const { ville } = await params;
  const v = villes[ville as VilleSlug];
  if (!v) notFound();
  const [events, articles] = await Promise.all([
    getEvents({ upcomingOnly: true, ville: v.slug }),
    getArticles(),
  ]);
  const related = articles.filter((a) => a.entry.ville === v.slug || a.entry.ville === "toutes").slice(0, 3);

  return (
    <>
      <PageHero eyebrow={`Soirées · ${v.name}`} title={v.title} intro={v.intro} />
      <section className="section">
        <div className="container">
          <Breadcrumbs items={[{ name: "Agenda", href: "/agenda" }, { name: v.name }]} />
          <h2>Les prochaines soirées à {v.name}</h2>
          {events.length ? (
            <div className="event-list">
              {events.map((e) => (
                <EventRow key={e.slug} e={e} />
              ))}
            </div>
          ) : (
            <EmptyAgenda ville={v.name} />
          )}
        </div>
      </section>

      <section className="section section-alt">
        <div className="container grid-2">
          <div>
            <h2>La vie étudiante à {v.name}</h2>
            <p>{v.lieux}</p>
            <p>
              Chaque semaine, NOVA publie une story à la une dédiée à {v.name}, avec les cercles et les organisateurs identifiés. Pour ne rien rater, suis{" "}
              <a href={site.instagram} target="_blank" rel="noopener">
                {site.instagramHandle}
              </a>
              .
            </p>
          </div>
          <div className="card">
            <h3>Campus et écoles</h3>
            <ul className="check-list">
              {v.campus.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <h2>À lire pour {v.name}</h2>
            <div className="grid-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} a={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container narrow">
          <h2>Questions fréquentes sur les soirées à {v.name}</h2>
          <div className="faq">
            {v.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
          <p className="muted">
            Les autres villes :{" "}
            {villeList
              .filter((o) => o.slug !== v.slug)
              .map((o, i) => (
                <span key={o.slug}>
                  {i > 0 && " · "}
                  <Link href={`/villes/${o.slug}`}>soirées étudiantes à {o.name}</Link>
                </span>
              ))}
          </p>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: v.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: v.title,
          url: `${SITE_URL}/villes/${v.slug}`,
          about: { "@type": "City", name: v.name, geo: { "@type": "GeoCoordinates", latitude: v.geo.lat, longitude: v.geo.lng } },
        }}
      />
    </>
  );
}
