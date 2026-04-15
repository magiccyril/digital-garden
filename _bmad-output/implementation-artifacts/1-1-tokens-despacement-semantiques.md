# Story 1.1 : Tokens d'espacement sémantiques

Status: done

## Story

En tant que développeur de digitalgarden,
je veux que tous les espacements soient définis comme tokens sémantiques nommés dans `@theme`,
afin de ne jamais avoir à utiliser une valeur magique pour l'espacement.

## Acceptance Criteria

1. **Given** que `global.css` contient un bloc `@theme {}`
   **When** j'ajoute les tokens d'espacement
   **Then** les 6 tokens suivants existent exactement : `--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 40px`, `--space-2xl: 64px`
   **And** ces tokens sont accessibles via `var(--space-xs)` etc. dans tout fichier `.astro`

2. **Given** que le bloc `@theme {}` est en place
   **When** j'inspecte `global.css`
   **Then** le fichier contient uniquement `@theme {}` et `@layer base {}` — aucun style de composant n'est présent en dehors de ces deux blocs

3. **Given** que les tokens d'espacement sont ajoutés
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Ajouter les 6 tokens d'espacement dans `@theme {}` de `src/styles/global.css` (AC: #1)
  - [x] Insérer les tokens après les tokens de couleur existants, avant la fermeture du bloc `@theme`
  - [x] Vérifier que les 6 tokens sont présents avec les valeurs exactes : `--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 40px`, `--space-2xl: 64px`
  - [x] Ajouter un commentaire section `/* Espacement */` pour la lisibilité

- [x] Tâche 2 : Vérifier la structure de `global.css` (AC: #2)
  - [x] Confirmer que `global.css` contient uniquement `@import "tailwindcss"`, `@theme {}` et `@layer base {}`
  - [x] Confirmer qu'aucun style de composant n'a été ajouté hors de ces blocs

- [x] Tâche 3 : Valider le build (AC: #3)
  - [x] Exécuter `npm run build` depuis la racine du projet
  - [x] Confirmer que le build se termine sans erreur ni warning

## Dev Notes

### Contexte critique — état actuel du fichier

`src/styles/global.css` a la structure suivante :

```css
@import "tailwindcss";

@theme {
  /* Polices */
  --font-serif: "Lora", ...;
  --font-sans: "Inter", ...;
  --font-mono: "JetBrains Mono", ...;

  /* Palette — tokens couleur existants (NE PAS MODIFIER) */
  --color-accent-50: oklch(97% 0.02 160);
  --color-accent-100: oklch(92% 0.05 160);
  --color-accent-200: oklch(85% 0.09 160);
  --color-accent-500: oklch(60% 0.18 160);
  --color-accent-600: oklch(52% 0.18 160);
  --color-accent-700: oklch(44% 0.15 160);
  --color-accent-900: oklch(28% 0.10 160);
  --color-surface: oklch(99% 0.005 90);
  --color-ink: oklch(18% 0.01 250);
  --color-ink-muted: oklch(50% 0.01 250);
  --color-border: oklch(88% 0.01 250);
}

@layer base {
  /* ... styles existants — NE PAS MODIFIER ... */
}
```

**Action requise pour cette story** : ajouter uniquement les 6 tokens `--space-*` dans le bloc `@theme {}` existant.

### Ce que CETTE story ne fait PAS

- Ne pas ajouter les tokens typographiques (`--text-*`) → Story 1.2
- Ne pas ajouter les tokens de rayons/transitions/aliases → Story 1.3
- Ne pas modifier `@layer base {}` → aucune modification requise
- Ne pas remplacer les valeurs hardcodées dans `@layer base` (ex: `font-size: 18px`, `transition: color 150ms ease`, `border-radius: 4px`) → ces remplacements se font dans les stories suivantes
- Ne pas toucher à `StageBadge.astro` ni à aucun autre fichier `.astro`

### Règles d'implémentation obligatoires

- **Tailwind v4** : les tokens dans `@theme {}` deviennent automatiquement accessibles via `var(--nom)` — aucune configuration supplémentaire requise
- **Syntaxe correcte** : `@import "tailwindcss"` (pas `@tailwind base/components/utilities` — syntaxe v3 obsolète)
- **Pas de `tailwind.config.js`** — configuration uniquement dans `global.css`
- **Séquence de migration** : les tokens d'espacement en premier, avant tout composant — c'est la Phase 1 de la migration en 5 phases

### Résultat attendu après implémentation

```css
@theme {
  /* ... tokens existants ... */

  /* Espacement — base 4px */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;
}
```

### Validation (absence de test framework)

Pas de framework de test dans ce projet. La validation se fait par :
1. Inspection visuelle du fichier `global.css` pour vérifier la présence des tokens
2. Exécution de `npm run build` pour confirmer l'absence d'erreur
3. Aucune vérification visuelle dans le navigateur n'est requise pour cette story — les tokens ne sont pas encore utilisés

### Structure des fichiers

```
src/
├── styles/
│   └── global.css    ← SEUL fichier modifié dans cette story
└── components/
    └── StageBadge.astro  ← NE PAS TOUCHER
```

### Commande de build

```bash
npm run build
```

### Project Structure Notes

- Seul `src/styles/global.css` est modifié dans cette story
- Les tokens ajoutés ne sont pas encore utilisés dans cette story — ils servent de fondation pour les stories suivantes (Epic 2 & 3)
- Les tokens couleur et polices dans `@theme {}` sont déjà en place et fonctionnels — ne pas les modifier

### References

- Architecture : tokens CSS complets → [Source: architecture.md — "Tokens CSS (`global.css` → `@theme {}`)" ]
- Epics : Story 1.1 AC → [Source: epics.md — "Story 1.1 : Tokens d'espacement sémantiques"]
- Project context : règles Tailwind v4 → [Source: project-context.md — "Règles Tailwind v4"]
- UX : tokens d'espacement sémantiques → [Source: ux-design-specification.md — UX-DR1]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Ajout des 6 tokens `--space-xs` → `--space-2xl` dans `@theme {}` de `global.css`, après les tokens couleur existants
- Structure `global.css` préservée : `@import "tailwindcss"` + `@theme {}` + `@layer base {}` uniquement
- Build propre : 6 pages générées, 0 erreur, 0 warning
- Tous les AC vérifiés et satisfaits

### File List

- src/styles/global.css

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée | create-story |
| 2026-04-14 | 1.1 | Implémentation — 6 tokens `--space-*` ajoutés dans `@theme {}` | dev-story |
