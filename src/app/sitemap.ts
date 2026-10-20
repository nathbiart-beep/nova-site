import type { MetadataRoute } from "next";
import { articleHref, getArticles, getEvents } from "@/lib/content";
import { SITE_URL, villeList } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, events] = await Promise.all([getArticles(), getEvents()]);
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/agenda`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    ...villeList.map((v) => ({ url: `${SITE_URL}/villes/${v.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 })),
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/actualites`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/partenaires`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, changeFrequency: "yearly", priority: 0.4 },
  ];
  return [
    ...staticPages,
    ...articles.map((a) => ({
      url: `${SITE_URL}${articleHref(a)}`,
      lastModified: a.entry.date ? new Date(a.entry.date) : now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...events.map((e) => ({
      url: `${SITE_URL}/agenda/${e.slug}`,
      lastModified: e.entry.date ? new Date(e.entry.date) : now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
