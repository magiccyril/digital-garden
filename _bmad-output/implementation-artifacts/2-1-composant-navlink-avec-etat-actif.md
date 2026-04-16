# Story 2.1 : Composant NavLink avec état actif

Status: done

## Story

En tant que visiteur de digitalgarden,
je veux que les liens de navigation indiquent clairement la page courante,
afin de savoir où je me trouve dans le site à tout moment.

## Acceptance Criteria

1. **Given** que les tokens de l'Epic 1 sont disponibles
   **When** je crée `src/components/NavLink.astro`
   **Then** le composant accepte exactement les props `href: string`, `label: string`, `active: boolean`
   **And** les styles sont dans un bloc `<style>` scoped — zéro attribut `style=""` inline
   **And** toutes les valeurs CSS utilisent des tokens `var(--)` (couleur, transition)

2. **Given** que `active` est `true`
   **When** le composant est rendu
   **Then** le lien a l'attribut `aria-current="page"`
   **And** le lien a un style visuel distinct : `font-weight: 500` et `color: var(--color-ink)`

3. **Given** que `active` est `false`
   **When** le visiteur survole le lien
   **Then** la couleur transite vers `var(--color-ink)` en `var(--duration-fast)` — uniquement sur la propriété `color` (pas de changement de layout)

4. **Given** que `NavLink.astro` est créé
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/components/NavLink.astro` avec la structure complète (AC: #1, #2, #3)
  - [x] Créer le fichier dans `src/components/` (PascalCase)
  - [x] Définir `interface Props { href: string; label: string; active: boolean }` dans le frontmatter `---`
  - [x] Implémenter le template HTML : `<a>` avec `class:list` pour l'état actif, `aria-current` conditionnel
  - [x] Ajouter le bloc `<style>` scoped avec : couleur par défaut, état actif, hover avec transition
  - [x] Utiliser uniquement des tokens `var(--)` pour toutes les valeurs visuelles

- [x] Tâche 2 : Valider le build (AC: #4)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

### Review Findings

- [x] [Review][Defer] Prop `active` sans valeur par défaut TypeScript [NavLink.astro:6] — deferred, pré-existant : l'interface exige la prop, Astro compile-time enforce le type ; ajouter `active = false` si une valeur par défaut défensive est souhaitée
- [x] [Review][Defer] Prop `href` accepte les URIs `javascript:` sans validation [NavLink.astro:9] — deferred, pré-existant : actuellement seuls des liens hardcodés sont passés ; à adresser si NavLink est utilisé avec des hrefs dynamiques (CMS, frontmatter)

## Dev Notes

### Contexte critique — état actuel de la navigation

La navigation existe actuellement dans `src/layouts/BaseLayout.astro` sous cette forme :

```astro
<div style="display: flex; gap: 1.75rem; font-size: 0.9rem;">
  <a href="/notes" style="color: var(--color-ink-muted); text-decoration: none;" class="nav-link">Notes</a>
</div>

<style>
  .nav-link:hover {
    color: var(--color-ink) !important;  ← anti-pattern : !important
  }
</style>
```

**Problèmes à corriger dans le nouveau composant :**
- Zéro `style=""` inline
- Zéro `!important`
- Gestion de l'état actif manquante (pas d'`aria-current`, pas de style distinct)
- Transition CSS absente (le hover est instantané)

**`BaseLayout.astro` n'est PAS modifié dans cette story** — NavLink sera intégré dans Header (Story 2.2) puis PageLayout (Story 2.3).

### Ce que CETTE story ne fait PAS

- Ne pas modifier `BaseLayout.astro` → Stories 2.2 & 2.3
- Ne pas créer Header, Footer ni PageLayout → Stories 2.2 & 2.3
- Ne pas utiliser NavLink dans une page existante → Story 2.2 l'intégrera dans Header

### Implémentation de référence

```astro
---
interface Props {
  href: string;
  label: string;
  active: boolean;
}

const { href, label, active } = Astro.props;
---

<a
  href={href}
  class:list={['nav-link', { active }]}
  aria-current={active ? 'page' : undefined}
>
  {label}
</a>

