# Story 1.2 : Échelle typographique complète

Status: done

## Story

En tant que développeur de digitalgarden,
je veux que toutes les tailles de texte soient définies comme tokens dans `@theme`,
afin de garantir une typographie cohérente sans valeurs hardcodées.

## Acceptance Criteria

1. **Given** que les tokens d'espacement sont en place (Story 1.1)
   **When** j'ajoute l'échelle typographique
   **Then** les 7 tokens suivants existent exactement dans `@theme {}` :
   `--text-xs: 0.75rem`, `--text-sm: 0.875rem`, `--text-base: 1rem`, `--text-lg: 1.125rem`, `--text-xl: 1.25rem`, `--text-2xl: 1.5rem`, `--text-3xl: 2rem`

2. **Given** que les tokens typographiques sont ajoutés
   **When** j'inspecte `@layer base` dans `global.css`
   **Then** la règle `html` utilise `font-size: 112.5%` (équivalent à 18px sur base 16px navigateur)

3. **Given** que les tokens typographiques existent et que la base HTML est à 112.5%
   **When** j'inspecte le rendu d'une page existante dans le navigateur
   **Then** les tailles de texte sont visuellement identiques à l'état pré-refonte (pixel-perfect)

4. **Given** que les modifications sont appliquées
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Ajouter les 7 tokens typographiques dans `@theme {}` de `src/styles/global.css` (AC: #1)
  - [x] Insérer les tokens après le bloc `/* Espacement */`, avant la fermeture du bloc `@theme`
  - [x] Vérifier que les 7 tokens sont présents avec les valeurs exactes
  - [x] Ajouter un commentaire section `/* Typographie */` pour la lisibilité

- [x] Tâche 2 : Changer `font-size: 18px` → `font-size: 112.5%` dans la règle `html` de `@layer base` (AC: #2)
  - [x] Localiser la règle `html { font-size: 18px; ... }` dans `@layer base`
  - [x] Remplacer uniquement la valeur de `font-size` : `18px` → `112.5%`
  - [x] Ne modifier aucune autre propriété de la règle `html`

- [x] Tâche 3 : Valider le rendu pixel-perfect (AC: #3)
  - [x] Exécuter `npm run dev` et ouvrir une page dans le navigateur
  - [x] Confirmer que les tailles de texte sont visuellement identiques à l'état pré-refonte
  - [x] 112.5% × 16px (base navigateur) = 18px → résultat identique

- [x] Tâche 4 : Valider le build (AC: #4)
  - [x] Exécuter `npm run build` depuis la racine du projet
  - [x] Confirmer que le build se termine sans erreur ni warning

## Dev Notes

### Contexte critique — état actuel du fichier après Story 1.1

`src/styles/global.css` a la structure suivante au début de cette story :

```css
@import "tailwindcss";

@theme {
  /* Polices */
  --font-serif: "Lora", ...;
  --font-sans: "Inter", ...;
  --font-mono: "JetBrains Mono", ...;

  /* Palette couleur (NE PAS MODIFIER) */
  --color-accent-50 ... --color-border: ...;

  /* Espacement — ajouté en Story 1.1 */
  --space-xs: 4px; ... --space-2xl: 64px;
}

@layer base {
  html {
    font-size: 18px;   ← À CHANGER en 112.5%
    line-height: 1.7;
    /* ... autres propriétés ... */
  }
  /* ... styles prose avec valeurs hardcodées — NE PAS TOUCHER dans cette story ... */
}
```

### Ce que CETTE story ne fait PAS

- Ne pas ajouter les tokens de rayons/transitions/aliases couleur → Story 1.3
- **Ne pas remplacer les valeurs hardcodées dans `.prose`** (ex: `font-size: 1.5rem` sur `.prose h2`, `1.2rem` sur `.prose h3`) → ces remplacements se font en Story 3.5
- Ne pas modifier `StageBadge.astro` ni aucun autre fichier `.astro`
- Ne pas ajouter de tokens de `line-height` séparés (l'UX spec mentionne "avec line-heights associées" mais les AC ne spécifient que les tailles — le `line-height: 1.7` global sur `html` reste dans `@layer base` tel quel)

### Pourquoi `112.5%` au lieu de `18px`

`font-size: 18px` est une valeur absolue qui **ignore les préférences de taille de texte de l'utilisateur** dans le navigateur.
`font-size: 112.5%` est relatif à la préférence du navigateur (base 16px par défaut) :
- 112.5% × 16px = **18px** → rendu pixel-perfect identique
- Respecte les préférences d'accessibilité (zoom navigateur, paramètres utilisateur)
- Recommandé par les bonnes pratiques CSS modernes

### Résultat attendu après implémentation

```css
@theme {
  /* ... tokens existants (polices, couleurs, espacement) ... */

  /* Typographie */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  2rem;      /* 32px */
}

@layer base {
  html {
    font-size: 112.5%;  /* ← changé de 18px */
    /* ... reste inchangé ... */
  }
}
```

### Intelligence de la story précédente (Story 1.1)

- Pattern établi : tokens ajoutés dans `@theme {}` après un commentaire de section
- Les tokens ne sont pas encore utilisés dans les composants — ils seront utilisés à partir de l'Epic 2 & 3
- Structure `global.css` : `@import` + `@theme {}` + `@layer base {}` — validée propre

### Correspondance tokens ↔ valeurs prose existantes

Ces correspondances seront utilisées dans Story 3.5 pour remplacer les hardcodes :

| Token | Valeur | Usage prose actuel |
|-------|--------|--------------------|
| `--text-2xl` | 1.5rem | `.prose h2 { font-size: 1.5rem }` |
| `--text-xl` | 1.25rem | (futur `.prose h3`) |
| `--text-sm` | 0.875rem | `.prose code { font-size: 0.875em }`, `.prose pre { font-size: 0.875em }` |

Ne pas faire ces remplacements maintenant — hors périmètre Story 1.2.

### Validation (absence de test framework)

Pas de framework de test dans ce projet. La validation se fait par :
1. Inspection visuelle du fichier `global.css` pour vérifier les tokens et le changement `html`
2. `npm run dev` + vérification visuelle dans le navigateur (les tailles de texte doivent être identiques)
3. `npm run build` pour confirmer l'absence d'erreur

### Commandes

```bash
npm run dev    # pour vérification visuelle
npm run build  # pour validation finale
```

### Structure des fichiers

```
src/
└── styles/
    └── global.css    ← SEUL fichier modifié dans cette story
```

### Project Structure Notes

- Seul `src/styles/global.css` est modifié dans cette story
- Les tokens typographiques ne sont pas encore utilisés dans les composants — ils servent de fondation pour les stories Epic 3
- `--text-3xl` (2rem) est défini pour la complétude du système même s'il n'est pas encore utilisé

### References

- Epics : Story 1.2 AC → [Source: epics.md — "Story 1.2 : Échelle typographique complète"]
- Architecture : tokens typographiques → [Source: architecture.md — "Tokens CSS (`global.css` → `@theme {}`)" ]
- UX : UX-DR2 échelle typographique → [Source: ux-design-specification.md — UX-DR2]
- Project context : règles Tailwind v4 → [Source: project-context.md — "Règles Tailwind v4"]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Ajout des 7 tokens `--text-xs` → `--text-3xl` dans `@theme {}` après le bloc espacement
- `html { font-size: 18px }` → `font-size: 112.5%` dans `@layer base` (équivalent pixel-perfect, meilleure accessibilité)
- Build propre : 6 pages générées, 0 erreur, 0 warning
- Tous les AC vérifiés et satisfaits

### File List

- src/styles/global.css

### Review Findings

- [x] [Review][Patch] Ajout de `--text-3xl--line-height: calc(2.25 / 2)` dans `@theme` — companion TW v4 recalibré pour 2rem [src/styles/global.css:45] ✓ corrigé
- [x] [Review][Patch] Commentaires `/* px */` mis à jour dans les tokens `--text-*` [src/styles/global.css:38-44] — annotations corrigées pour la base 18px ✓ corrigé

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée | create-story |
| 2026-04-14 | 1.1 | Implémentation — 7 tokens `--text-*` + html font-size 112.5% | dev-story |
