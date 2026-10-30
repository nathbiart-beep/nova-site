import { cookies } from "next/headers";

/**
 * Accès réservé : on réutilise la connexion GitHub de l'admin Keystatic.
 * Seules les personnes qui peuvent modifier le dépôt du site (toi, Arthur, Rafael si invités) voient les stats.
 */
export type AdminCheck = { ok: true; login: string } | { ok: false; reason: "no-session" | "forbidden" | "error" };

export async function checkAdmin(): Promise<AdminCheck> {
  if (process.env.NODE_ENV === "development" && process.env.ANALYTICS_DEV_OPEN === "1") return { ok: true, login: "dev" };
  const token = (await cookies()).get("keystatic-gh-access-token")?.value;
  if (!token) return { ok: false, reason: "no-session" };
  const repo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO || "nathbiart-beep/nova-site";
  try {
    const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "nova-stats" };
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers, cache: "no-store" });
    if (res.status === 401) return { ok: false, reason: "no-session" };
    if (!res.ok) return { ok: false, reason: "forbidden" };
    const data = (await res.json()) as { permissions?: { push?: boolean } };
    if (!data.permissions?.push) return { ok: false, reason: "forbidden" };
    const me = await fetch("https://api.github.com/user", { headers, cache: "no-store" });
    const login = me.ok ? ((await me.json()) as { login?: string }).login || "admin" : "admin";
    return { ok: true, login };
  } catch {
    return { ok: false, reason: "error" };
  }
}
