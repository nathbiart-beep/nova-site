import Link from "next/link";
import type { Metadata } from "next";
import { checkAdmin } from "@/lib/admin-auth";
import { analyticsEnabled } from "@/lib/analytics-db";
import { FILTER_KEYS, PERIODS, TZ, getDashboard, type Filters, type Kpis, type Period } from "@/lib/analytics-queries";
import { AutoRefresh, IgnoreToggle } from "./client";
import "./stats.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Statistiques", robots: { index: false, follow: false } };

type SP = Record<string, string | string[] | undefined>;
type Row = Record<string, string | null>;

const nf = new Intl.NumberFormat("fr-BE");
const num = (v: number | string | null | undefined) => nf.format(Math.round(Number(v ?? 0)));
const pct = (v: number | string | null | undefined) => `${Math.round(Number(v ?? 0) * 100)} %`;
const dur = (ms: number | string | null | undefined) => {
  const s = Math.round(Number(ms ?? 0) / 1000);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m} min ${String(s % 60).padStart(2, "0")} s` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}`;
};
const ago = (s: number) => (s < 60 ? "à l'instant" : s < 3600 ? `il y a ${Math.floor(s / 60)} min` : s < 86400 ? `il y a ${Math.floor(s / 3600)} h` : `il y a ${Math.floor(s / 86400)} j`);

const countryNames = new Intl.DisplayNames(["fr"], { type: "region" });
const flag = (cc: string | null | undefined) =>
  cc && /^[A-Z]{2}$/.test(cc) ? String.fromCodePoint(...[...cc].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : "🌐";
const countryName = (cc: string | null | undefined) => {
  if (!cc || !/^[A-Z]{2}$/.test(cc)) return "Inconnu";
  try {
    return countryNames.of(cc) || cc;
  } catch {
    return cc;
  }
};

const BE_REGIONS: Record<string, string> = {
  BRU: "Bruxelles-Capitale", VAN: "Anvers", VBR: "Brabant flamand", VLI: "Limbourg", VOV: "Flandre-Orientale",
  VWV: "Flandre-Occidentale", WBR: "Brabant wallon", WHT: "Hainaut", WLG: "Liège", WLX: "Luxembourg", WNA: "Namur",
};
const regionName = (cc: string | null, code: string | null) => (!code ? null : cc === "BE" ? (BE_REGIONS[code] ?? code) : code);

function qs(sp: SP, patch: Record<string, string | null>) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string" && v) u.set(k, v);
  for (const [k, v] of Object.entries(patch)) (v ? u.set(k, v) : u.delete(k));
  const s = u.toString();
  return `/admin/stats${s ? "?" + s : ""}`;
}

