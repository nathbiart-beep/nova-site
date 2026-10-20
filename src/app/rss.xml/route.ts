import { articleHref, getArticles } from "@/lib/content";
import { SITE_URL, site } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET() {
  const articles = await getArticles();
  const items = articles
    .map((a) => {
      const url = `${SITE_URL}${articleHref(a)}`;
      return `<item><title>${esc(a.entry.title)}</title><link>${url}</link><guid>${url}</guid><pubDate>${new Date(
        (a.entry.date ?? "2026-01-01") + "T09:00:00Z",
      ).toUTCString()}</pubDate><category>${a.entry.category === "actualite" ? "Actualités" : "Blog"}</category><description>${esc(
        a.entry.excerpt,
      )}</description></item>`;
    })
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>NOVA, blog et actualités</title><link>${SITE_URL}</link><atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/><description>${esc(
    site.description,
  )}</description><language>fr-BE</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
