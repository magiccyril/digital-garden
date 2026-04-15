---
title: "Product Brief Distillate: digitalgarden"
type: llm-distillate
source: "product-brief-digitalgarden.md"
created: "2026-04-13"
purpose: "Token-efficient context for downstream PRD creation"
---

# Distillate — Digitalgarden Design System Refonte

## Contexte technique

- **Framework** : Astro 6 (SSG, sortie statique)
- **Styling** : Tailwind v4 via `@tailwindcss/vite`, tokens dans `@theme {}` de `global.css`
- **Markdown** : MDX + plugin `remark-wiki-link` pour syntaxe `[[note-slug]]`
- **Backlinks** : calculés à la compilation (chaque note liste ses mentions)
- **Déploiement** : homelab auto-hébergé, pas Docker — systemd + inotifywait + `npm run build`
- **Reverse proxy** : SWAG (Nginx-based, TLS)
- **Sync notes** : Syncthing entre poste local et serveur → `src/content/notes/` est un symlink vers `/data/syncthing/notes`
- **Watch script** : `watch-and-build.sh` — debounce 3s, rebuild complet à chaque changement de note

## État du code actuel (problèmes identifiés)

- ~60 attributs `style=""` inline dans les fichiers `.astro` (layout, espacement, flex/grid)
- Valeurs magiques sans échelle : `1rem`, `1.5rem`, `2.5rem` (espacement) ; `4px`, `8px`, `12px` (rayons) ; `150ms`, `200ms` (transitions)
- Un seul composant réutilisable : `StageBadge.astro` — tout le reste est HTML + styles inline
- Commentaires `// PERSONNALISE :` résiduels (~10+) dans le code — dette silencieuse à nettoyer
- Tokens couleurs et polices déjà présents dans `@theme` et corrects — à conserver
- Taille actuelle : `global.css` 156 lignes, 5 fichiers `.astro` principaux

## Frontmatter Obsidian (schéma Zod)

```yaml
title: string          # requis
date: YYYY-MM-DD       # requis, coercé en Date JS
stage: seedling | budding | evergreen  # requis
tags: string[]         # optionnel, défaut []
publish: boolean       # optionnel, défaut false — filtre de publication
description: string    # optionnel, pour aperçu dans les listes
```

- `publish: false` exclut la note de tout build (mode brouillon)
- Les slugs sont dérivés automatiquement du nom de fichier

## Décisions prises (ne pas re-proposer)

- **Migration en une passe unique** — pas de refactoring incrémental fichier par fichier
- **Style visuel conservé à l'identique** — aucun changement esthétique (couleurs, polices, espacement visuel)
- **Convention d'extraction** : tout pattern visuel utilisé 2+ fois → composant dédié ; pattern utilisé une seule fois → style scopé dans la page, acceptable
- **BookCard reporté en v2** — la section "Notes de lecture" n'existe pas encore, le composant sera créé quand le contenu sera prêt
- **Dark mode hors périmètre** — ni tokens préparés, ni infrastructure prévue en v1
- **Page `/styleguide` en v1** — documentation vivante des composants, à créer dans le même sprint que la refonte

## Composants à extraire (v1)

| Composant | Source actuelle | Notes |
|-----------|----------------|-------|
| `Header` | `BaseLayout.astro` | Logo, nav, responsive |
| `Footer` | `BaseLayout.astro` | Liens, copyright |
| `PageLayout` | `BaseLayout.astro` | Wrapper générique (slot) |
| `NavLink` | inline dans Header | Lien nav avec état actif |
| `NoteCard` | `index.astro` + `notes/index.astro` | Carte dans les listes (titre, date, stage, tags) |
| `Tag` | inline dans plusieurs pages | Badge tag cliquable |
| `BacklinkList` | `NoteLayout.astro` | Liste de backlinks |
| `StageBadge` | existant — à conserver | Badges seedling/budding/evergreen |

## Design tokens à formaliser (v1)

Les tokens couleurs et polices existent déjà. À ajouter dans `@theme {}` :

- **Espacement** : scale base-4 → `--space-1` (4px) à `--space-16` (64px) minimum
- **Typographie** : `--text-xs`, `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl` + hauteurs de ligne associées
- **Rayons** : `--radius-sm` (4px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-full` (999px)
- **Transitions** : `--duration-fast` (150ms), `--duration-base` (200ms)

## Roadmap v2 (signaux capturés)

- **Section "Notes de lecture"** : couvertures de livres + métadonnées → nécessite `BookCard` + nouveau type de contenu dans la collection ou collection séparée
- **Page "À propos"** : contenu statique, structure simple, pas de contrainte technique
- **Dark mode** : possible si tokens sont bien nommés en sémantique (ex: `--color-surface` plutôt que `--color-white`)

## Questions ouvertes pour le PRD

- La page `/styleguide` est-elle accessible publiquement ou en local seulement ?
- Les tags dans les notes sont-ils cliquables (filtrage) ou purement affichés ?
- La collection "Notes de lecture" sera-t-elle une nouvelle collection Astro séparée ou un type de note dans la collection existante ?
- Faut-il préserver la compatibilité avec les notes déjà publiées lors de la migration (slugs stables) ?
