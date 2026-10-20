# NOVA, le site

Site de NOVA (soirées, événements et partenariats étudiants à Bruxelles, Namur et Louvain-la-Neuve).
Next.js + Keystatic. Hébergement gratuit sur Vercel, contenu stocké dans GitHub (gratuit aussi).

## Ce qu'il y a dedans

| Page | Rôle |
|---|---|
| `/` | Accueil : agenda de la semaine, villes, articles, FAQ |
| `/agenda` et `/agenda/[slug]` | Toutes les soirées, une page par événement |
| `/villes/bruxelles`, `/villes/namur`, `/villes/louvain-la-neuve` | Pages SEO « soirées étudiantes à … » |
| `/blog` et `/actualites` | Guides (contenu qui dure) et news (contenu daté) |
| `/partenaires` | Page pour les marques : offres, opérations, contact |
| `/a-propos`, `/contact` | L'équipe et les contacts |
| `/admin` | L'admin pour écrire des articles et ajouter des soirées |

**SEO intégré :**
- titre et description sur chaque page, URL canoniques ;
- données structurées Google : organisation, événements, articles, FAQ, fil d'Ariane ;
- images de partage générées automatiquement pour chaque article, événement et ville ;
- `sitemap.xml`, `robots.txt`, flux RSS (`/rss.xml`) ;
- pages statiques ultra rapides, mobile-first.

## 1. Mettre le code sur GitHub (5 min)

1. Créez un compte sur github.com (si besoin), puis un nouveau dépôt **privé** `nova-site`.
2. Sur la page du dépôt vide, cliquez sur **« uploading an existing file »** et glissez-y tout le contenu
   de ce dossier (le contenu, pas le dossier lui-même). Les fichiers qui commencent par un point
   (`.gitignore`, `.env.example`) sont cachés sur Mac : faites `Cmd + Maj + .` dans le Finder pour les voir.
   Validez avec **Commit changes**.

## 2. Publier sur Vercel (5 min)

1. Allez sur vercel.com et connectez-vous **avec GitHub** (plan Hobby, gratuit).
2. **Add New → Project**, choisissez `nova-site`, puis cliquez sur **Deploy**. Rien à configurer.
3. Le site est en ligne à une adresse du type `nova-site-xxx.vercel.app`. Dans **Settings → Domains**,
   vous pouvez la changer en `nova-bxl.vercel.app` (si elle est libre).
4. Dans **Settings → Environment Variables**, ajoutez `NEXT_PUBLIC_SITE_URL` avec l'adresse finale
   (ex. `https://nova-bxl.vercel.app`), puis **Deployments → … → Redeploy**.

## 3. Activer l'admin en ligne (10 min, une seule fois)

Chaque article publié depuis l'admin est enregistré dans GitHub, et Vercel remet le site à jour tout seul
(environ 1 minute).

1. Dans Vercel, ajoutez la variable `NEXT_PUBLIC_KEYSTATIC_GITHUB_REPO` = `votre-pseudo-github/nova-site`
   et redéployez.
2. Ouvrez `https://votre-site/keystatic`. Keystatic vous propose de **créer une GitHub App** : suivez
   l'assistant (nommez-la par ex. `nova-admin` et installez-la sur le dépôt `nova-site`).
3. À la fin, Keystatic affiche 4 valeurs (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`). Copiez-les dans les variables
   d'environnement Vercel, puis redéployez.
4. Pour donner accès à Arthur et Rafael, ajoutez-les comme **collaborateurs** du dépôt GitHub
   (Settings → Collaborators). Ils se connectent ensuite à `/admin` avec leur compte GitHub.

Si l'assistant ne s'affiche pas, la documentation officielle détaille la démarche : keystatic.com/docs/github-mode

## 4. Utiliser l'admin

- **Articles** :
  - choisissez *Blog* (un guide utile toute l'année) ou *Actualité* (une news datée) ;
  - indiquez la ville ;
  - écrivez un résumé de 50 à 200 caractères : c'est la description affichée par Google ;
  - ajoutez une image de couverture et des tags.
- **Agenda** : une fiche par soirée. Cochez « Organisé par NOVA » pour vos propres événements.
  Les soirées passées disparaissent toutes seules de l'agenda (mise à jour toutes les heures).
- **Partenaires** : nom, logo, courte description et ordre d'affichage.

## 5. Être trouvé sur Google

1. Allez sur Google Search Console et ajoutez votre site (type **Préfixe d'URL**).
2. Choisissez la méthode **Balise HTML**. Copiez juste la valeur `content="…"` dans la variable
   `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` sur Vercel, redéployez, puis cliquez sur **Valider**.
3. Dans **Sitemaps**, envoyez `sitemap.xml`.
4. Mettez le lien du site dans la bio Instagram et sur la page LinkedIn : ce sont vos premiers liens entrants.

**Pour bien référencer :**
- publiez régulièrement (1 article par semaine suffit) ;
- choisissez des sujets que les étudiants cherchent : « soirée étudiante Namur », « où étudier pendant le blocus LLN », « Saint-V 2026 » ;
- mettez le mot-clé dans le titre et dans le résumé ;
- liez vos articles entre eux.

## Développer en local (optionnel)

```bash
npm install
npm run dev     # http://localhost:3000, admin sur http://localhost:3000/keystatic
npm run build   # vérifie que tout compile
```

En local, l'admin écrit directement dans les fichiers du dossier `content/`.
