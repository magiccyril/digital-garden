# Story 3.1 : Migrer StageBadge vers les tokens

Status: done

## Story

En tant que visiteur de digitalgarden,
je veux voir le stade de maturité de chaque note via un badge cohérent avec le design system,
afin d'identifier immédiatement le degré de développement d'une idée.

## Acceptance Criteria

1. **Given** que les tokens couleur existent (Epic 1)
   **When** je modifie `src/components/StageBadge.astro`
   **Then** toutes les valeurs OKLCH hardcodées sont remplacées par des tokens `var(--color-*)`
   **And** les props restent identiques : `stage: 'seedling' | 'budding' | 'evergreen'`, `size?: 'sm' | 'md'`
   **And** les styles sont dans `<style>` scoped — zéro attribut `style=""` inline

2. **Given** que StageBadge est migré
   **When** j'inspecte les trois variantes (seedling, budding, evergreen)
   **Then** le rendu visuel est pixel-perfect identique à l'état pré-migration

3. **Given** que StageBadge utilise `border-radius: 999px` hardcodé
   **When** je migre le composant
   **Then** `border-radius: 999px` est remplacé par `var(--radius-pill)`

4. **Given** que le commentaire `// PERSONNALISE :` est présent dans `StageBadge.astro`
   **When** je migre le composant
   **Then** le commentaire est supprimé

