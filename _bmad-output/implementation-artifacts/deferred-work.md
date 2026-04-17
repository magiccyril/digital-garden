# Deferred Work

## Deferred from: code review de 1-2-echelle-typographique-complete & 1-3-tokens-rayons-transitions-et-aliases-couleur (2026-04-14)

- `border-radius: 4px` dans `.prose code` et `border-radius: 8px` dans `.prose pre` non remplacés par `--radius-sm`/`--radius-md` — intentionnel, déféré à Story 3.5 per spec
- `transition: color 150ms ease` dans `a {}` non remplacé par `var(--duration-fast)` — intentionnel, déféré à Story 3.5/3.x per spec
- Tokens `--duration-fast`, `--duration-base`, `--color-accent`, `--color-accent-hover` non consommés dans le code existant — fondation pour les composants Epic 2 & 3
- `--color-accent: var(--color-accent-500)` bloque la génération des modificateurs d'opacité TW v4 (`bg-accent/50` etc.) — décision reportée à Epic 2 lors de la création des premiers composants qui utiliseront les tokens couleur (résoudre : soit utiliser `var()` uniquement, soit dupliquer la valeur oklch dans l'alias)
- `background: oklch(14% 0.01 250)` et `color: oklch(90% 0.01 250)` hardcodés dans `.prose pre` — valeurs de code block non représentées dans le token system, pré-existant, hors périmètre Epic 1
- `.prose h3 { font-size: 1.2rem }` valeur hors de l'échelle typographique définie (entre `--text-lg: 1.125rem` et `--text-xl: 1.25rem`) — pré-existant, à migrer en Story 3.5
- `JetBrains Mono` déclaré dans `--font-mono` mais absent du chargement Google Fonts dans `BaseLayout.astro` — pré-existant, police mono risque de fallback silencieux
- `.wiki-link--new { cursor: not-allowed }` sans `pointer-events: none` — lien visuellement désactivé mais fonctionnellement cliquable — pré-existant
- `a:hover { color: var(--color-accent-700) }` écrase la couleur de `.wiki-link--new` au survol — pré-existant, besoin d'un override `a.wiki-link--new:hover`
- `<body style="background-color: var(--color-surface); color: var(--color-ink);">` dans `BaseLayout.astro` duplique la règle `html` et bloque les overrides par utilitaires TW — pré-existant

## Deferred from: code review de l'epic-3 stories 3-1 à 3-5 (2026-04-17)

- **3-1** `StageBadge.astro:34` — Stage prop invalide → crash potentiel ; TypeScript union type garantit la valeur au compile time via Content Collections
- **3-2** `Tag.astro:11` — `href=""` (chaîne vide) rend une `<a>` qui navigue vers la page courante ; les appelants passent des URLs valides ou `undefined` en pratique
- **3-3** `NoteCard.astro:41-42` — Overflow horizontal potentiel avec margins négatives `calc(-1 * var(--space-md))` ; à vérifier lors de l'intégration en Epic 4 que les conteneurs parents ont `overflow-x: hidden`
- **3-3** `NoteCard.astro:47` — `will-change: transform` permanent sur chaque carte → consommation GPU sur listes longues ; la spec l'exige explicitement, optimisation possible post-Epic
- **3-3** `NoteCard.astro:25` — Date invalide → crash `toISOString()` / `toLocaleDateString()` ; Astro Content Collections valide les dates au parsing, risque pratique nul
- **3-3** `NoteCard.astro:28` — Tags avec chaîne vide génèrent un `Tag` vide (`# ` visible) ; validation du contenu (frontmatter), pas du composant
- **3-4** `BacklinkList.astro:15` — Slugs non encodés dans les hrefs ; les slugs Astro Content Collections sont normalisés, risque pratique faible

## Deferred from: code review de l'epic-2 (2026-04-16)

- **2-1** `NavLink.astro:6` — Prop `active` sans valeur par défaut TypeScript ; ajouter `active = false` si une valeur par défaut défensive est souhaitée
- **2-1** `NavLink.astro:9` — Prop `href` accepte les URIs `javascript:` sans validation ; à adresser si NavLink est utilisé avec des hrefs dynamiques (CMS, frontmatter)
- **2-2** `Footer.astro:7` — `new Date().getFullYear()` figé à la date du build sur les déploiements statiques ; acceptable sauf si un rebuild annuel n'est pas garanti
- **2-3** `PageLayout.astro:16-17` — `SITE_NAME` / `SITE_AUTHOR` dupliqués dans PageLayout et Footer ; sera consolidé quand BaseLayout sera supprimé en Epic 4
- **2-3** `PageLayout.astro:head` — Absence de meta Open Graph, Twitter card, canonical, et robots ; à adresser dans une story dédiée SEO
- **2-3** `PageLayout.astro:32-35` — Google Fonts chargé sans stratégie de fallback réseau (FOIT/FOUT possible)
- **2-3** `PageLayout.astro:22` — `<html lang="fr">` hardcodé, aucune prop pour surcharger par page
- **2-3** `PageLayout.astro:28` — `title=""` génère " - 18 rue Divona" sans garde ; responsabilité du caller
- **2-3** `PageLayout.astro:26` — `description=""` contourne le fallback et génère une meta vide ; responsabilité du caller
