import { createHash } from "node:crypto";
import { analyticsEnabled, ensureSchema, sql } from "@/lib/analytics-db";

/**
 * Reçoit les visites envoyées par le site (composant Analytics).
 * Sans cookie : un visiteur = empreinte anonyme (IP + navigateur + jour), impossible à relier d'un jour à l'autre.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link|whatsapp|telegrambot|discordbot|preview|headless|lighthouse|pingdom|uptime|curl|wget|python|axios|node-fetch|vercel-screenshot/i;

const SOURCES: [RegExp, string][] = [
  [/(^|\.)instagram\.com$|^ig$|^instagram$/i, "Instagram"],
  [/(^|\.)facebook\.com$|(^|\.)fb\.(com|me)$|^fb$|^facebook$/i, "Facebook"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$|^linkedin$/i, "LinkedIn"],
  [/(^|\.)google\.[a-z.]+$|^google$/i, "Google"],
  [/(^|\.)bing\.com$/i, "Bing"],
  [/(^|\.)duckduckgo\.com$/i, "DuckDuckGo"],
  [/(^|\.)ecosia\.org$/i, "Ecosia"],
  [/(^|\.)yahoo\.com$/i, "Yahoo"],
  [/(^|\.)tiktok\.com$|^tiktok$/i, "TikTok"],
  [/(^|\.)snapchat\.com$|^snapchat$/i, "Snapchat"],
  [/(^|\.)whatsapp\.(com|net)$|^wa\.me$|^whatsapp$/i, "WhatsApp"],
  [/^t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/i, "X (Twitter)"],
  [/(^|\.)youtube\.com$|^youtu\.be$/i, "YouTube"],
  [/(^|\.)reddit\.com$/i, "Reddit"],
  [/chatgpt\.com$|openai\.com$|perplexity\.ai$|claude\.ai$|gemini\.google/i, "IA (ChatGPT, Perplexity…)"],
];

function sourceOf(refHost: string | null, utm: string | null) {
  const key = (utm || refHost || "").toLowerCase().replace(/^www\.|^m\.|^l\.|^lm\./, "");
  if (!key) return "Direct";
  for (const [re, name] of SOURCES) if (re.test(key)) return name;
  return key;
}

function parseUA(ua: string) {
  const device = /ipad|tablet|kindle|silk|playbook|(android(?!.*mobile))/i.test(ua)
    ? "Tablette"
    : /mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)
      ? "Mobile"
      : "Ordinateur";
  const browser = /Instagram/i.test(ua)
    ? "Instagram (appli)"
    : /FBAN|FBAV|FB_IAB/i.test(ua)
      ? "Facebook (appli)"
      : /LinkedInApp/i.test(ua)
        ? "LinkedIn (appli)"
        : /SamsungBrowser/i.test(ua)
          ? "Samsung Internet"
          : /Edg\//i.test(ua)
            ? "Edge"
            : /OPR\/|Opera/i.test(ua)
              ? "Opera"
              : /Firefox|FxiOS/i.test(ua)
                ? "Firefox"
                : /CriOS|Chrome\//i.test(ua)
                  ? "Chrome"
                  : /Safari/i.test(ua)
                    ? "Safari"
                    : "Autre";
  const os = /iPhone|iPad|iPod/i.test(ua)
    ? "iOS"
    : /Android/i.test(ua)
      ? "Android"
      : /Mac OS X|Macintosh/i.test(ua)
        ? "macOS"
        : /Windows/i.test(ua)
          ? "Windows"
          : /CrOS/i.test(ua)
            ? "ChromeOS"
            : /Linux/i.test(ua)
              ? "Linux"
              : "Autre";
  return { device, browser, os };
}

const clip = (v: unknown, n = 300) => (typeof v === "string" && v.trim() ? v.trim().slice(0, n) : null);

export async function POST(req: Request) {
  if (!analyticsEnabled()) return new Response(null, { status: 204 });
  try {
    const ua = req.headers.get("user-agent") || "";
    if (!ua || BOT.test(ua)) return new Response(null, { status: 204 });

    const body = JSON.parse(await req.text());
    const type = ["pageview", "leave", "event", "404"].includes(body.type) ? body.type : null;
    const path = clip(body.path, 500);
    if (!type || !path || path.startsWith("/keystatic") || path.startsWith("/admin") || path.startsWith("/api")) {
      return new Response(null, { status: 204 });
    }

    const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || req.headers.get("x-real-ip") || "";
    const day = new Date().toISOString().slice(0, 10);
    const salt = process.env.KEYSTATIC_SECRET || process.env.DATABASE_URL || "nova";
    const visitor = createHash("sha256").update(`${salt}|${day}|${ip}|${ua}`).digest("hex").slice(0, 24);

    let refHost: string | null = null;
    const referrer = clip(body.referrer, 500);
    if (referrer) {
      try {
        refHost = new URL(referrer).hostname.replace(/^www\./, "");
        if (refHost.endsWith("novastudent.be") || refHost.endsWith("vercel.app")) refHost = null;
      } catch {}
    }
    const utmSource = clip(body.utm_source, 100);
    const { device, browser, os } = parseUA(ua);
    const dec = (v: string | null) => {
      try {
        return v ? decodeURIComponent(v) : null;
      } catch {
        return v;
      }
    };

    await ensureSchema();
    await sql(
      `INSERT INTO nova_hits (type, visitor, path, title, referrer, source, utm_source, utm_medium, utm_campaign,
        country, region, city, device, browser, os, screen, lang, event_name, event_label, duration_ms, scroll)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        type,
        visitor,
        path,
        clip(body.title, 200),
        refHost ? referrer : null,
        type === "pageview" ? sourceOf(refHost, utmSource) : null,
        utmSource,
        clip(body.utm_medium, 100),
        clip(body.utm_campaign, 150),
        req.headers.get("x-vercel-ip-country"),
        dec(req.headers.get("x-vercel-ip-country-region")),
        dec(req.headers.get("x-vercel-ip-city")),
        device,
        browser,
        os,
        clip(body.screen, 20),
        clip(body.lang, 10),
        clip(body.event_name, 80),
        clip(body.event_label, 300),
        Number.isFinite(body.duration) ? Math.max(0, Math.min(Math.round(body.duration), 3_600_000)) : null,
        Number.isFinite(body.scroll) ? Math.max(0, Math.min(Math.round(body.scroll), 100)) : null,
      ],
    );
    return new Response(null, { status: 204 });
  } catch (e) {
    console.error("[analytics]", e);
    return new Response(null, { status: 204 });
  }
}