<style>
  .nav-link {
    color: var(--color-ink-muted);
    text-decoration: none;
    font-size: var(--text-sm);
    transition: color var(--duration-fast) ease;
  }

  .nav-link:hover {
    color: var(--color-ink);
  }

  .nav-link.active {
    color: var(--color-ink);
    font-weight: 500;
  }
</style>
```

**Points d'attention :**
- `aria-current={active ? 'page' : undefined}` → Astro n'émet pas l'attribut quand la valeur est `undefined` (correct)
- `class:list={['nav-link', { active }]}` → syntaxe Astro native, jamais `className` (syntaxe React)
- Transition `color var(--duration-fast) ease` → uniquement sur `color`, pas de `transition: all` (évite les changements de layout)
- `font-size: var(--text-sm)` = 0.875rem ≈ la valeur actuelle `0.9rem` dans BaseLayout (pixel-perfect approximatif acceptable, sera validé visuellement en Story 2.2)
- Pas de `!important` — la spécificité CSS normale suffit

### Règles d'implémentation obligatoires (project-context.md)

| ❌ Interdit | ✅ Correct |
|------------|-----------|
| `style="color: var(--color-ink-muted)"` | `color: var(--color-ink-muted)` dans `<style>` scoped |
| `className={active ? 'active' : ''}` | `class:list={['nav-link', { active }]}` |
| `transition: color 150ms ease` (valeur hardcodée) | `transition: color var(--duration-fast) ease` |
| `font-weight: 500` dans un `style=""` | `font-weight: 500` dans `<style>` scoped |

### Contexte de l'état actif

L'état `active` sera déterminé par la page parente (Header) via `Astro.url.pathname`. Par exemple :

```astro
<!-- Dans Header.astro (Story 2.2) -->
<NavLink href="/notes" label="Notes" active={Astro.url.pathname.startsWith('/notes')} />
```

NavLink lui-même ne connaît pas la route courante — c'est la responsabilité du parent de lui passer la prop `active`.

### Intelligence des stories précédentes

- **Epic 1 complet** : tous les tokens sont disponibles — `var(--color-ink-muted)`, `var(--color-ink)`, `var(--text-sm)`, `var(--duration-fast)` peuvent être utilisés directement
- **Tailwind v4** : les classes utilitaires `flex`, `gap-*` etc. sont disponibles si nécessaire pour la mise en page, mais les valeurs visuelles passent par les tokens

### Validation (absence de test framework)

1. Inspection visuelle du code : vérifier la structure, les props, les styles
2. `npm run build` → doit passer même si NavLink n'est pas encore importé dans une page (les composants non utilisés ne cassent pas le build)
3. La validation visuelle du rendu se fera en Story 2.2 quand NavLink sera intégré dans Header

### Commandes

```bash
npm run build
```

### Structure des fichiers

```
src/
└── components/
    ├── StageBadge.astro   ← existant, NE PAS TOUCHER
    └── NavLink.astro      ← NOUVEAU fichier à créer
```

### Project Structure Notes

- Composants dans `src/components/` en PascalCase
- Ce composant sera importé par `Header.astro` (Story 2.2)
- Zéro dépendance sur des styles globaux hors tokens `var(--*)`

### References

- Epics : Story 2.1 AC → [Source: epics.md — "Story 2.1 : Composant NavLink avec état actif"]
- Architecture : patterns composants Astro → [Source: architecture.md — "Patterns de composants Astro", Règles 1, 2, 3]
- UX : UX-DR4 Header accessible → [Source: ux-design-specification.md — UX-DR4]
- Project context : règles Astro → [Source: project-context.md — "Règles Astro"]
- BaseLayout existant : navigation actuelle → [Source: src/layouts/BaseLayout.astro]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `NavLink.astro` créé dans `src/components/` avec props `href/label/active`
- `class:list` utilisé (syntaxe Astro native, pas className)
- `aria-current={active ? 'page' : undefined}` — Astro omet l'attribut quand undefined
- Toutes les valeurs CSS via tokens : `var(--color-ink-muted)`, `var(--color-ink)`, `var(--text-sm)`, `var(--duration-fast)`
- Build propre : 6 pages, 0 erreur

### File List

- src/components/NavLink.astro

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée — inclut analyse de BaseLayout.astro existant | create-story |
