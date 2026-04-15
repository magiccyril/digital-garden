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