export default async function StatsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const auth = await checkAdmin();
  if (!auth.ok) return <Gate reason={auth.reason} />;
  if (!analyticsEnabled()) return <Shell login={auth.login}><p className="st-empty">La base de données n'est pas encore reliée au site (variable DATABASE_URL manquante).</p></Shell>;

  const p = (typeof sp.p === "string" && sp.p in PERIODS ? sp.p : "30d") as Period;
  const filters: Filters = {};
  for (const k of Object.keys(FILTER_KEYS) as (keyof typeof FILTER_KEYS)[]) if (typeof sp[k] === "string" && sp[k]) filters[k] = sp[k] as string;

  let d: Awaited<ReturnType<typeof getDashboard>>;
  try {
    d = await getDashboard(p, filters);
  } catch (e) {
    return (
      <Shell login={auth.login}>
        <p className="st-empty">Impossible de lire les statistiques pour le moment : {(e as Error).message}</p>
      </Shell>
    );
  }

  const F = (key: keyof typeof FILTER_KEYS, value: string | null | undefined) => (value ? qs(sp, { [key]: value }) : null);

  return (
    <Shell login={auth.login}>
      <AutoRefresh seconds={60} />

      <div className="st-bar">
        <nav className="st-periods" aria-label="Période">
          {(Object.keys(PERIODS) as Period[]).map((k) => (
            <Link key={k} href={qs(sp, { p: k })} className={k === p ? "on" : ""}>
              {PERIODS[k]}
            </Link>
          ))}
        </nav>
        <div className="st-live">
          <span className="st-dot" /> <strong>{num(d.live)}</strong> en ligne maintenant
        </div>
      </div>

      {Object.keys(filters).length > 0 && (
        <div className="st-filters">
          Filtré par :
          {(Object.entries(filters) as [keyof typeof FILTER_KEYS, string][]).map(([k, v]) => (
            <Link key={k} href={qs(sp, { [k]: null })} className="st-chip">
              {FILTER_KEYS[k]} : {k === "country" ? countryName(v) : v} ✕
            </Link>
          ))}
          <Link href={qs(Object.fromEntries(Object.entries(sp).filter(([k]) => k === "p")), {})} className="st-chip st-chip-clear">
            Tout effacer
          </Link>
        </div>
      )}

      <section className="st-kpis">
        <Kpi label="Visiteurs uniques" v={d.current.visitors} prev={d.previous.visitors} fmt={num} />
        <Kpi label="Visites" v={d.current.sessions} prev={d.previous.sessions} fmt={num} />
        <Kpi label="Pages vues" v={d.current.pageviews} prev={d.previous.pageviews} fmt={num} />
        <Kpi label="Pages / visite" v={d.current.pagesPerSession} prev={d.previous.pagesPerSession} fmt={(x) => (Number(x) || 0).toFixed(1).replace(".", ",")} />
        <Kpi label="Durée moy. d'une visite" v={d.current.avgSession} prev={d.previous.avgSession} fmt={dur} />
        <Kpi label="Temps moyen par page" v={d.current.avgTimeOnPage} prev={d.previous.avgTimeOnPage} fmt={dur} />
        <Kpi label="Taux de rebond" v={d.current.bounce} prev={d.previous.bounce} fmt={pct} inverse />
        <Kpi label="Clics suivis" v={d.current.events} prev={d.previous.events} fmt={num} />
      </section>

      <section className="st-card st-wide">
        <div className="st-card-head">
          <h2>Évolution</h2>
          <span className="st-legend">
            <i className="pv" /> Pages vues <i className="uv" /> Visiteurs
          </span>
        </div>
        <Chart series={d.series} range={d.range} />
      </section>

      <div className="st-grid">
        <Card title="Temps réel" sub="Pages ouvertes ces 5 dernières minutes">
          {d.livePages.length === 0 ? (
            <p className="st-empty">Personne sur le site en ce moment.</p>
          ) : (
            <Bars rows={d.livePages.map((r) => ({ label: r.path, c: r.c }))} value="c" valueLabel="Visiteurs" />
          )}
        </Card>
        <Card title="Dernières actions" sub="Les 30 derniers passages, toutes périodes">
          <ul className="st-feed">
            {d.feed.map((r, i) => (
              <li key={i}>
                <span className="st-feed-t" title={r.t ?? ""}>{ago(Number(r.ago))}</span>
                <span className="st-feed-main">
                  {r.type === "event" ? <b>{r.event_name}</b> : null} {r.type === "event" ? (r.event_label ?? "") : r.path}
                  <small>
                    {flag(r.country)} {r.city ?? countryName(r.country)} · {r.device} · {r.browser}
                    {r.source && r.source !== "Direct" ? ` · via ${r.source}` : ""}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Section title="Contenu" />
      <div className="st-grid">
        <Card title="Pages les plus vues" wide>
          <Tbl
            rows={d.pages}
            cols={[
              { k: "views", l: "Vues", f: num },
              { k: "visitors", l: "Visiteurs", f: num },
              { k: "avg_time", l: "Temps moyen", f: dur },
              { k: "scroll", l: "Lu jusqu'à", f: (v) => (v == null ? "—" : `${Math.round(Number(v))} %`) },
            ]}
            bar="views"
            href={(r) => F("page", r.label)}
            sub={(r) => r.title?.replace(/ · NOVA$/, "") ?? null}
          />
        </Card>
        <Card title="Soirées & événements les plus consultés">
          <Tbl rows={d.agenda} cols={[{ k: "views", l: "Vues", f: num }, { k: "visitors", l: "Visiteurs", f: num }]} bar="views" href={(r) => F("page", r.label)} sub={(r) => r.title?.replace(/ · NOVA$/, "") ?? null} empty="Aucune fiche d'événement vue sur la période." />
        </Card>
        <Card title="Articles les plus lus">
          <Tbl
            rows={d.articles}
            cols={[
              { k: "views", l: "Vues", f: num },
              { k: "avg_time", l: "Temps", f: dur },
              { k: "scroll", l: "Lu", f: (v) => (v == null ? "—" : `${Math.round(Number(v))} %`) },
            ]}
            bar="views"
            href={(r) => F("page", r.label)}
            sub={(r) => r.title?.replace(/ · NOVA$/, "") ?? null}
            empty="Aucun article lu sur la période."
          />
        </Card>
        <Card title="Pages d'entrée" sub="Première page de la visite">
          <Tbl rows={d.entries} cols={[{ k: "sessions", l: "Visites", f: num }, { k: "bounce", l: "Rebond", f: pct }]} bar="sessions" href={(r) => F("page", r.label)} />
        </Card>
        <Card title="Pages de sortie" sub="Dernière page avant de partir">
          <Tbl rows={d.exits} cols={[{ k: "sessions", l: "Visites", f: num }]} bar="sessions" href={(r) => F("page", r.label)} />
        </Card>
      </div>

      <Section title="Acquisition" />
      <div className="st-grid">
        <Card title="Sources de trafic" wide>
          <Tbl
            rows={d.sources}
            cols={[
              { k: "sessions", l: "Visites", f: num },
              { k: "visitors", l: "Visiteurs", f: num },
              { k: "pps", l: "Pages/visite", f: (v) => (Number(v) || 0).toFixed(1).replace(".", ",") },
              { k: "avg_dur", l: "Durée", f: dur },
              { k: "bounce", l: "Rebond", f: pct },
            ]}
            bar="sessions"
            href={(r) => F("source", r.label)}
          />
        </Card>
        <Card title="Sites référents" sub="Adresse exacte d'où viennent les visiteurs">
          <Tbl rows={d.referrers} cols={[{ k: "visits", l: "Visites", f: num }]} bar="visits" empty="Pas encore de site référent." />
        </Card>
        <Card title="Campagnes (liens UTM)" sub="Ajoute ?utm_source=…&utm_campaign=… à tes liens pour les suivre ici">
          <Tbl rows={d.campaigns} cols={[{ k: "src", l: "Source" }, { k: "medium", l: "Support" }, { k: "visits", l: "Visites", f: num }]} bar="visits" href={(r) => (r.label !== "—" ? F("campaign", r.label) : null)} empty="Aucune campagne suivie pour l'instant." />
        </Card>
      </div>

      <Section title="Audience" />
      <div className="st-grid">
        <Card title="Pays">
          <Tbl rows={d.countries} cols={[{ k: "visitors", l: "Visiteurs", f: num }, { k: "views", l: "Vues", f: num }]} bar="visitors" href={(r) => F("country", r.label)} name={(r) => `${flag(r.label)} ${countryName(r.label)}`} />
        </Card>
        <Card title="Villes">
          <Tbl rows={d.cities} cols={[{ k: "visitors", l: "Visiteurs", f: num }]} bar="visitors" href={(r) => F("city", r.label)} name={(r) => `${flag(r.country)} ${r.label}`} sub={(r) => regionName(r.country, r.region)} />
        </Card>
        <Card title="Appareils">
          <Bars rows={d.devices} value="visitors" valueLabel="Visiteurs" href={(r) => F("device", r.label)} share />
        </Card>
        <Card title="Navigateurs">
          <Bars rows={d.browsers} value="visitors" valueLabel="Visiteurs" href={(r) => F("browser", r.label)} share />
        </Card>
        <Card title="Systèmes">
          <Bars rows={d.oses} value="visitors" valueLabel="Visiteurs" share />
        </Card>
        <Card title="Tailles d'écran">
          <Bars rows={d.screens} value="visitors" valueLabel="Visiteurs" share />
        </Card>
        <Card title="Langues du navigateur">
          <Bars rows={d.langs} value="visitors" valueLabel="Visiteurs" share />
        </Card>
        <Card title="Quand les gens viennent" sub={`Pages vues par jour et par heure (heure belge)`} wide>
          <Heatmap cells={d.heat} />
        </Card>
      </div>

      <Section title="Engagement" />
      <div className="st-grid">
        <Card title="Clics suivis" sub="Instagram, billetteries, e-mails, boutons…">
          <Tbl rows={d.events} cols={[{ k: "clicks", l: "Clics", f: num }, { k: "visitors", l: "Visiteurs", f: num }]} bar="clicks" empty="Aucun clic suivi sur la période." />
        </Card>
        <Card title="Liens et boutons cliqués" wide>
          <Tbl rows={d.eventLabels} cols={[{ k: "kind", l: "Type" }, { k: "page", l: "Surtout depuis" }, { k: "clicks", l: "Clics", f: num }]} bar="clicks" empty="Aucun clic suivi sur la période." />
        </Card>
        <Card title="Pages introuvables (404)" sub="Liens cassés à corriger">
          <Tbl rows={d.notFound} cols={[{ k: "hits", l: "Fois", f: num }]} bar="hits" sub={(r) => (r.ref ? `depuis ${r.ref}` : null)} empty="Aucune erreur 404, parfait." />
        </Card>
      </div>

      <footer className="st-foot">
        <div>
          {num(d.total.pv)} pages vues enregistrées{d.total.since ? ` depuis le ${d.total.since}` : ""}. Mesure sans cookie : un visiteur
          unique est compté une fois par jour, sans pouvoir être suivi d'un jour à l'autre. Les données se mettent à jour toutes les 60 secondes.
        </div>
        <div className="st-foot-actions">
          <IgnoreToggle />
          <a className="st-btn" href={`/admin/stats/export?p=${p}`}>Exporter en CSV</a>
        </div>
      </footer>
    </Shell>
  );
}

/* ——— Mise en page ——— */

function Shell({ children, login }: { children: React.ReactNode; login?: string }) {
  return (
    <div className="st">
      <header className="st-top">
        <Link href="/admin/stats" className="st-brand">
          <span>N</span>
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <path d="M50 4C52.6 31 63 45 94 50C63 55 52.6 69 50 96C47.4 69 37 55 6 50C37 45 47.4 31 50 4Z" />
          </svg>
          <span>VA</span>
          <em>Statistiques</em>
        </Link>
        <nav>
          <Link href="/keystatic">Contenu</Link>
          <a href="/" target="_blank" rel="noopener">Voir le site ↗</a>
          {login && <span className="st-user">@{login}</span>}
        </nav>
      </header>
      <main className="st-main">{children}</main>
    </div>
  );
}

function Gate({ reason }: { reason: "no-session" | "forbidden" | "error" }) {
  return (
    <Shell>
      <div className="st-gate">
        <h1>Accès réservé à l'équipe</h1>
        {reason === "forbidden" ? (
          <p>Ton compte GitHub n'a pas accès au site NOVA. Demande à Nathan de t'ajouter au dépôt.</p>
        ) : reason === "error" ? (
          <p>Impossible de vérifier ta connexion pour le moment. Réessaie dans un instant.</p>
        ) : (
          <p>Ouvre l'admin (connexion GitHub), puis clique sur « Statistiques » en bas à droite. Ta session dure quelques heures : si elle a expiré, il suffit de rouvrir l'admin.</p>
        )}
        <div className="st-gate-actions">
          <a className="st-btn st-btn-green" href="/keystatic">Ouvrir l'admin et se connecter</a>
          <Link className="st-btn" href="/admin/stats">Je suis connecté, réessayer</Link>
        </div>
      </div>
    </Shell>
  );
}

function Section({ title }: { title: string }) {
  return <h2 className="st-section">{title}</h2>;
}

function Card({ title, sub, children, wide }: { title: string; sub?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`st-card${wide ? " st-wide" : ""}`}>
      <div className="st-card-head">
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, v, prev, fmt, inverse }: { label: string; v: number; prev: number; fmt: (x: number) => string; inverse?: boolean }) {
  const delta = prev > 0 ? (v - prev) / prev : v > 0 ? null : 0;
  const good = delta == null ? true : inverse ? delta <= 0 : delta >= 0;
  return (
    <div className="st-kpi">
      <span className="st-kpi-l">{label}</span>
      <strong>{fmt(v)}</strong>
      <span className={`st-delta ${delta === 0 ? "flat" : good ? "up" : "down"}`} title={`Période précédente : ${fmt(prev)}`}>
        {delta == null ? "nouveau" : delta === 0 ? "=" : `${delta > 0 ? "▲" : "▼"} ${Math.abs(Math.round(delta * 100))} %`}
        <small> vs avant</small>
      </span>
    </div>
  );
}

type Col = { k: string; l: string; f?: (v: string | null) => string };

function Tbl({
  rows,
  cols,
  bar,
  href,
  sub,
  name,
  empty = "Pas encore de données sur la période.",
}: {
  rows: Row[];
  cols: Col[];
  bar?: string;
  href?: (r: Row) => string | null;
  sub?: (r: Row) => string | null;
  name?: (r: Row) => string;
  empty?: string;
}) {
  if (!rows.length) return <p className="st-empty">{empty}</p>;
  const max = bar ? Math.max(...rows.map((r) => Number(r[bar] ?? 0)), 1) : 1;
  return (
    <div className="st-tbl-wrap">
      <table className="st-tbl">
        <thead>
          <tr>
            <th />
            {cols.map((c) => (
              <th key={c.k}>{c.l}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const link = href?.(r);
            const label = name ? name(r) : (r.label ?? "—");
            const s = sub?.(r);
            return (
              <tr key={i}>
                <td className="st-lbl">
                  {bar && <span className="st-fill" style={{ width: `${(Number(r[bar] ?? 0) / max) * 100}%` }} />}
                  <span className="st-lbl-in">
                    {link ? <Link href={link} title="Filtrer sur cette valeur">{label}</Link> : label}
                    {s && <small>{s}</small>}
                  </span>
                </td>
                {cols.map((c) => (
                  <td key={c.k} className="st-num" data-l={c.l}>
                    {c.f ? c.f(r[c.k]) : (r[c.k] ?? "—")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Bars({ rows, value, valueLabel, href, share }: { rows: Row[]; value: string; valueLabel: string; href?: (r: Row) => string | null; share?: boolean }) {
  if (!rows.length) return <p className="st-empty">Pas encore de données sur la période.</p>;
  const total = rows.reduce((a, r) => a + Number(r[value] ?? 0), 0) || 1;
  const max = Math.max(...rows.map((r) => Number(r[value] ?? 0)), 1);
  return (
    <ul className="st-bars" aria-label={valueLabel}>
      {rows.map((r, i) => {
        const v = Number(r[value] ?? 0);
        const link = href?.(r);
        return (
          <li key={i}>
            <span className="st-fill" style={{ width: `${(v / max) * 100}%` }} />
            <span className="st-bars-l">{link ? <Link href={link}>{r.label}</Link> : r.label}</span>
            <span className="st-num">
              {num(v)}
              {share && <small> · {Math.round((v / total) * 100)} %</small>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/* ——— Graphique ——— */

function wall(d: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), Number(p.hour));
}

function buckets(start: Date, end: Date, unit: "hour" | "day" | "week" | "month") {
  const out: number[] = [];
  let t = wall(start);
  const stop = wall(end);
  const d0 = new Date(t);
  if (unit !== "hour") d0.setUTCHours(0);
  if (unit === "week") d0.setUTCDate(d0.getUTCDate() - ((d0.getUTCDay() + 6) % 7));
  if (unit === "month") d0.setUTCDate(1);
  t = d0.getTime();
  while (t <= stop && out.length < 800) {
    out.push(t / 1000);
    const n = new Date(t);
    if (unit === "hour") n.setUTCHours(n.getUTCHours() + 1);
    else if (unit === "day") n.setUTCDate(n.getUTCDate() + 1);
    else if (unit === "week") n.setUTCDate(n.getUTCDate() + 7);
    else n.setUTCMonth(n.getUTCMonth() + 1);
    t = n.getTime();
  }
  return out;
}

function Chart({ series, range }: { series: { b: number; pv: number; uv: number }[]; range: { start: Date; end: Date; unit: "hour" | "day" | "week" | "month" } }) {
  const map = new Map(series.map((s) => [s.b, s]));
  const pts = buckets(range.start, range.end, range.unit).map((b) => map.get(b) ?? { b, pv: 0, uv: 0 });
  if (!pts.length) return <p className="st-empty">Pas encore de données.</p>;
  const W = 1000, H = 260, L = 44, R = 12, T = 14, B = 34;
  const max = Math.max(...pts.map((p) => p.pv), 4);
  const step = Math.pow(10, Math.floor(Math.log10(max)));
  const top = Math.ceil(max / step) * step;
  const x = (i: number) => L + (pts.length === 1 ? (W - L - R) / 2 : (i * (W - L - R)) / (pts.length - 1));
  const y = (v: number) => T + (H - T - B) * (1 - v / top);
  const line = (k: "pv" | "uv") => pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const area = `${line("pv")} L${x(pts.length - 1).toFixed(1)},${y(0)} L${x(0).toFixed(1)},${y(0)} Z`;
  const lbl = (b: number) => {
    const d = new Date(b * 1000);
    const o: Intl.DateTimeFormatOptions =
      range.unit === "hour" ? { hour: "2-digit", minute: "2-digit" } : range.unit === "month" ? { month: "short", year: "2-digit" } : { day: "numeric", month: "short" };
    return d.toLocaleString("fr-BE", { ...o, timeZone: "UTC" });
  };
  const every = Math.max(1, Math.ceil(pts.length / 8));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f));
  const colW = (W - L - R) / Math.max(pts.length, 1);
  return (
    <svg className="st-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Évolution des pages vues et des visiteurs">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="st-grid-l" />
          <text x={L - 8} y={y(t) + 4} textAnchor="end" className="st-axis">{num(t)}</text>
        </g>
      ))}
      <path d={area} className="st-area" />
      <path d={line("pv")} className="st-line-pv" />
      <path d={line("uv")} className="st-line-uv" />
      {pts.map((p, i) => (
        <g key={p.b}>
          {pts.length <= 60 && <circle cx={x(i)} cy={y(p.pv)} r={3} className="st-pt" />}
          <rect x={x(i) - colW / 2} y={T} width={colW} height={H - T - B} className="st-hit">
            <title>{`${lbl(p.b)} : ${num(p.pv)} pages vues, ${num(p.uv)} visiteurs`}</title>
          </rect>
          {i % every === 0 && (
            <text x={x(i)} y={H - 10} textAnchor="middle" className="st-axis">{lbl(p.b)}</text>
          )}
        </g>
      ))}
    </svg>
  );
}

function Heatmap({ cells }: { cells: { d: number; h: number; c: number }[] }) {
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const m = new Map(cells.map((c) => [`${c.d}-${c.h}`, c.c]));
  const max = Math.max(...cells.map((c) => c.c), 1);
  return (
    <div className="st-heat">
      <div className="st-heat-row st-heat-head">
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h}>{h % 3 === 0 ? `${h}h` : ""}</span>
        ))}
      </div>
      {days.map((dn, di) => (
        <div className="st-heat-row" key={dn}>
          <span>{dn}</span>
          {Array.from({ length: 24 }, (_, h) => {
            const c = m.get(`${di + 1}-${h}`) ?? 0;
            return <i key={h} style={{ opacity: c ? 0.15 + 0.85 * (c / max) : 0.06 }} title={`${dn} ${h}h : ${num(c)} pages vues`} />;
          })}
        </div>
      ))}
    </div>
  );
}
