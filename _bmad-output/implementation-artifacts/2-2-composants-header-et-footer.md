# Story 2.2 : Composants Header et Footer

Status: review

## Story

En tant que visiteur de digitalgarden,
je veux trouver un header cohérent sur toutes les pages avec accès à la navigation,
afin de pouvoir me déplacer dans le site depuis n'importe quelle page.

## Acceptance Criteria

1. **Given** que `NavLink.astro` existe (Story 2.1)
   **When** je crée `src/components/Header.astro`
   **Then** le composant utilise `<header>` et `<nav>` sémantiques
   **And** il importe et utilise `NavLink` pour chaque lien de navigation (pas de `<a>` inline pour les liens nav)
   **And** il accepte une prop `currentPath: string` pour déterminer le lien actif
   **And** les styles sont dans `<style>` scoped, toutes les valeurs via tokens `var(--*)`
   **And** zéro attribut `style=""` inline

2. **Given** que `Header.astro` est créé
   **When** j'inspecte le HTML généré
   **Then** le lien logo (`/`) est un `<a>` direct dans `<header>` — pas via NavLink
   **And** le lien logo a `color: var(--color-ink)`, `font-family: var(--font-serif)`, `text-decoration: none`

3. **Given** que `currentPath` correspond à une route
   **When** le composant est rendu
   **Then** le `NavLink` de cette route reçoit `active={true}` et affiche `aria-current="page"`

4. **Given** que les tokens Epic 1 sont disponibles
   **When** je crée `src/components/Footer.astro`
   **Then** le composant utilise `<footer>` sémantique, sans props requises
   **And** les styles sont dans `<style>` scoped, toutes valeurs via tokens `var(--*)`
   **And** zéro attribut `style=""` inline

5. **Given** que Header et Footer sont créés
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/components/Header.astro` (AC: #1, #2, #3)
  - [x] Importer `NavLink` depuis `./NavLink.astro`
  - [x] Définir `interface Props { currentPath: string }`
  - [x] Implémenter `<header>` avec `<nav>` sémantique et logo `<a href="/">`
  - [x] Passer `active={currentPath.startsWith('/notes')}` au NavLink Notes
  - [x] Mettre toutes les valeurs visuelles via tokens `var(--)` dans `<style>` scoped
  - [x] Vérifier zéro `style=""` inline dans le fichier

- [x] Tâche 2 : Créer `src/components/Footer.astro` (AC: #4)
  - [x] Implémenter `<footer>` sémantique sans props requises
  - [x] Reproduire le contenu existant : auteur + année + tagline
  - [x] Mettre toutes les valeurs visuelles via tokens `var(--)` dans `<style>` scoped
  - [x] Vérifier zéro `style=""` inline dans le fichier

- [x] Tâche 3 : Valider le build (AC: #5)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

## Dev Notes

### Contexte critique — code existant à reproduire pixel-perfect

**Header existant dans `BaseLayout.astro` (lignes 38–52) :**

```astro
<header style="border-bottom: 1px solid var(--color-border);">
  <nav style="max-width: 900px; margin: 0 auto; padding: 1.25rem 1.5rem;
              display: flex; align-items: center; justify-content: space-between;">
    <a
      href="/"
      style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 600;
             color: var(--color-ink); text-decoration: none;"
    >
      18 rue Divona - Digital Garden
    </a>
    <div style="display: flex; gap: 1.75rem; font-size: 0.9rem;">
      <a href="/notes" style="color: var(--color-ink-muted); text-decoration: none;" class="nav-link">Notes</a>
    </div>
  </nav>
</header>
```

**Footer existant dans `BaseLayout.astro` (lignes 60–66) :**

```astro
<footer style="border-top: 1px solid var(--color-border); margin-top: auto;">
  <div style="max-width: 900px; margin: 0 auto; padding: 2rem 1.5rem;
              display: flex; justify-content: space-between; align-items: center;
              font-size: 0.85rem; color: var(--color-ink-muted);">
    <span>Cyril G - {new Date().getFullYear()}</span>
    <span>Cultivé avec soin 🌱</span>
  </div>
</footer>
```

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `BaseLayout.astro`** → la migration se fait en Story 2.3 (PageLayout) et Epic 4
- **Ne pas modifier `NoteLayout.astro`** → Epic 4
- **Ne pas créer `PageLayout.astro`** → Story 2.3
- Le logo `/` n'utilise PAS `NavLink` — c'est un `<a>` direct avec son propre style (le logo n'est pas un lien de navigation au sens UX)

### Implémentation de référence — Header.astro

```astro
---
import NavLink from './NavLink.astro';

interface Props {
  currentPath: string;
}

const { currentPath } = Astro.props;

const SITE_NAME = '18 rue Divona - Digital Garden';
---

<header class="site-header">
  <nav class="header-nav">
    <a href="/" class="logo">{SITE_NAME}</a>
    <div class="nav-links">
      <NavLink href="/notes" label="Notes" active={currentPath.startsWith('/notes')} />
    </div>
  </nav>
