"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Mesure d'audience maison, sans cookie : pages vues, temps passé, défilement, clics importants.
 * Les données partent vers /api/collect et s'affichent sur /admin/stats.
 */

type Payload = Record<string, string | number | null | undefined>;

function ignored() {
  try {
    return localStorage.getItem("nova_ignore") === "1";
  } catch {
    return false;
  }
}

function send(data: Payload) {
  if (ignored()) return;
  const body = JSON.stringify(data);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon("/api/collect", new Blob([body], { type: "text/plain" }))) return;
  } catch {}
  fetch("/api/collect", { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
}

function screenBucket() {
  const w = window.innerWidth;
  return w < 480 ? "< 480 px" : w < 768 ? "480–767 px" : w < 1024 ? "768–1023 px" : w < 1440 ? "1024–1439 px" : "≥ 1440 px";
}

export function Analytics({ notFound = false }: { notFound?: boolean }) {
  const pathname = usePathname();
  const page = useRef<{ path: string; start: number; visible: number; scroll: number; sent: boolean; reported: boolean } | null>(null);
  const first = useRef(true);

  // Fin de page : temps réellement passé (onglet visible) et défilement maximum.
  const flush = () => {
    const p = page.current;
    if (!p || p.sent) return;
    const visible = p.visible + (document.visibilityState === "visible" ? Date.now() - p.start : 0);
    p.sent = true;
    if (p.reported && visible < 1000) return;
    send({ type: "leave", path: p.path, duration: visible, scroll: p.scroll });
  };

  useEffect(() => {
    if (!pathname) return;
    flush();
    const url = new URL(window.location.href);
    const isFirst = first.current;
    first.current = false;
    page.current = { path: pathname, start: Date.now(), visible: 0, scroll: 0, sent: false, reported: false };
    send({
      type: "pageview",
      path: pathname,
      title: document.title,
      referrer: isFirst ? document.referrer : null,
      utm_source: isFirst ? url.searchParams.get("utm_source") : null,
      utm_medium: isFirst ? url.searchParams.get("utm_medium") : null,
      utm_campaign: isFirst ? url.searchParams.get("utm_campaign") : null,
      screen: screenBucket(),
      lang: (navigator.language || "").slice(0, 5),
    });
    if (notFound) send({ type: "404", path: pathname, referrer: document.referrer || null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      const p = page.current;
      if (!p) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = h <= 0 ? 100 : Math.round((window.scrollY / h) * 100);
      if (pct > p.scroll) p.scroll = Math.min(100, pct);
    };
    const onVisibility = () => {
      const p = page.current;
      if (!p) return;
      if (document.visibilityState === "hidden") {
        const visible = p.visible + (Date.now() - p.start);
        if (!p.sent) {
          send({ type: "leave", path: p.path, duration: visible, scroll: p.scroll });
          // Si la personne revient sur l'onglet, on repart de zéro pour ne compter que le temps en plus.
          page.current = { ...p, visible: 0, start: Date.now(), reported: true };
        }
      } else {
        p.start = Date.now();
        p.sent = false;
      }
    };
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest("a, button") as HTMLAnchorElement | HTMLButtonElement | null;
      if (!el) return;
      const custom = el.getAttribute("data-track");
      const text = (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80);
      const path = window.location.pathname;
      if (custom) return send({ type: "event", path, event_name: custom, event_label: text });
      if (el instanceof HTMLAnchorElement && el.href) {
        let u: URL;
        try {
          u = new URL(el.href);
        } catch {
          return;
        }
        if (u.protocol === "mailto:") return send({ type: "event", path, event_name: "Clic e-mail", event_label: u.pathname });
        if (u.protocol === "tel:") return send({ type: "event", path, event_name: "Clic téléphone", event_label: u.pathname });
        if (u.host !== window.location.host) {
          const host = u.hostname.replace(/^www\./, "");
          const name = /instagram/.test(host)
            ? "Clic Instagram"
            : /linkedin/.test(host)
              ? "Clic LinkedIn"
              : /facebook|fb\.me/.test(host)
                ? "Clic Facebook"
                : /xceed|weezevent|eventbrite|shotgun|ticket|billet|yuticket|dice\.fm|ra\.co/.test(host)
                  ? "Clic billetterie"
                  : "Lien sortant";
          return send({ type: "event", path, event_name: name, event_label: host + u.pathname.replace(/\/$/, "") });
        }
        if (el.classList.contains("btn")) return send({ type: "event", path, event_name: "Clic bouton", event_label: text || u.pathname });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("click", onClick, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
