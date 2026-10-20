export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://nova-bxl.vercel.app").replace(/\/$/, "");

export const site = {
  name: "NOVA",
  legalName: "NOVA",
  tagline: "Par des étudiants, pour des étudiants",
  description:
    "NOVA, le collectif étudiant de Bruxelles, Namur et Louvain-la-Neuve : agenda des soirées étudiantes, événements, guides, bons plans et partenariats avec les marques.",
  locale: "fr_BE",
  email: "novabxl.contact@gmail.com",
  instagram: "https://www.instagram.com/nova.bxl/",
  instagramHandle: "@nova.bxl",
  linkedin: "https://www.linkedin.com/company/nova-bxl/",
  keywords: [
    "soirées étudiantes",
    "soirée étudiante Bruxelles",
    "soirée étudiante Namur",
    "soirée étudiante Louvain-la-Neuve",
    "agenda soirées étudiantes",
    "TD ULB",
    "guindaille",
    "cercles étudiants",
    "blocus",
    "Saint-V",
    "24h vélo",
    "marketing étudiant Belgique",
    "partenariat étudiant",
  ],
};

export const nav = [
  { href: "/agenda", label: "Agenda" },
  { href: "/blog", label: "Blog" },
  { href: "/actualites", label: "Actualités" },
  { href: "/partenaires", label: "Partenaires" },
  { href: "/a-propos", label: "L'équipe" },
  { href: "/contact", label: "Contact" },
];

export type VilleSlug = "bruxelles" | "namur" | "louvain-la-neuve";

export const villes: Record<
  VilleSlug,
  {
    slug: VilleSlug;
    name: string;
    short: string;
    title: string;
    metaDescription: string;
    intro: string;
    campus: string[];
    lieux: string;
    faq: { q: string; a: string }[];
    geo: { lat: number; lng: number };
  }
