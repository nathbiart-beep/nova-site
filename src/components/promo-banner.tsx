"use client";

import { useEffect, useState } from "react";

// Concours GTA VI : visible du 12 novembre 2026 à 14h au 18 novembre 2026 à 23h59 (heure belge).
const START = Date.parse("2026-11-12T14:00:00+01:00");
const END = Date.parse("2026-11-18T23:59:59+01:00");
const KEY = "nova-promo-gta6-ferme";
const LINK = "https://www.instagram.com/novastudent.be/?utm_source=site&utm_medium=banniere&utm_campaign=concours-gta6";

export function PromoBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const now = Date.now();
    if (now < START || now > END) return;
    let closed = false;
    try {
      closed = window.localStorage.getItem(KEY) === "1";
    } catch {}
    if (!closed) setShow(true);
  }, []);

  if (!show) return null;

  const close = () => {
    setShow(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <div className="promo-banner" role="region" aria-label="Concours en cours">
      <a href={LINK} target="_blank" rel="noopener" data-track="Bannière concours GTA VI" className="promo-link">
        <span className="promo-tag">Concours</span>
        <span className="promo-text">
          Gagne <strong>GTA VI</strong> le jour de sa sortie
        </span>
        <span className="promo-cta">Participer sur Instagram →</span>
      </a>
      <button type="button" className="promo-close" onClick={close} aria-label="Fermer le bandeau du concours">
        ×
      </button>
    </div>
  );
}
