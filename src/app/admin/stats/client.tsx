"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/** Recharge les chiffres toutes les 60 secondes (temps réel). */
export function AutoRefresh({ seconds = 60 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}

/** Permet d'exclure ses propres visites (stocké uniquement sur cet appareil). */
export function IgnoreToggle() {
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      setOn(localStorage.getItem("nova_ignore") === "1");
    } catch {
      setOn(false);
    }
  }, []);
  if (on === null) return null;
  return (
    <label className="st-toggle">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => {
          try {
            if (e.target.checked) localStorage.setItem("nova_ignore", "1");
            else localStorage.removeItem("nova_ignore");
          } catch {}
          setOn(e.target.checked);
        }}
      />
      Ne pas compter mes visites sur cet appareil
    </label>
  );
}
