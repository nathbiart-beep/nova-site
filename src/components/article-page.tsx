import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { articleHref, formatDate, getArticle, getArticles, readingTime, reader, type Category } from "@/lib/content";
import { SITE_URL, site, villeName } from "@/lib/site";
import { ArticleCard } from "./cards";
import { Breadcrumbs, JsonLd } from "./layout-parts";
import { MarkdocContent } from "./markdoc";

const sectionInfo: Record<Category, { name: string; href: string }> = {
  blog: { name: "Blog", href: "/blog" },
  actualite: { name: "Actualités", href: "/actualites" },
};

export async function articleParams(category: Category) {
  const all = await getArticles(category);
  return all.map((a) => ({ slug: a.slug }));
}

export async function articleMetadata(slug: string, category: Category): Promise<Metadata> {
  const a = await reader.collections.articles.read(slug);
  if (!a || a.category !== category) return {};
  const url = articleHref({ slug, category });
  const image = a.cover ? [{ url: a.cover, alt: a.coverAlt || a.title }] : undefined;
  return {
    title: a.title,
    description: a.excerpt,
    keywords: [...a.tags],
    alternates: { canonical: url },
    authors: [{ name: a.author }],
    openGraph: {
      type: "article",
      title: a.title,
      description: a.excerpt,
      url,
      publishedTime: a.date ?? undefined,
      authors: [a.author],
      tags: [...a.tags],
      images: image,
    },
    twitter: { card: "summary_large_image", title: a.title, description: a.excerpt },
  };
}

export async function ArticlePage({ slug, category }: { slug: string; category: Category }) {
  const a = await getArticle(slug);
  if (!a || a.category !== category) notFound();
  const section = sectionInfo[category];
  const url = `${SITE_URL}${articleHref({ slug, category })}`;
  const minutes = readingTime(a.node);
  const others = (await getArticles()).filter((o) => o.slug !== slug).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": category === "actualite" ? "NewsArticle" : "BlogPosting",
    headline: a.title,
    description: a.excerpt,
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: "fr-BE",
    mainEntityOfPage: url,
    url,
    image: a.cover ? `${SITE_URL}${a.cover}` : `${SITE_URL}/logo-nova.png`,
    author: { "@type": a.author === "L'équipe NOVA" ? "Organization" : "Person", name: a.author },
    publisher: { "@type": "Organization", name: "NOVA", logo: { "@type": "ImageObject", url: `${SITE_URL}/logo-nova.png` } },
    keywords: a.tags.join(", "),
    contentLocation: a.ville !== "toutes" ? { "@type": "City", name: villeName(a.ville) } : undefined,
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: section.name, item: `${SITE_URL}${section.href}` },
      { "@type": "ListItem", position: 3, name: a.title, item: url },
    ],
  };

  return (
    <>
      <article className="section">
        <div className="container narrow">
          <Breadcrumbs items={[{ name: section.name, href: section.href }, { name: a.title }]} />
          <p className="meta">
            <span className="tag">{section.name}</span>
            <time dateTime={a.date ?? undefined}>{formatDate(a.date)}</time>
            <span>· {minutes} min de lecture</span>
            <span>· {villeName(a.ville)}</span>
          </p>
          <h1 className="article-title">{a.title}</h1>
          <p className="lead">{a.excerpt}</p>
          <p className="muted small">Par {a.author}</p>
          {a.cover && (
            <figure className="article-cover">
              <Image src={a.cover} alt={a.coverAlt || a.title} width={1200} height={630} priority sizes="(max-width: 860px) 100vw, 860px" />
            </figure>
          )}
          <MarkdocContent node={a.node} />
          {a.tags.length > 0 && (
            <p className="chip-row">
              {a.tags.map((t) => (
                <span key={t} className="chip chip-static">
                  #{t}
                </span>
              ))}
            </p>
          )}
          <div className="card share-box">
            <p>
              <strong>Tu as aimé cet article ?</strong> Suis NOVA sur Instagram pour l'agenda des soirées de la semaine.
            </p>
            <a className="btn" href={site.instagram} target="_blank" rel="noopener">
              Suivre {site.instagramHandle}
            </a>
          </div>
        </div>
      </article>
      {others.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <h2>À lire aussi</h2>
            <div className="grid-3">
              {others.map((o) => (
                <ArticleCard key={o.slug} a={o} />
              ))}
            </div>
            <p>
              <Link href={section.href} className="link-strong">
                Tous les articles : {section.name} →
              </Link>
            </p>
          </div>
        </section>
      )}
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbLd} />
    </>
  );
}

export async function ArticleList({ category }: { category: Category }) {
  const articles = await getArticles(category);
  return articles.length ? (
    <div className="grid-3">
      {articles.map((a) => (
        <ArticleCard key={a.slug} a={a} />
      ))}
    </div>
  ) : (
    <p className="muted">Les premiers articles arrivent bientôt.</p>
  );
}
