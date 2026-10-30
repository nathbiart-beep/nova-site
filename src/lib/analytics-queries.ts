import { ensureSchema, sql } from "./analytics-db";

export const TZ = "Europe/Brussels";

export const PERIODS = {
  today: "Aujourd'hui",
  yesterday: "Hier",
  "7d": "7 jours",
  "30d": "30 jours",
  "90d": "90 jours",
  "12m": "12 mois",
  all: "Depuis le début",
} as const;
export type Period = keyof typeof PERIODS;

export const FILTER_KEYS = {
  page: "Page",
  source: "Source",
  country: "Pays",
  city: "Ville",
  device: "Appareil",
  browser: "Navigateur",
  campaign: "Campagne",
} as const;
export type Filters = Partial<Record<keyof typeof FILTER_KEYS, string>>;

export type Range = { start: Date; end: Date; prevStart: Date; unit: "hour" | "day" | "week" | "month" };

export async function getRange(p: Period): Promise<Range> {
  await ensureSchema();
  const today = `(date_trunc('day', now() AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}')`;
  const startExpr: Record<Period, string> = {
    today,
    yesterday: `(${today} - interval '1 day')`,
    "7d": `(${today} - interval '6 days')`,
    "30d": `(${today} - interval '29 days')`,
    "90d": `(${today} - interval '89 days')`,
    "12m": `(${today} - interval '12 months')`,
    all: `COALESCE((SELECT date_trunc('day', min(ts) AT TIME ZONE '${TZ}') AT TIME ZONE '${TZ}' FROM nova_hits), ${today})`,
  };
  const endExpr = p === "yesterday" ? today : "now()";
  const [r] = await sql(
    `SELECT extract(epoch FROM ${startExpr[p]})::float8 AS s, extract(epoch FROM ${endExpr})::float8 AS e`,
  );
  const start = new Date(Number(r.s) * 1000);
  const end = new Date(Number(r.e) * 1000);
  const len = Math.max(end.getTime() - start.getTime(), 3600_000);
  const days = len / 86_400_000;
  const unit = days <= 2 ? "hour" : days <= 95 ? "day" : days <= 400 ? "week" : "month";
  return { start, end, prevStart: new Date(start.getTime() - len), unit };
}

/**
 * Requête de base : regroupe les passages en visites (30 min d'inactivité = nouvelle visite)
 * et rattache à chaque ligne les infos de la visite (source, pays, appareil…).
 */
function base(start: Date, end: Date, f: Filters) {
  const params: (string | number)[] = [start.toISOString(), end.toISOString()];
  const where: string[] = [];
  const add = (cond: string, v: string) => {
    params.push(v);
    where.push(cond.replace("?", `$${params.length}`));
  };
  if (f.page) add("x.path = ?", f.page);
  if (f.source) add("x.s_source = ?", f.source);
  if (f.country) add("x.s_country = ?", f.country);
  if (f.city) add("x.s_city = ?", f.city);
  if (f.device) add("x.s_device = ?", f.device);
  if (f.browser) add("x.s_browser = ?", f.browser);
  if (f.campaign) add("x.s_campaign = ?", f.campaign);
  const cte = `
  WITH h AS (SELECT * FROM nova_hits WHERE ts >= $1::timestamptz AND ts < $2::timestamptz),
  g AS (
    SELECT h.*, CASE WHEN lag(ts) OVER w IS NULL OR ts - lag(ts) OVER w > interval '30 minutes' THEN 1 ELSE 0 END AS ns
    FROM h WINDOW w AS (PARTITION BY visitor ORDER BY ts, id)
  ),
  s AS (SELECT g.*, visitor || ':' || sum(ns) OVER (PARTITION BY visitor ORDER BY ts, id) AS sid FROM g),
  x AS (
    SELECT s.*,
      first_value(source) OVER sw AS s_source,
      first_value(country) OVER sw AS s_country,
      first_value(city) OVER sw AS s_city,
      first_value(device) OVER sw AS s_device,
      first_value(browser) OVER sw AS s_browser,
      first_value(utm_campaign) OVER sw AS s_campaign
    FROM s WINDOW sw AS (PARTITION BY sid ORDER BY (type = 'pageview') DESC, ts, id)
  ),
  f AS (SELECT * FROM x ${where.length ? "WHERE " + where.join(" AND ") : ""}),
  sess AS (
    SELECT sid, min(visitor) AS visitor, min(ts) AS t0, max(ts) AS t1,
      count(*) FILTER (WHERE type = 'pageview') AS pv,
      coalesce(sum(duration_ms) FILTER (WHERE type = 'leave'), 0) AS dur,
      bool_or(type = 'event') AS ev,
      min(s_source) AS source,
      (array_agg(path ORDER BY ts, id) FILTER (WHERE type = 'pageview'))[1] AS entry,
      (array_agg(path ORDER BY ts DESC, id DESC) FILTER (WHERE type = 'pageview'))[1] AS exit
    FROM f GROUP BY sid
  )`;
  return { cte, params };
}

const n = (v: string | null | undefined) => (v == null ? 0 : Number(v));

