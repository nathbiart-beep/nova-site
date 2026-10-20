import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brusselsOffset, formatDate, reader } from "@/lib/content";
import { SITE_URL, site, villeName, villes, type VilleSlug } from "@/lib/site";
import { Breadcrumbs, JsonLd } from "@/components/layout-parts";

export async function generateStaticParams() {
  const slugs = await reader.collections.evenements.list();
  return slugs.map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const e = await reader.collections.evenements.read(slug);
  if (!e) return {};
  const where = [e.lieu, villeName(e.ville)].filter(Boolean).join(", ");
  const description =
    (e.description?.slice(0, 150) || `${e.title} le ${formatDate(e.date, true)} à ${where}.`) + " Toutes les infos sur NOVA.";
  return {
    title: `${e.title} · ${formatDate(e.date)} · ${villeName(e.ville)}`,
    description,
    alternates: { canonical: `/agenda/${slug}` },
    openGraph: { type: "website", title: e.title, description, images: e.image ? [e.image] : undefined },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const e = await reader.collections.evenements.read(slug);
  if (!e) notFound();
  const ville = villes[e.ville as VilleSlug];
  const start = e.date ? `${e.date}T${/^\d{1,2}:\d{2}$/.test(e.heure) ? e.heure.padStart(5, "0") : "20:00"}:00${brusselsOffset(e.date)}` : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    startDate: start,
    endDate: e.dateFin || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    description: e.description || undefined,
    image: e.image ? [`${SITE_URL}${e.image}`] : [`${SITE_URL}/logo-nova.png`],
    url: `${SITE_URL}/agenda/${slug}`,
    location: {
      "@type": "Place",
      name: e.lieu || ville?.name,
      address: { "@type": "PostalAddress", streetAddress: e.adresse || undefined, addressLocality: ville?.name, addressCountry: "BE" },
    },
    organizer: e.organisateur
      ? { "@type": "Organization", name: e.organisateur }
      : { "@type": "Organization", name: "NOVA", url: SITE_URL },
    offers: e.lien
      ? { "@type": "Offer", url: e.lien, availability: "https://schema.org/InStock", price: /gratuit/i.test(e.prix) ? "0" : undefined, priceCurrency: "EUR" }
      : undefined,
  };

  return (
    <article className="section">
      <div className="container narrow">
        <Breadcrumbs items={[{ name: "Agenda", href: "/agenda" }, { name: e.title }]} />
        <p className="pill">{villeName(e.ville)}</p>
        <h1>{e.title}</h1>
        <dl className="event-facts card">
          <div>
            <dt>Date</dt>
            <dd>
              {formatDate(e.date, true)}
              {e.dateFin && e.dateFin !== e.date ? ` → ${formatDate(e.dateFin, true)}` : ""}
            </dd>
          </div>
          {e.heure && (
            <div>
              <dt>Heure</dt>
              <dd>{e.heure}</dd>
            </div>
          )}
          {e.lieu && (
            <div>
              <dt>Lieu</dt>
              <dd>
                {e.lieu}
                {e.adresse ? `, ${e.adresse}` : ""}
              </dd>
            </div>
          )}
          {e.organisateur && (
            <div>
              <dt>Organisateur</dt>
              <dd>{e.organisateur}</dd>
            </div>
          )}
          {e.prix && (
            <div>
              <dt>Prix</dt>
              <dd>{e.prix}</dd>
            </div>
          )}
        </dl>
        {e.image && (
          <div className="event-poster">
            <Image src={e.image} alt={`Affiche : ${e.title}`} width={800} height={1000} sizes="(max-width: 800px) 100vw, 800px" />
          </div>
        )}
        {e.description && <div className="prose">{e.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}</div>}
        <div className="btn-row">
          {e.lien && (
            <a className="btn" href={e.lien} target="_blank" rel="noopener">
              Infos et tickets
            </a>
          )}
          {ville && (
            <Link className="btn btn-ghost" href={`/villes/${ville.slug}`}>
              Autres soirées à {ville.name}
            </Link>
          )}
        </div>
        <p className="muted small">
          Une info a changé ? Préviens-nous sur Instagram ({site.instagramHandle}).
        </p>
      </div>
      <JsonLd data={jsonLd} />
    </article>
  );
}
