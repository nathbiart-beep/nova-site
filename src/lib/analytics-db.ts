/**
 * Accès à la base de statistiques (Neon Postgres, créée depuis Vercel → Storage).
 * On parle à Neon directement en HTTP (pas de dépendance npm) : une requête = un appel fetch.
 */

type Row = Record<string, string | null>;

function endpoint(url: string) {
  if (process.env.ANALYTICS_SQL_ENDPOINT) return process.env.ANALYTICS_SQL_ENDPOINT; // tests en local
  const host = new URL(url.replace(/^postgres(ql)?:/, "http:")).hostname;
  return "https://" + host.replace(/^[^.]+\./, "api.") + "/sql";
}

export function analyticsEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

/** Exécute une requête SQL paramétrée ($1, $2…) et renvoie les lignes sous forme d'objets (valeurs en texte). */
export async function sql(query: string, params: (string | number | null)[] = []): Promise<Row[]> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL manquant");
  const res = await fetch(endpoint(url), {
    method: "POST",
    headers: {
      "Neon-Connection-String": url,
      "Neon-Raw-Text-Output": "true",
      "Neon-Array-Mode": "true",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, params: params.map((p) => (p === null ? null : String(p))) }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Erreur base de données (${res.status}) : ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { fields: { name: string }[]; rows: (string | null)[][] };
  const names = data.fields.map((f) => f.name);
  return data.rows.map((r) => Object.fromEntries(r.map((v, i) => [names[i], v])));
}

let schemaReady: Promise<void> | null = null;

/** Crée la table au premier appel (une seule fois par instance du serveur). */
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await sql(`CREATE TABLE IF NOT EXISTS nova_hits (
        id BIGSERIAL PRIMARY KEY,
        ts TIMESTAMPTZ NOT NULL DEFAULT now(),
        type TEXT NOT NULL,
        visitor TEXT NOT NULL,
        path TEXT NOT NULL,
        title TEXT,
        referrer TEXT,
        source TEXT,
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        country TEXT,
        region TEXT,
        city TEXT,
        device TEXT,
        browser TEXT,
        os TEXT,
        screen TEXT,
        lang TEXT,
        event_name TEXT,
        event_label TEXT,
        duration_ms INTEGER,
        scroll INTEGER
      )`);
      await sql(`CREATE INDEX IF NOT EXISTS nova_hits_ts_idx ON nova_hits (ts)`);
      await sql(`CREATE INDEX IF NOT EXISTS nova_hits_visitor_ts_idx ON nova_hits (visitor, ts)`);
    })().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}
