"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site, villeList } from "@/lib/site";

type Group = { id: string; label: string; links: { href: string; label: string }[] };

const groups: Group[] = [
  {
    id: "soirees",
    label: "Soirées",
    links: [
      { href: "/agenda", label: "Tout l'agenda" },
      ...villeList.map((v) => ({ href: `/villes/${v.slug}`, label: v.name })),
    ],
  },
  {
    id: "lire",
    label: "À lire",
    links: [
      { href: "/blog", label: "Blog" },
      { href: "/actualites", label: "Actualités" },
    ],
  },
];

const links = [
  { href: "/partenaires", label: "Partenaires" },
  { href: "/a-propos", label: "L'équipe" },
  { href: "/contact", label: "Contact" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Ferme le menu dès qu'on arrive sur une nouvelle page.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Ouvre automatiquement le groupe de la page actuelle.
  useEffect(() => {
    if (!open) return;
    const current = groups.find((g) => g.links.some((l) => isActive(pathname, l.href)));
    setExpanded(current ? current.id : null);
  }, [open, pathname]);

  // Échap, clic à l'extérieur et blocage du défilement pendant que le menu est ouvert.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={`mobile-nav${open ? " is-open" : ""}`} ref={ref}>
      <button
        type="button"
        className="mobile-nav-toggle"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        aria-controls="menu-mobile"
        onClick={() => setOpen((o) => !o)}
      >
        <span />
        <span />
        <span />
      </button>

      {open && <div className="mobile-nav-backdrop" onClick={close} aria-hidden="true" />}

      <nav id="menu-mobile" aria-label="Menu mobile" className="mobile-nav-panel" hidden={!open}>
        {groups.map((g) => {
          const isOpen = expanded === g.id;
          return (
            <div key={g.id} className="mobile-nav-group">
              <button
                type="button"
                className="mobile-nav-item"
                aria-expanded={isOpen}
                onClick={() => setExpanded(isOpen ? null : g.id)}
              >
                {g.label}
                <span className="mobile-nav-chevron" aria-hidden="true" />
              </button>
              {isOpen && (
                <div className="mobile-nav-sub">
                  {g.links.map((l) => (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={close}
                      aria-current={isActive(pathname, l.href) ? "page" : undefined}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="mobile-nav-item"
            onClick={close}
            aria-current={isActive(pathname, l.href) ? "page" : undefined}
          >
            {l.label}
          </Link>
        ))}
        <div className="mobile-nav-social">
          <a className="btn btn-small" href={site.instagram} target="_blank" rel="noopener" onClick={close}>
            Instagram
          </a>
          <a className="btn btn-small btn-ghost" href={site.linkedin} target="_blank" rel="noopener" onClick={close}>
            LinkedIn
          </a>
        </div>
      </nav>
    </div>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(href + "/");
}
