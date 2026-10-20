import Link from "next/link";
import { LogoLink, Star } from "./brand";
import { nav, site, villeList } from "@/lib/site";

export function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <LogoLink />
        <nav aria-label="Navigation principale" className="main-nav">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-cta">
          <a className="btn btn-small" href={site.instagram} target="_blank" rel="noopener">
            Instagram
          </a>
          <a className="btn btn-small btn-ghost" href={site.linkedin} target="_blank" rel="noopener">
            LinkedIn
          </a>
        </div>
        <details className="mobile-nav">
          <summary aria-label="Ouvrir le menu">
            <span />
            <span />
            <span />
          </summary>
          <nav aria-label="Menu mobile">
            {nav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            {villeList.map((v) => (
              <Link key={v.slug} href={`/villes/${v.slug}`}>
                Soirées à {v.name}
              </Link>
            ))}
            <a href={site.instagram} target="_blank" rel="noopener">
              Instagram
            </a>
            <a href={site.linkedin} target="_blank" rel="noopener">
              LinkedIn
            </a>
          </nav>
        </details>
      </div>
    </header>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">
            <LogoLink />
          </p>
          <p className="muted">{site.tagline}.</p>
          <p className="muted">Média, événements et partenariats étudiants à Bruxelles, Namur et Louvain-la-Neuve.</p>
        </div>
        <div>
          <h2 className="footer-title">Soirées par ville</h2>
          <ul className="footer-links">
            {villeList.map((v) => (
              <li key={v.slug}>
                <Link href={`/villes/${v.slug}`}>Soirées étudiantes à {v.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/agenda">Tout l'agenda</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">NOVA</h2>
          <ul className="footer-links">
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/actualites">Actualités</Link></li>
            <li><Link href="/partenaires">Devenir partenaire</Link></li>
            <li><Link href="/a-propos">L'équipe</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Nous suivre</h2>
          <ul className="footer-links">
            <li><a href={site.instagram} target="_blank" rel="noopener">Instagram {site.instagramHandle}</a></li>
            <li><a href={site.linkedin} target="_blank" rel="noopener">LinkedIn</a></li>
            <li><a href="/rss.xml">Flux RSS</a></li>
            <li className="selectable">{site.email}</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <Star size={18} className="accent" />
        <span>© {year} NOVA. Par des étudiants, pour des étudiants.</span>
      </div>
    </footer>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="breadcrumbs">
      <ol>
        <li>
          <Link href="/">Accueil</Link>
        </li>
        {items.map((it, i) => (
          <li key={i}>{it.href && i < items.length - 1 ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}</li>
        ))}
      </ol>
    </nav>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function PageHero({ eyebrow, title, intro, children }: { eyebrow?: string; title: string; intro?: string; children?: React.ReactNode }) {
  return (
    <section className="page-hero">
      <div className="container">
        {eyebrow && <p className="pill">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="lead">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
