import { articleHref, formatDate, getArticles, getEvents } from "@/lib/content";
import { SITE_URL, site, villeList, villeName } from "@/lib/site";

export const dynamic = "force-static";

export async function GET() {
  const [articles, events] = await Promise.all([getArticles(), getEvents({ upcomingOnly: true })]);
  const lines: string[] = [
    "# NOVA Student (novastudent.be)",
    "",
    `> ${site.description}`,
    "",
    "NOVA est un collectif étudiant belge. Le site publie l'agenda des soirées étudiantes (TD, casas, bals, galas, guindailles) à Bruxelles, Namur et Louvain-la-Neuve, mis à jour chaque semaine, ainsi que des guides sur la vie étudiante.",
    "",
    "## Pages principales",
    `- [Agenda des soirées étudiantes](${SITE_URL}/agenda) : tous les événements à venir, par date`,
    ...villeList.map((v) => `- [Soirées étudiantes à ${v.name}](${SITE_URL}/villes/${v.slug}) : agenda et guide de la ville`),
    `- [Blog](${SITE_URL}/blog) : guides (Saint-V, TD, cantus, gala, blocus, lexique étudiant)`,
    `- [Actualités](${SITE_URL}/actualites) : les soirées de la semaine et les nouvelles des cercles`,
    `- [Partenaires](${SITE_URL}/partenaires) : marques qui travaillent avec NOVA`,
    `- [Contact](${SITE_URL}/contact) : ${site.email}, Instagram ${site.instagramHandle}`,
    "",
    "## Prochaines soirées",
    ...events.slice(0, 40).map(
      (e) =>
        `- ${formatDate(e.entry.date)}${e.entry.heure ? `, ${e.entry.heure}` : ""} · ${villeName(e.entry.ville)} · [${e.entry.title}](${SITE_URL}/agenda/${e.slug})${e.entry.lieu ? ` (${e.entry.lieu})` : ""}`,
    ),
    "",
    "## Articles",
    ...articles.map((a) => `- [${a.entry.title}](${SITE_URL}${articleHref(a)}) : ${a.entry.excerpt.replace(/\s+/g, " ").trim()}`),
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
