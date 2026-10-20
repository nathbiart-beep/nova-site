import { createReader } from "@keystatic/core/reader";
import Markdoc, { type Node } from "@markdoc/markdoc";
import keystaticConfig from "../../keystatic.config";

export const reader = createReader(process.cwd(), keystaticConfig);

export type Category = "blog" | "actualite";

export async function getArticles(category?: Category) {
  const all = await reader.collections.articles.all();
  return all
    .filter((a) => !category || a.entry.category === category)
    .sort((a, b) => (b.entry.date ?? "").localeCompare(a.entry.date ?? ""));
}

export async function getArticle(slug: string) {
  const entry = await reader.collections.articles.read(slug);
  if (!entry) return null;
  const { node } = await entry.content();
  return { slug, ...entry, node };
}

export function articleHref(a: { slug: string; entry: { category: string } } | { slug: string; category: string }) {
  const category = "entry" in a ? a.entry.category : a.category;
  return `/${category === "actualite" ? "actualites" : "blog"}/${a.slug}`;
}

/** Plain text from a Markdoc tree (reading time, RSS). */
export function nodeText(node: Node): string {
  let out = "";
  for (const n of node.walk()) {
    if (n.type === "text" && typeof n.attributes.content === "string") out += n.attributes.content + " ";
  }
  return out;
}

export function readingTime(node: Node) {
  const words = nodeText(node).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function renderable(node: Node) {
  const errors = Markdoc.validate(node);
  if (errors.some((e) => e.error.level === "critical")) console.warn(errors);
  return Markdoc.transform(node);
}

export function todayISO() {
  // Belgian date, so an event "today" stays visible all day.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(new Date());
}

export async function getEvents({ upcomingOnly = false, ville }: { upcomingOnly?: boolean; ville?: string } = {}) {
  const all = await reader.collections.evenements.all();
  const today = todayISO();
  return all
    .filter((e) => !ville || e.entry.ville === ville)
    .filter((e) => !upcomingOnly || (e.entry.dateFin ?? e.entry.date ?? "") >= today)
    .sort((a, b) => (a.entry.date ?? "").localeCompare(b.entry.date ?? ""));
}

export async function getPartenaires() {
  const all = await reader.collections.partenaires.all();
  return all.sort((a, b) => (a.entry.ordre ?? 10) - (b.entry.ordre ?? 10));
}

const longDate = new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const shortDate = new Intl.DateTimeFormat("fr-BE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

export function formatDate(iso?: string | null, long = false) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00Z");
  return (long ? longDate : shortDate).format(d);
}

export function dayParts(iso?: string | null) {
  if (!iso) return { day: "", month: "", weekday: "" };
  const d = new Date(iso + "T00:00:00Z");
  return {
    day: new Intl.DateTimeFormat("fr-BE", { day: "2-digit", timeZone: "UTC" }).format(d),
    month: new Intl.DateTimeFormat("fr-BE", { month: "short", timeZone: "UTC" }).format(d).replace(".", ""),
    weekday: new Intl.DateTimeFormat("fr-BE", { weekday: "short", timeZone: "UTC" }).format(d).replace(".", ""),
  };
}

/** "+01:00" in winter, "+02:00" in summer, for a given YYYY-MM-DD in Brussels. */
export function brusselsOffset(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  const name = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Brussels", timeZoneName: "shortOffset" })
    .formatToParts(d)
    .find((p) => p.type === "timeZoneName")?.value; // e.g. "GMT+2"
  const h = Number(name?.replace("GMT", "") || "1");
  return `+0${h}:00`;
}