export type Kpis = {
  visitors: number;
  sessions: number;
  pageviews: number;
  pagesPerSession: number;
  avgSession: number;
  bounce: number;
  avgTimeOnPage: number;
  events: number;
};

async function kpis(start: Date, end: Date, f: Filters): Promise<Kpis> {
  const { cte, params } = base(start, end, f);
  const [r] = await sql(
    `${cte}
    SELECT
      (SELECT count(DISTINCT visitor) FROM f WHERE type = 'pageview') AS visitors,
      (SELECT count(*) FROM sess WHERE pv > 0) AS sessions,
      (SELECT count(*) FROM f WHERE type = 'pageview') AS pageviews,
      (SELECT avg(dur) FROM sess WHERE pv > 0) AS avg_session,
      (SELECT avg(CASE WHEN pv = 1 AND dur < 10000 AND NOT ev THEN 1 ELSE 0 END) FROM sess WHERE pv > 0) AS bounce,
      (SELECT coalesce(sum(duration_ms), 0) FROM f WHERE type = 'leave') AS leave_total,
      (SELECT count(*) FROM f WHERE type = 'event') AS events`,
    params,
  );
  const pageviews = n(r.pageviews);
  const sessions = n(r.sessions);
  return {
    visitors: n(r.visitors),
    sessions,
    pageviews,
    pagesPerSession: sessions ? pageviews / sessions : 0,
    avgSession: n(r.avg_session),
    bounce: n(r.bounce),
    avgTimeOnPage: pageviews ? n(r.leave_total) / pageviews : 0,
    events: n(r.events),
  };
}

type Table = { rows: Record<string, string | null>[] };

async function table(start: Date, end: Date, f: Filters, select: string, limit = 12): Promise<Table> {
  const { cte, params } = base(start, end, f);
  const rows = await sql(`${cte} ${select} LIMIT ${limit}`, params);
  return { rows };
}

