# vitrine — site vitrine ilipro

Site d'acquisition de l'agence d'automatisation (cible : PME du monde entier). Indépendant de `front/`, `back/` et
`platform/` : aucun import croisé, son propre `package.json` et son propre déploiement (statique).

L'app ilipro (`front/` + `back/`) reste le back-office et l'espace client ; le vitrine ne fait qu'y **lier**
(`PUBLIC_APP_URL`).

## Stack

Astro 7 en sortie **statique** (zéro JS client par défaut) · TypeScript strict · `@astrojs/sitemap` · polices
auto-hébergées via `@fontsource` (Jost, Newsreader italique, DM Mono) — pas d'appel à Google Fonts.

## Commandes

```bash
npm run dev       # serveur de dev (http://localhost:4321)
npm run check     # astro check (types + templates)
npm run build     # astro check && astro build → dist/
npm run preview   # sert dist/
```

**Definition of Done** : `npm run build` vert (0 erreur au check), page vérifiée en FR **et** en EN, à largeur
desktop **et** mobile (375 px, pas de scroll horizontal).

## Structure

```
src/
  i18n/ui.ts                 ← locales + TOUT le texte du site, un dictionnaire par langue
  layouts/BaseLayout.astro   ← <head> SEO : title, description, canonical, hreflang, Open Graph, JSON-LD
  styles/global.css          ← tokens de la palette + classes partagées (.container, .section, .eyebrow, .em, .btn…)
  components/landing/        ← une section de la landing par composant (Nav, Hero, Cases, Process, Model…)
  pages/[locale]/index.astro ← landing, générée pour chaque locale via getStaticPaths
  pages/index.astro          ← redirection / → /fr/ de secours (dev, preview) ; en prod, functions/index.ts prend le relais
functions/index.ts           ← Cloudflare Pages Function sur « / » : 302 vers /fr/ ou /en/ selon Accept-Language
canva/                       ← maquettes de référence (format canvas Design, pas du code exécutable)
```

## i18n

- Locales `fr` (défaut) et `en`, **toutes préfixées** dans l'URL (`/fr/`, `/en/`), `trailingSlash: 'always'`.
- **Aucun texte en dur dans un composant** : tout passe par `ui.ts`. Le type `Dictionary` est dérivé de `fr`, donc une
  clé ajoutée en FR et oubliée en EN casse `astro check`.
- Une nouvelle page = un fichier sous `pages/[locale]/` avec `getStaticPaths` sur `locales`, qui passe son `path` à
  `BaseLayout` (et à `Nav`/`Footer` pour le sélecteur de langue).
- Ajouter une langue : l'ajouter dans `astro.config.mjs` (`i18n.locales`), dans `locales` de `ui.ts`, et traduire le
  dictionnaire.

## SEO

- `BaseLayout` émet canonical, `hreflang` par locale et `x-default` (→ la racine `/`, qui choisit la langue du visiteur). Les hreflang
  vivent **dans le `<head>`**, pas dans le sitemap : l'option i18n du plugin sitemap suppose une locale par défaut sans
  préfixe, ce qui n'est pas notre cas.
- JSON-LD passé par la page (`jsonLd`) : `ProfessionalService` + `FAQPage` sur la landing. Garder le JSON-LD de la FAQ
  synchronisé avec le contenu affiché (il est généré depuis le même dictionnaire).
- Un seul `<h1>` par page ; sections en `<h2>`, éléments en `<h3>`.
- En production, `/` est servi par la Pages Function [`functions/index.ts`](functions/index.ts) : **302** + `Vary:
  Accept-Language` vers la locale préférée du navigateur, `/fr/` sans en-tête (robots, aperçus de lien). Jamais de 301
  ici, et jamais de redirection par langue sur `/fr/` ou `/en/` eux-mêmes : Google doit pouvoir explorer les deux.
  La page Astro `pages/index.astro` n'est qu'un meta-refresh de secours.

## Design

Direction validée : **11e « Atelier · Votre palette »** (référence : [`canva/AtelierSignature.dc.html`](canva/AtelierSignature.dc.html),
qui importe [`canva/Atelier.dc.html`](canva/Atelier.dc.html) avec `palette="signature"`).

- Couleurs uniquement via les variables de `global.css`. Palette du client : `#F1F4F6`, `#94B0C6`, `#C1996D`,
  `#AD723F`, `#1375C4`, plus un marine et ses paliers pour les sections sombres (`#1B2638` → `#3B4C68`, choix
  du client hors palette d'origine, qui remplace l'ancien `#0E2A40`).
  **Ne pas introduire de couleur hors palette** sans le signaler.
- Exception assumée : `--on-accent` est `#FFFFFF` (et non `#F1F4F6`) pour passer le contraste AA sur `#1375C4`.
- Le cuivre `--em` n'est assez contrasté sur fond clair que pour du **grand** texte (titres en italique serif).
- Pas de chiffre, de témoignage ni de logo client inventé : un manque devient un emplacement explicite.

## Variables d'environnement

Voir [`.env.example`](.env.example). `PUBLIC_SITE_URL` alimente canonical/hreflang/sitemap (défaut :
`http://localhost:4321`) ; `PUBLIC_APP_URL` le lien « Espace client » (masqué si absent) ; `PUBLIC_CONTACT_ENDPOINT`
l'`action` du formulaire.

## Reste à faire avant mise en ligne

- Brancher le formulaire de contact (`PUBLIC_CONTACT_ENDPOINT`) — aujourd'hui il ne poste nulle part.
- Pages **Mentions légales** et **Confidentialité** (obligatoires en France), puis les lier dans le footer.
- Une page par cas d'usage, image Open Graph.
- Domaine définitif dans `PUBLIC_SITE_URL`.
