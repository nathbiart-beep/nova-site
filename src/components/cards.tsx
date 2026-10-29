import Link from "next/link";
import Image from "next/image";
import { articleHref, dayParts, formatDate } from "@/lib/content";
import { villeName } from "@/lib/site";
import { Star } from "./brand";

type ArticleEntry = {
  slug: string;
  entry: {
    title: string;
    category: string;
    date: string | null;
    excerpt: string;
    ville: string;
    cover: string | null;
    coverAlt: string;
  };
};

export function ArticleCard({ a }: { a: ArticleEntry }) {
  const href = articleHref(a);
  return (
    <article className="card article-card">
      <Link href={href} className="article-card-media" tabIndex={-1} aria-hidden="true">
        {a.entry.cover ? (
          <Image src={a.entry.cover} alt="" fill sizes="(max-width: 700px) 100vw, 33vw" />
        ) : (
          <div className="article-card-placeholder">
            <Star size={64} />
          </div>
        )}
      </Link>
      <div className="article-card-body">
        <p className="meta">
          <span className="tag">{a.entry.category === "actualite" ? "Actualité" : "Blog"}</span>
          <time dateTime={a.entry.date ?? undefined}>{formatDate(a.entry.date)}</time>
        </p>
        <h3>
          <Link href={href}>{a.entry.title}</Link>
        </h3>
        <p className="muted">{a.entry.excerpt}</p>
        <p className="meta small">{villeName(a.entry.ville)}</p>
      </div>
    </article>
  );
}

type EventEntry = {
  slug: string;
  entry: {
    title: string;
    date: string | null;
    heure: string;
    ville: string;
    lieu: string;
    organisateur: string;
    prix: string;
    nova: boolean;
  };
};

export function EventRow({ e }: { e: EventEntry }) {
  const d = dayParts(e.entry.date);
  return (
    <article className="event-row">
      <div className="event-date" aria-hidden="true">
        <span className="event-weekday">{d.weekday}</span>
        <span className="event-day">{d.day}</span>
        <span className="event-month">{d.month}</span>
      </div>
      <div className="event-body">
        <h3>
          <Link href={`/agenda/${e.slug}`}>{e.entry.title}</Link>
        </h3>
        <p className="event-meta">
          <time dateTime={e.entry.date ?? undefined}>{formatDate(e.entry.date, true)}</time>
          {e.entry.heure && <> · {e.entry.heure}</>}
          {e.entry.lieu && <> · {e.entry.lieu}</>}
        </p>
        <p className="event-tags">
          <span className="tag">{villeName(e.entry.ville)}</span>
          {e.entry.organisateur && <span className="tag tag-ghost">{e.entry.organisateur}</span>}
          {e.entry.prix && <span className="tag tag-ghost">{e.entry.prix}</span>}
          {e.entry.nova && <span className="tag tag-green">Événement NOVA</span>}
        </p>
      </div>
    </article>
  );
}

export function EmptyAgenda({ ville }: { ville?: string }) {
  return (
    <div className="card empty">
      <Star size={40} className="accent" />
      <p>
        <strong>Pas encore de soirée annoncée{ville ? ` à ${ville}` : ""} sur le site.</strong>
      </p>
      <p className="muted">
        L'agenda complet de la semaine est publié chaque lundi en story à la une sur Instagram. Tu organises une soirée ? Envoie-la-nous en DM.
      </p>
      <a className="btn" href="https://www.instagram.com/novastudent.be/" target="_blank" rel="noopener">
        Voir l'agenda sur Instagram
      </a>
    </div>
  );
}