export async function getDashboard(p: Period, f: Filters) {
  const range = await getRange(p);
  const { start, end, prevStart, unit } = range;
  const T = (select: string, limit?: number) => table(start, end, f, select, limit);
  const { cte, params } = base(start, end, f);

  const [
    current,
    previous,
    series,
    pages,
    entries,
    exits,
    sources,
    referrers,
    campaigns,
    countries,
    cities,
    devices,
    browsers,
    oses,
    screens,
    langs,
    events,
    eventLabels,
    notFound,
    heat,
    agenda,
    articles,
    live,
    livePages,
    feed,
    total,
  ] = await Promise.all([
    kpis(start, end, f),
    kpis(prevStart, start, f),
    sql(
      `${cte}
      SELECT extract(epoch FROM date_trunc('${unit}', ts AT TIME ZONE '${TZ}'))::bigint AS b,
        count(*) FILTER (WHERE type = 'pageview') AS pv,
        count(DISTINCT visitor) FILTER (WHERE type = 'pageview') AS uv
      FROM f GROUP BY 1 ORDER BY 1`,
      params,
    ),
    T(
      `SELECT path AS label, max(title) AS title,
        count(*) FILTER (WHERE type = 'pageview') AS views,
        count(DISTINCT visitor) FILTER (WHERE type = 'pageview') AS visitors,
        coalesce(sum(duration_ms) FILTER (WHERE type = 'leave'), 0) / NULLIF(count(*) FILTER (WHERE type = 'pageview'), 0) AS avg_time,
        avg(scroll) FILTER (WHERE type = 'leave') AS scroll
      FROM f GROUP BY path HAVING count(*) FILTER (WHERE type = 'pageview') > 0 ORDER BY views DESC`,
      25,
    ),
    T(`SELECT entry AS label, count(*) AS sessions, avg(CASE WHEN pv = 1 AND dur < 10000 AND NOT ev THEN 1 ELSE 0 END) AS bounce FROM sess WHERE pv > 0 GROUP BY entry ORDER BY sessions DESC`),
    T(`SELECT exit AS label, count(*) AS sessions FROM sess WHERE pv > 0 GROUP BY exit ORDER BY sessions DESC`),
    T(
      `SELECT source AS label, count(*) AS sessions, count(DISTINCT visitor) AS visitors,
        avg(CASE WHEN pv = 1 AND dur < 10000 AND NOT ev THEN 1 ELSE 0 END) AS bounce, avg(dur) AS avg_dur, avg(pv) AS pps
      FROM sess WHERE pv > 0 GROUP BY source ORDER BY sessions DESC`,
      20,
    ),
    T(`SELECT regexp_replace(referrer, '^https?://(www\\.)?', '') AS label, count(*) AS visits FROM f WHERE type = 'pageview' AND referrer IS NOT NULL GROUP BY 1 ORDER BY visits DESC`, 15),
    T(
      `SELECT coalesce(utm_campaign, '—') AS label, coalesce(utm_source, '—') AS src, coalesce(utm_medium, '—') AS medium, count(*) AS visits
      FROM f WHERE type = 'pageview' AND (utm_campaign IS NOT NULL OR utm_source IS NOT NULL) GROUP BY 1, 2, 3 ORDER BY visits DESC`,
    ),
    T(`SELECT coalesce(s_country, '??') AS label, count(DISTINCT visitor) AS visitors, count(*) FILTER (WHERE type = 'pageview') AS views FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`),
    T(`SELECT coalesce(s_city, 'Inconnue') AS label, max(region) AS region, max(s_country) AS country, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`, 20),
    T(`SELECT coalesce(s_device, '—') AS label, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`),
    T(`SELECT coalesce(s_browser, '—') AS label, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`),
    T(`SELECT coalesce(os, '—') AS label, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`),
    T(`SELECT coalesce(screen, '—') AS label, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`),
    T(`SELECT coalesce(lang, '—') AS label, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' GROUP BY 1 ORDER BY visitors DESC`),
    T(`SELECT event_name AS label, count(*) AS clicks, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'event' GROUP BY 1 ORDER BY clicks DESC`),
    T(`SELECT event_label AS label, max(event_name) AS kind, count(*) AS clicks, mode() WITHIN GROUP (ORDER BY path) AS page FROM f WHERE type = 'event' AND event_label IS NOT NULL GROUP BY 1 ORDER BY clicks DESC`, 20),
    T(`SELECT path AS label, count(*) AS hits, max(regexp_replace(coalesce(referrer, ''), '^https?://', '')) AS ref FROM f WHERE type = '404' GROUP BY 1 ORDER BY hits DESC`),
    sql(
      `${cte}
      SELECT extract(isodow FROM ts AT TIME ZONE '${TZ}')::int AS d, extract(hour FROM ts AT TIME ZONE '${TZ}')::int AS h, count(*) AS c
      FROM f WHERE type = 'pageview' GROUP BY 1, 2`,
      params,
    ),
    T(`SELECT path AS label, max(title) AS title, count(*) AS views, count(DISTINCT visitor) AS visitors FROM f WHERE type = 'pageview' AND path LIKE '/agenda/%' GROUP BY 1 ORDER BY views DESC`, 15),
    T(
      `SELECT path AS label, max(title) AS title, count(*) FILTER (WHERE type = 'pageview') AS views,
        avg(scroll) FILTER (WHERE type = 'leave') AS scroll,
        coalesce(sum(duration_ms) FILTER (WHERE type = 'leave'), 0) / NULLIF(count(*) FILTER (WHERE type = 'pageview'), 0) AS avg_time
      FROM f WHERE path LIKE '/blog/%' OR path LIKE '/actualites/%' GROUP BY 1 HAVING count(*) FILTER (WHERE type = 'pageview') > 0 ORDER BY views DESC`,
      15,
    ),
    sql(`SELECT count(DISTINCT visitor) AS c FROM nova_hits WHERE ts > now() - interval '5 minutes'`),
    sql(
      `SELECT path, count(DISTINCT visitor) AS c FROM nova_hits WHERE ts > now() - interval '5 minutes' AND type = 'pageview' GROUP BY path ORDER BY c DESC LIMIT 8`,
    ),
    sql(
      `SELECT to_char(ts AT TIME ZONE '${TZ}', 'DD/MM HH24:MI') AS t, extract(epoch FROM now() - ts)::int AS ago, path, city, country, device, browser, source, type, event_name, event_label
      FROM nova_hits WHERE type IN ('pageview', 'event') ORDER BY ts DESC LIMIT 30`,
    ),
    sql(`SELECT count(*) FILTER (WHERE type = 'pageview') AS pv, to_char(min(ts) AT TIME ZONE '${TZ}', 'DD/MM/YYYY') AS since FROM nova_hits`),
  ]);

  return {
    range,
    current,
    previous,
    series: series.map((r) => ({ b: Number(r.b), pv: n(r.pv), uv: n(r.uv) })),
    pages: pages.rows,
    entries: entries.rows,
    exits: exits.rows,
    sources: sources.rows,
    referrers: referrers.rows,
    campaigns: campaigns.rows,
    countries: countries.rows,
    cities: cities.rows,
    devices: devices.rows,
    browsers: browsers.rows,
    oses: oses.rows,
    screens: screens.rows,
    langs: langs.rows,
    events: events.rows,
    eventLabels: eventLabels.rows,
    notFound: notFound.rows,
    heat: heat.map((r) => ({ d: Number(r.d), h: Number(r.h), c: n(r.c) })),
    agenda: agenda.rows,
    articles: articles.rows,
    live: n(live[0]?.c),
    livePages: livePages,
    feed,
    total: { pv: n(total[0]?.pv), since: total[0]?.since ?? null },
  };
}

export async function exportRows(p: Period) {
  const { start, end } = await getRange(p);
  return sql(
    `SELECT to_char(ts AT TIME ZONE '${TZ}', 'YYYY-MM-DD HH24:MI:SS') AS date, type, path, title, source, referrer, utm_source, utm_medium, utm_campaign,
      country, region, city, device, browser, os, screen, lang, event_name, event_label, duration_ms, scroll
     FROM nova_hits WHERE ts >= $1::timestamptz AND ts < $2::timestamptz ORDER BY ts`,
    [start.toISOString(), end.toISOString()],
  );
}