> = {
  bruxelles: {
    slug: "bruxelles",
    name: "Bruxelles",
    short: "BXL",
    title: "Soirées étudiantes à Bruxelles : l'agenda de la semaine",
    metaDescription:
      "Toutes les soirées étudiantes à Bruxelles cette semaine : TD, soirées de cercles, clubs et événements autour de l'ULB, la VUB, Saint-Louis et l'UCLouvain Woluwe.",
    intro:
      "Bruxelles est la plus grande ville étudiante du pays. Entre les TD des cercles, les soirées en club et les grands rendez-vous comme la Saint-V, il se passe quelque chose presque tous les soirs. NOVA rassemble chaque semaine les soirées à ne pas rater, avec les cercles et les organisateurs.",
    campus: ["ULB (Solbosch, Plaine, Erasme)", "VUB", "UCLouvain Saint-Louis", "UCLouvain Woluwe", "Hautes écoles bruxelloises"],
    lieux:
      "Les soirées étudiantes bruxelloises se répartissent entre les salles des cercles, les TD en ville, les bars étudiants et les clubs du centre et d'Ixelles.",
    faq: [
      {
        q: "Où trouver les soirées étudiantes à Bruxelles cette semaine ?",
        a: "NOVA publie chaque semaine l'agenda des soirées étudiantes à Bruxelles sur cette page et en story à la une sur Instagram (@nova.bxl), avec les cercles et organisateurs identifiés.",
      },
      {
        q: "C'est quoi un TD ?",
        a: "Un TD (pour « Thé dansant ») est une soirée étudiante organisée par un cercle. C'est le format de soirée le plus courant dans la vie étudiante bruxelloise.",
      },
      {
        q: "Comment faire apparaître ma soirée dans l'agenda NOVA ?",
        a: "Envoie ton événement en message privé sur Instagram (@nova.bxl) ou par e-mail à novabxl.contact@gmail.com avec la date, l'heure, le lieu et l'organisateur.",
      },
    ],
    geo: { lat: 50.8467, lng: 4.3525 },
  },
  namur: {
    slug: "namur",
    name: "Namur",
    short: "NAM",
    title: "Soirées étudiantes à Namur : l'agenda de la semaine",
    metaDescription:
      "Les soirées étudiantes à Namur cette semaine : soirées de cercles, guindailles et événements autour de l'UNamur et des hautes écoles namuroises.",
    intro:
      "Namur a une vie étudiante intense pour une ville de sa taille, portée par l'UNamur, les hautes écoles et une tradition folklorique très vivante. NOVA rassemble chaque semaine les soirées étudiantes namuroises et les événements des cercles et des régionales.",
    campus: ["UNamur", "Hénallux", "HEAJ", "IMEP", "Hautes écoles namuroises"],
    lieux:
      "À Namur, les soirées étudiantes se concentrent autour du centre-ville et du quartier universitaire, entre salles de cercles, bars étudiants et clubs.",
    faq: [
      {
        q: "Où trouver les soirées étudiantes à Namur cette semaine ?",
        a: "NOVA publie chaque semaine l'agenda des soirées étudiantes à Namur sur cette page et en story à la une sur Instagram (@nova.bxl).",
      },
      {
        q: "Quelles écoles sont concernées ?",
        a: "L'agenda couvre les soirées des cercles de l'UNamur, des hautes écoles namuroises et des régionales.",
      },
      {
        q: "Comment proposer ma soirée ?",
        a: "Envoie-nous ton événement sur Instagram (@nova.bxl) ou à novabxl.contact@gmail.com.",
      },
    ],
    geo: { lat: 50.4669, lng: 4.8675 },
  },
  "louvain-la-neuve": {
    slug: "louvain-la-neuve",
    name: "Louvain-la-Neuve",
    short: "LLN",
    title: "Soirées étudiantes à Louvain-la-Neuve : l'agenda de la semaine",
    metaDescription:
      "Les soirées étudiantes à Louvain-la-Neuve cette semaine : soirées de cercles, kots-à-projet, guindailles et grands événements comme les 24h vélo.",
    intro:
      "Louvain-la-Neuve est une ville pensée pour ses étudiants. Cercles, régionales, kots-à-projet et grands rendez-vous comme les 24h vélo rythment l'année. NOVA rassemble chaque semaine les soirées à ne pas manquer à LLN.",
    campus: ["UCLouvain (Louvain-la-Neuve)", "Hautes écoles du Brabant wallon"],
    lieux:
      "À Louvain-la-Neuve, la plupart des soirées se passent dans les salles des cercles et des régionales, au cœur de la ville piétonne, à quelques minutes à pied des kots.",
    faq: [
      {
        q: "Où trouver les soirées étudiantes à Louvain-la-Neuve cette semaine ?",
        a: "NOVA publie chaque semaine l'agenda des soirées étudiantes à LLN sur cette page et en story à la une sur Instagram (@nova.bxl).",
      },
      {
        q: "Quand ont lieu les 24h vélo ?",
        a: "Les 24h vélo de Louvain-la-Neuve ont lieu chaque automne. En 2026, la 50e édition se déroule les 21 et 22 octobre.",
      },
      {
        q: "Comment proposer ma soirée ?",
        a: "Envoie-nous ton événement sur Instagram (@nova.bxl) ou à novabxl.contact@gmail.com.",
      },
    ],
    geo: { lat: 50.6681, lng: 4.6118 },
  },
};

export const villeList = Object.values(villes);

export function villeName(slug?: string | null) {
  if (!slug || slug === "toutes") return "Bruxelles, Namur et LLN";
  return villes[slug as VilleSlug]?.name ?? slug;
}

export const team = [
  {
    name: "Nathan",
    photo: "/images/team/nathan.jpg",
    bio: "Démarche les marques et monte les partenariats. Quand il ne négocie pas un deal, il vérifie la cote d'une paire de sneakers.",
  },
  {
    name: "Rafael",
    photo: "/images/team/rafael.jpg",
    bio: "DJ et noctambule convaincu. Il sait ce qui fait vibrer une salle et imagine des soirées qui sortent de l'ordinaire.",
  },
  {
    name: "Arthur",
    photo: "/images/team/arthur.jpg",
    bio: "Des années à Louvain-la-Neuve : il connaît le folklore, les codes et les traditions mieux que personne.",
  },
];