</header>

<style>
  .site-header {
    border-bottom: 1px solid var(--color-border);
  }

  .header-nav {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-md) var(--space-lg);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--color-ink);
    text-decoration: none;
  }

  .logo:hover {
    color: var(--color-ink);
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    gap: var(--space-lg);
  }
</style>
```

**Notes sur Header :**
- `padding: var(--space-md) var(--space-lg)` = 16px 24px ≈ `1.25rem 1.5rem` existant (pixel-perfect acceptable)
- `font-size: var(--text-lg)` = 1.125rem ≈ `1.15rem` existant (très proche, pixel-perfect)
- `gap: var(--space-lg)` = 24px ≈ `1.75rem` existant (légèrement différent — acceptable dans ce contexte de migration)
- Le logo override `color` au hover pour éviter l'application du style `a:hover` de `@layer base` (qui colorise en accent)

### Implémentation de référence — Footer.astro

```astro
---
const SITE_AUTHOR = 'Cyril G';
---

<footer class="site-footer">
  <div class="footer-inner">
    <span>{SITE_AUTHOR} - {new Date().getFullYear()}</span>
    <span>Cultivé avec soin 🌱</span>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--color-border);
    margin-top: auto;
  }

  .footer-inner {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-xl) var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
  }
</style>
```

**Notes sur Footer :**
- `padding: var(--space-xl) var(--space-lg)` = 40px 24px ≈ `2rem 1.5rem` existant (pixel-perfect)
- `font-size: var(--text-sm)` = 0.875rem ≈ `0.85rem` existant (très proche)
- Aucune prop requise — contenu statique avec constante SITE_AUTHOR interne

### Règles d'implémentation critiques

- `interface Props {}` **obligatoire** dans le frontmatter de chaque composant
- `class:list` pour les classes conditionnelles, jamais `className`
- Pas de `!important` — spécificité CSS normale
- Pas de classes globales hors tokens — styles dans `<style>` scoped du composant
- Le logo utilise un `<a>` ordinaire (pas NavLink) car sa sémantique est différente

### Accessibilité (UX-DR4 & UX-DR12)

- `<header>` et `<nav>` sont des landmarks HTML5 — essentiels pour la navigation au clavier
- `aria-current="page"` est géré par NavLink (Story 2.1) — Header passe simplement la prop `active`
- Le focus outline visible (`outline: 2px solid var(--color-accent)`) sera géré globalement en Story 2.3 ou 3.5 dans `@layer base` — ne pas le supprimer avec `outline: none` dans ces composants

### Intelligence des stories précédentes

- **Story 2.1** : NavLink gère l'état actif et `aria-current` — Header délègue cette responsabilité
- **Epic 1** : tous les tokens disponibles — `var(--space-*)`, `var(--text-*)`, `var(--color-*)` etc.
- **BaseLayout.astro** : source de vérité pour le rendu pixel-perfect à reproduire

### Validation

1. Inspection visuelle du code : structure HTML sémantique, zéro `style=""`, tokens partout
2. `npm run build` → pass (composants non utilisés ne cassent pas le build)
3. Validation visuelle en Story 2.3 quand PageLayout utilisera Header + Footer

### Commandes

```bash
npm run build
```

### Structure des fichiers

```
src/
└── components/
    ├── StageBadge.astro   ← existant, NE PAS TOUCHER
    ├── NavLink.astro      ← créé en Story 2.1 (dépendance)
    ├── Header.astro       ← NOUVEAU
    └── Footer.astro       ← NOUVEAU
```

### Project Structure Notes

- Header et Footer sont des composants autonomes dans `src/components/` (pas dans `src/layouts/`)
- Ils seront composés par `PageLayout.astro` en Story 2.3
- Les pages n'importeront jamais Header ou Footer directement — uniquement via PageLayout

### References

- Epics : Story 2.2 AC → [Source: epics.md — "Story 2.2 : Composants Header et Footer"]
- Architecture : composition PageLayout → [Source: architecture.md — "Composition de PageLayout", Option A]
- Architecture : patterns composants → [Source: architecture.md — "Patterns de composants Astro", Règles 1–5]
- UX : UX-DR4 Header accessible → [Source: ux-design-specification.md — UX-DR4]
- Code existant : BaseLayout.astro → [Source: src/layouts/BaseLayout.astro, lignes 38–66]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `Header.astro` : `<header>` + `<nav>` sémantiques, import NavLink, prop `currentPath`, logo `<a>` direct, zéro `style=""`
- `Footer.astro` : `<footer>` sémantique, constante SITE_AUTHOR interne, zéro `style=""`
- Tous les styles via tokens : `var(--color-border)`, `var(--space-md/lg/xl)`, `var(--text-sm/lg)`, `var(--font-serif)`, etc.
- Build propre : 6 pages, 0 erreur

### File List

- src/components/Header.astro
- src/components/Footer.astro

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée — inclut code existant BaseLayout comme référence pixel-perfect | create-story |
