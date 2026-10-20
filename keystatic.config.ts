import { createElement } from "react";
import { config, fields, collection } from "@keystatic/core";

/**
 * Admin NOVA (Keystatic) — accessible sur /admin (redirige vers /keystatic).
 *
 * - En local (npm run dev) : le contenu est enregistré directement dans le dossier /content.
 * - En ligne (Vercel) : le contenu est enregistré dans votre dépôt GitHub. Chaque publication
 *   déclenche automatiquement une mise à jour du site. Voir README.md, étape « Activer l'admin ».
 */
const githubRepo = process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO; // ex. "nathbiart-beep/nova-site"
// Le mode GitHub ne s'active qu'une fois la GitHub App configurée (sinon le build échoue).
const githubAppReady = Boolean(process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG);

const villes = [
  { label: "Toutes les villes", value: "toutes" },
  { label: "Bruxelles", value: "bruxelles" },
  { label: "Namur", value: "namur" },
  { label: "Louvain-la-Neuve", value: "louvain-la-neuve" },
] as const;

export default config({
  storage:
    process.env.NODE_ENV !== "development" && githubRepo && githubAppReady
      ? { kind: "github", repo: githubRepo as `${string}/${string}` }
      : { kind: "local" },
  ui: {
    brand: {
      name: "NOVA · Admin",
      mark: () => createElement("img", { src: "/admin-mark.svg", alt: "", width: 26, height: 26 }),
    },
    navigation: {
      Contenu: ["articles", "evenements"],
      Réseau: ["partenaires"],
    },
  },
  collections: {
    articles: collection({
      label: "Articles (blog & actualités)",
      slugField: "title",
      path: "content/articles/*",
      format: { contentField: "content" },
      entryLayout: "content",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({
          name: { label: "Titre", validation: { isRequired: true } },
          slug: { label: "Adresse de la page (générée automatiquement)" },
        }),
        category: fields.select({
          label: "Rubrique",
          description: "Blog = guides et bons plans durables. Actualités = news datées.",
          options: [
            { label: "Blog", value: "blog" },
            { label: "Actualités", value: "actualite" },
          ],
          defaultValue: "blog",
        }),
        date: fields.date({
          label: "Date de publication",
          defaultValue: { kind: "today" },
          validation: { isRequired: true },
        }),
        excerpt: fields.text({
          label: "Résumé (méta-description Google)",
          description: "Entre 120 et 160 caractères. C'est le texte affiché sous le titre dans Google.",
          multiline: true,
          validation: { length: { min: 50, max: 200 } },
        }),
        ville: fields.select({ label: "Ville concernée", options: [...villes], defaultValue: "toutes" }),
        cover: fields.image({
          label: "Image de couverture",
          directory: "public/images/articles",
          publicPath: "/images/articles/",
        }),
        coverAlt: fields.text({ label: "Description de l'image (texte alternatif, important pour Google)" }),
        author: fields.select({
          label: "Auteur",
          options: [
            { label: "L'équipe NOVA", value: "L'équipe NOVA" },
            { label: "Nathan", value: "Nathan" },
            { label: "Rafael", value: "Rafael" },
            { label: "Arthur", value: "Arthur" },
          ],
          defaultValue: "L'équipe NOVA",
        }),
        tags: fields.array(fields.text({ label: "Mot-clé" }), {
          label: "Mots-clés",
          itemLabel: (props) => props.value,
        }),
        content: fields.markdoc({
          label: "Contenu",
          options: {
            image: { directory: "public/images/articles", publicPath: "/images/articles/" },
          },
        }),
      },
    }),

    evenements: collection({
      label: "Agenda (soirées & événements)",
      slugField: "title",
      path: "content/evenements/*",
      columns: ["title", "date"],
      schema: {
        title: fields.slug({
          name: { label: "Nom de l'événement", validation: { isRequired: true } },
          slug: { label: "Adresse de la page" },
        }),
        date: fields.date({ label: "Date", validation: { isRequired: true } }),
        heure: fields.text({ label: "Heure de début (ex. 22:00)", defaultValue: "22:00" }),
        dateFin: fields.date({ label: "Date de fin (si plusieurs jours)" }),
        ville: fields.select({ label: "Ville", options: [...villes].slice(1), defaultValue: "bruxelles" }),
        lieu: fields.text({ label: "Lieu (nom de la salle, du bar…)" }),
        adresse: fields.text({ label: "Adresse" }),
        organisateur: fields.text({ label: "Organisateur (cercle, comité, boîte…)" }),
        lien: fields.url({ label: "Lien (billetterie, événement Facebook, Instagram…)" }),
        prix: fields.text({ label: "Prix (ex. Gratuit, 5 €, 8 € en prévente)" }),
        image: fields.image({
          label: "Affiche",
          directory: "public/images/evenements",
          publicPath: "/images/evenements/",
        }),
        description: fields.text({ label: "Description", multiline: true }),
        nova: fields.checkbox({ label: "Événement organisé ou co-organisé par NOVA", defaultValue: false }),
      },
    }),

    partenaires: collection({
      label: "Partenaires & références",
      slugField: "name",
      path: "content/partenaires/*",
      schema: {
        name: fields.slug({ name: { label: "Nom", validation: { isRequired: true } } }),
        description: fields.text({ label: "Ce qu'on a fait ensemble" }),
        url: fields.url({ label: "Site ou Instagram" }),
        logo: fields.image({
          label: "Logo",
          directory: "public/images/partenaires",
          publicPath: "/images/partenaires/",
        }),
        ordre: fields.integer({ label: "Ordre d'affichage", defaultValue: 10 }),
      },
    }),
  },
});