5. **Given** que les nouveaux tokens de couleur de stage sont ajoutés dans `@theme {}`
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Ajouter 9 tokens de couleur de stage dans `@theme {}` de `global.css` (AC: #1, #2)
  - [x] Ajouter une section `/* Couleurs des badges de stade */` après les aliases sémantiques
  - [x] Ajouter les 3 tokens seedling : `--color-seedling-bg`, `--color-seedling-fg`, `--color-seedling-border`
  - [x] Ajouter les 3 tokens budding : `--color-budding-bg`, `--color-budding-fg`, `--color-budding-border`
  - [x] Ajouter les 3 tokens evergreen : `--color-evergreen-bg`, `--color-evergreen-fg`, `--color-evergreen-border`

- [x] Tâche 2 : Mettre à jour `src/components/StageBadge.astro` (AC: #1, #2, #3, #4)
  - [x] Remplacer `oklch(95% 0.04 130)` → `var(--color-seedling-bg)` dans `.stage-seedling`
  - [x] Remplacer `oklch(38% 0.12 130)` → `var(--color-seedling-fg)` dans `.stage-seedling`
  - [x] Remplacer `oklch(85% 0.08 130)` → `var(--color-seedling-border)` dans `.stage-seedling`
  - [x] Remplacer `oklch(94% 0.05 160)` → `var(--color-budding-bg)` dans `.stage-budding`
  - [x] Remplacer `oklch(38% 0.14 160)` → `var(--color-budding-fg)` dans `.stage-budding`
  - [x] Remplacer `oklch(84% 0.09 160)` → `var(--color-budding-border)` dans `.stage-budding`
  - [x] Remplacer `oklch(95% 0.05 145)` → `var(--color-evergreen-bg)` dans `.stage-evergreen`
  - [x] Remplacer `oklch(35% 0.15 145)` → `var(--color-evergreen-fg)` dans `.stage-evergreen`
  - [x] Remplacer `oklch(82% 0.10 145)` → `var(--color-evergreen-border)` dans `.stage-evergreen`
  - [x] Remplacer `border-radius: 999px` → `border-radius: var(--radius-pill)` dans `.stage-badge`
  - [x] Supprimer le commentaire `/* PERSONNALISE : ajuste les couleurs des badges ici */`

- [x] Tâche 3 : Valider le build (AC: #5)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

### Review Findings

- [x] [Review][Decision] Classes de taille `stage-badge--sm`/`stage-badge--md` sans règles CSS — La spec (AC #9, Dev Notes) exige les classes Tailwind `text-xs px-2 py-0.5` / `text-sm px-3 py-1`. Les classes BEM ont été introduites post-implémentation sans règles CSS correspondantes : le prop `size` n'a aucun effet visuel. Décision : (a) rétablir les classes Tailwind selon spec, ou (b) définir les règles CSS `.stage-badge--sm` / `.stage-badge--md` pour remplacer les Tailwind. [StageBadge.astro:34]
- [x] [Review][Defer] Stage prop invalide → crash potentiel [StageBadge.astro:34] — deferred, TypeScript union type garantit la valeur au compile time via Content Collections

## Dev Notes

### Contexte critique — code actuel de StageBadge.astro à migrer

```astro
<style>
  .stage-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.35em;
    border-radius: 999px;           ← → var(--radius-pill)
    font-family: var(--font-sans);
    font-weight: 500;
    letter-spacing: 0.01em;
    border: 1px solid transparent;
    user-select: none;
  }

  /* PERSONNALISE : ajuste les couleurs des badges ici */  ← supprimer
  .stage-seedling {
    background-color: oklch(95% 0.04 130);  ← → var(--color-seedling-bg)
    color: oklch(38% 0.12 130);             ← → var(--color-seedling-fg)
    border-color: oklch(85% 0.08 130);      ← → var(--color-seedling-border)
  }

  .stage-budding {
    background-color: oklch(94% 0.05 160);  ← → var(--color-budding-bg)
    color: oklch(38% 0.14 160);             ← → var(--color-budding-fg)
    border-color: oklch(84% 0.09 160);      ← → var(--color-budding-border)
  }

  .stage-evergreen {
    background-color: oklch(95% 0.05 145);  ← → var(--color-evergreen-bg)
    color: oklch(35% 0.15 145);             ← → var(--color-evergreen-fg)
    border-color: oklch(82% 0.10 145);      ← → var(--color-evergreen-border)
  }
</style>
```

### Tokens à ajouter dans `global.css @theme {}`

Valeurs exactes des OKLCH originaux pour garantir le pixel-perfect :

```css
/* Couleurs des badges de stade */
--color-seedling-bg:     oklch(95% 0.04 130);
--color-seedling-fg:     oklch(38% 0.12 130);
--color-seedling-border: oklch(85% 0.08 130);

--color-budding-bg:     oklch(94% 0.05 160);
--color-budding-fg:     oklch(38% 0.14 160);
--color-budding-border: oklch(84% 0.09 160);

--color-evergreen-bg:     oklch(95% 0.05 145);
--color-evergreen-fg:     oklch(35% 0.15 145);
--color-evergreen-border: oklch(82% 0.10 145);
```

**Pourquoi des tokens dédiés et non des aliases vers `--color-accent-*` ?**
Les couleurs budding (hue 160) sont proches de l'accent mais pas identiques (`oklch(38% 0.14 160)` ≠ `var(--color-accent-700)` = oklch(44% 0.15 160)). Pour garantir le pixel-perfect, chaque stage a ses propres tokens avec les valeurs exactes d'origine.

### Token `--radius-pill` — attention au renommage (code review Epic 1)

Le code review a renommé les tokens de rayon pour éviter les collisions avec le namespace Tailwind v4 :

| Avant (à ne pas utiliser) | Après (tokens actuels) |
|--------------------------|----------------------|
| `--radius-sm` | `--radius-small` |
| `--radius-md` | `--radius-medium` |
| `--radius-lg` | `--radius-large` |
| `--radius-full` | `--radius-pill` |

StageBadge utilise `border-radius: 999px` → remplacer par `var(--radius-pill)` (= 9999px, visuellement identique).

### Ce que CETTE story ne fait PAS

- **Ne pas modifier les props** de StageBadge — elles restent identiques
- **Ne pas modifier la logique JS** du frontmatter de StageBadge (`config`, `emoji`, `label`, etc.)
- **Ne pas toucher** aux classes utilitaires Tailwind `text-xs px-2 py-0.5` / `text-sm px-3 py-1` pour le `size` — elles sont intentionnelles
- **Ne pas migrer** les autres composants → stories suivantes
- **`gap: 0.35em`** dans `.stage-badge` : valeur relative interne au composant (pas une valeur du design system, s'adapte à la taille de police) — la laisser telle quelle

### Structure de `global.css` après la tâche 1

```
@theme {
  /* Polices */            ← existant
  /* Palette couleur */    ← existant
  /* Espacement */         ← existant (Story 1.1)
  /* Typographie */        ← existant (Story 1.2)
  /* Rayons */             ← existant (renommé en code review)
  /* Transitions */        ← existant (Story 1.3)
  /* Aliases sémantiques */← existant (Story 1.3)
  /* Couleurs des badges de stade */  ← NOUVEAU
}
```

### Validation

1. Inspection visuelle du code : toutes les OKLCH remplacées, `border-radius: var(--radius-pill)`
2. `npm run build` → 0 erreur
3. Vérification optionnelle dans le navigateur via `npm run dev` — le rendu doit être pixel-perfect

### Commandes

```bash
npm run build
```

### Structure des fichiers

```
src/
├── styles/
│   └── global.css         ← MODIFIÉ (ajout tokens stage)
└── components/
    └── StageBadge.astro   ← MODIFIÉ (migration OKLCH → tokens)
```

### Project Structure Notes

- Deux fichiers modifiés dans cette story : `global.css` ET `StageBadge.astro`
- Les nouveaux tokens `--color-stage-*` seront potentiellement réutilisés dans NoteCard et la page /styleguide (Stories 3.3 et 5.x)
- Après cette story, StageBadge est conforme au contrat du design system : zéro valeur magique

### References

- Epics : Story 3.1 AC → [Source: epics.md — "Story 3.1 : Migrer StageBadge vers les tokens"]
- UX : UX-DR6 StageBadge migration → [Source: ux-design-specification.md — UX-DR6]
- Code existant : StageBadge.astro → [Source: src/components/StageBadge.astro]
- Code review Epic 1 : renommage radius → [Source: 1-3-tokens-rayons-transitions-et-aliases-couleur.md — Review Findings]
- Project context : design system contrat → [Source: project-context.md — "Design system — contrat fondamental"]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Ajout de 9 tokens `--color-seedling/budding/evergreen-bg/fg/border` dans `@theme {}` (section "Couleurs des badges de stade") avec valeurs OKLCH exactes pour pixel-perfect
- Migration de `StageBadge.astro` : toutes les valeurs OKLCH remplacées par `var(--color-*-*)`, `border-radius: 999px` → `var(--radius-pill)`, commentaire `/* PERSONNALISE : */` supprimé
- Build propre : 6 pages générées, 0 erreur
- Tous les AC vérifiés et satisfaits

### File List

- src/styles/global.css
- src/components/StageBadge.astro

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée — intègre renommage radius du code review Epic 1 | create-story |
| 2026-04-14 | 1.1 | Implémentation — 9 tokens stage couleur dans `@theme {}` + migration StageBadge vers tokens | dev-story |
