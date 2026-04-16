# Story 5.1 : Page /styleguide avec section tokens

Status: review

## Story

En tant que développeur de digitalgarden,
je veux une page `/styleguide` affichant tous les tokens du design system,
afin de connaître d'un coup d'œil les valeurs disponibles sans ouvrir `global.css`.

## Acceptance Criteria

1. **Given** que tous les tokens sont définis (Epic 1) et que `PageLayout` existe (Epic 2)
   **When** je crée `src/pages/styleguide.astro`
   **Then** la page utilise `PageLayout` pour la structure
   **And** elle affiche une section "Tokens" avec : palette couleur (swatches), échelle d'espacement (boîtes), échelle typographique (texte de démonstration), rayons (boîtes avec border-radius), transitions (labels)
   **And** la page est accessible via `/styleguide` dans le navigateur

2. **Given** que la page styleguide est ouverte
   **When** j'inspecte son code
   **Then** elle ne contient aucun `style=""` inline et toutes les valeurs CSS sont via tokens

3. **Given** que la page styleguide est créée
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur (7 pages au total)

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/pages/styleguide.astro` avec `PageLayout` et les imports (AC: #1)
  - [x] Créer le fichier `src/pages/styleguide.astro`
  - [x] Importer `PageLayout from '../layouts/PageLayout.astro'`
  - [x] Importer les composants nécessaires aux démos : `NoteCard`, `StageBadge`, `Tag`, `BacklinkList`, `NavLink`
  - [x] Déclarer les données d'exemple en frontmatter

- [x] Tâche 2 : Section "Couleurs" — swatches via classes CSS scoped (AC: #1, #2)
  - [x] Swatches de la palette accent (50, 100, 200, 500, 600, 700, 900)
  - [x] Swatches couleurs interface (surface, ink, ink-muted, border)
  - [x] Swatches couleurs stades (seedling-bg/fg/border, budding-bg/fg/border, evergreen-bg/fg/border)
  - [x] Chaque swatch : classe CSS `.sg-swatch--{token}` avec `background: var(--color-{token})` dans le bloc `<style>` scoped

- [x] Tâche 3 : Section "Espacement" — boîtes dimensionnées par classes (AC: #1, #2)
  - [x] Une ligne par token (`--space-xs` à `--space-2xl`) avec une boîte colorée + label
  - [x] Chaque boîte : classe `.sg-space--{size}` avec `width` et `height` via `var(--space-{size})`

- [x] Tâche 4 : Section "Typographie" — démonstration en taille réelle (AC: #1, #2)
  - [x] Une ligne par token (`--text-xs` à `--text-3xl`) avec texte de démo + label
  - [x] Chaque démonstration : classe `.sg-type--{size}` avec `font-size: var(--text-{size})`

- [x] Tâche 5 : Section "Rayons de bordure" — boîtes avec border-radius (AC: #1, #2)
  - [x] Une boîte par token (`--radius-small`, `--radius-medium`, `--radius-large`, `--radius-pill`)
  - [x] Chaque boîte : classe `.sg-radius--{name}` avec `border-radius: var(--radius-{name})`

- [x] Tâche 6 : Section "Transitions" — liste des tokens (AC: #1, #2)
  - [x] `--duration-fast: 150ms`, `--duration-base: 200ms` affichés sous forme de tableau simple

- [x] Tâche 7 : Valider (AC: #3)
  - [x] `grep 'style="' src/pages/styleguide.astro` → 0 résultat
  - [x] `npm run build` → 0 erreur, **7 pages** générées (1 de plus qu'avant)

## Dev Notes

### Fichier cible

```
src/pages/styleguide.astro   ← CRÉER (cette story)
```

Chemin de page : `src/pages/styleguide.astro` → URL `/styleguide`. Convention : `kebab-case.astro` pour les pages (cf. architecture Règle de nommage).

### Chemins d'import depuis `src/pages/styleguide.astro`

```astro
import PageLayout from '../layouts/PageLayout.astro';
import NoteCard from '../components/NoteCard.astro';
import StageBadge from '../components/StageBadge.astro';
import Tag from '../components/Tag.astro';
import BacklinkList from '../components/BacklinkList.astro';
import NavLink from '../components/NavLink.astro';
```

`Header` et `Footer` **ne sont pas importés** : `PageLayout` les compose en interne. C'est la règle architecturale : les pages n'importent jamais `Header` ni `Footer` directement.

### Règle critique : 0 `style=""` inline — pattern swatches

Pour afficher les couleurs des tokens sans `style=""` inline, utiliser des classes CSS scoped. Chaque couleur obtient sa propre classe dans `<style>` :

```css
/* Dans <style> scoped du composant */
.sg-swatch--accent-50  { background: var(--color-accent-50);  border: 1px solid var(--color-border); }
.sg-swatch--accent-100 { background: var(--color-accent-100); }
.sg-swatch--accent-200 { background: var(--color-accent-200); }
.sg-swatch--accent-500 { background: var(--color-accent-500); }
.sg-swatch--accent-600 { background: var(--color-accent-600); }
.sg-swatch--accent-700 { background: var(--color-accent-700); }
.sg-swatch--accent-900 { background: var(--color-accent-900); }
.sg-swatch--surface    { background: var(--color-surface);    border: 1px solid var(--color-border); }
.sg-swatch--ink        { background: var(--color-ink); }
.sg-swatch--ink-muted  { background: var(--color-ink-muted); }
.sg-swatch--border     { background: var(--color-border);     border: 1px solid var(--color-ink-muted); }
/* …etc pour seedling, budding, evergreen */
```

Et dans le template :
```html
<!-- ✅ Correct — 0 style="" inline -->
<div class="sg-swatch__color sg-swatch--accent-500"></div>

<!-- ❌ Interdit -->
<div style="background: var(--color-accent-500)"></div>
```

### Noms réels des tokens `--radius-*` (≠ architecture doc)

Le document d'architecture planifiait `--radius-sm/md/lg/full` mais l'implémentation Epic 1 a retenu des noms distincts pour éviter les conflits avec le namespace Tailwind v4 :

| Token réel dans global.css | Valeur |
|---------------------------|--------|
| `--radius-small`          | `4px`  |
| `--radius-medium`         | `8px`  |
| `--radius-large`          | `12px` |
| `--radius-pill`           | `9999px` |

**Utiliser ces noms exacts.** `--radius-full` et `--radius-sm` n'existent pas.

### Props des composants (état actuel du code)

| Composant | Props requises | Props optionnelles |
|-----------|---------------|-------------------|
| `NoteCard` | `title: string`, `slug: string`, `date: Date`, `stage: 'seedling'\|'budding'\|'evergreen'` | `description?: string`, `tags?: string[]` |
| `StageBadge` | `stage: 'seedling'\|'budding'\|'evergreen'` | `size?: 'sm'\|'md'` (défaut: `'md'`) |
| `Tag` | `label: string` | `href?: string` (sans href → `<span>` static, avec href → `<a>` interactive) |
| `BacklinkList` | `backlinks: Array<{title: string, slug: string}>` | — |
| `NavLink` | `href: string`, `label: string`, `active: boolean` | — |

**Piège `NoteCard.date`** : la prop `date` est de type `Date` (objet JavaScript), PAS une string. Utiliser `new Date('2026-01-15')` ou `new Date()` dans le frontmatter.

**Piège `BacklinkList`** : le composant est **entièrement masqué** (`display: none` implicite via condition Astro) quand `backlinks.length === 0`. Pour le montrer dans le styleguide, passer au moins 1 backlink d'exemple.

### Détail interne de `StageBadge` : classes Tailwind pour les tailles

`StageBadge` utilise des classes utilitaires Tailwind pour les tailles (code issu de l'implémentation Epic 3) :

```astro
const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
```

Ces classes Tailwind (`text-xs`, `px-2`, `py-0.5`, `text-sm`, `px-3`, `py-1`) sont injectées via `class:list`. C'est un résidu de l'Epic 3 accepté. Le styleguide les affiche telles quelles — ne pas chercher à modifier `StageBadge` dans cette story.

### Implémentation de référence — code cible complet

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import NoteCard from '../components/NoteCard.astro';
import StageBadge from '../components/StageBadge.astro';
import Tag from '../components/Tag.astro';
import BacklinkList from '../components/BacklinkList.astro';
import NavLink from '../components/NavLink.astro';

// Données d'exemple pour les démos de composants
const demoNote = {
  title: 'Exemple de note avec un titre représentatif',
  slug: 'example-note',
  date: new Date('2026-03-01'),
  stage: 'budding' as const,
  description: 'Description facultative de la note, quelques mots.',
  tags: ['design', 'tokens'],
};

const demoBacklinks = [
  { title: 'Note qui mentionne celle-ci', slug: 'other-note' },
  { title: 'Une autre note liée', slug: 'another-linked-note' },
];
---

<PageLayout title="Styleguide" description="Documentation vivante des composants et tokens du design system.">

  <header class="sg-header">
    <h1 class="sg-header__title">Styleguide</h1>
    <p class="sg-header__desc">
      Documentation vivante des composants et tokens du design system de digitalgarden.
    </p>
  </header>

  <!-- ══════════════════════════════════════════
       SECTION TOKENS
       ══════════════════════════════════════════ -->
  <section class="sg-section">
    <h2 class="sg-section__title">Tokens</h2>

    <!-- ── Couleurs Accent ── -->
    <h3 class="sg-subsection__title">Couleurs — Accent</h3>
    <div class="sg-swatches">
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-50"></div>
        <span class="sg-swatch__label">--color-accent-50</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-100"></div>
        <span class="sg-swatch__label">--color-accent-100</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-200"></div>
        <span class="sg-swatch__label">--color-accent-200</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-500"></div>
        <span class="sg-swatch__label">--color-accent-500 (accent)</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-600"></div>
        <span class="sg-swatch__label">--color-accent-600 (accent-hover)</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-700"></div>
        <span class="sg-swatch__label">--color-accent-700</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--accent-900"></div>
        <span class="sg-swatch__label">--color-accent-900</span>
      </div>
    </div>

    <!-- ── Couleurs Interface ── -->
    <h3 class="sg-subsection__title">Couleurs — Interface</h3>
    <div class="sg-swatches">
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--surface"></div>
        <span class="sg-swatch__label">--color-surface</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--ink"></div>
        <span class="sg-swatch__label">--color-ink</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--ink-muted"></div>
        <span class="sg-swatch__label">--color-ink-muted</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--border"></div>
        <span class="sg-swatch__label">--color-border</span>
      </div>
    </div>

    <!-- ── Couleurs Stades ── -->
    <h3 class="sg-subsection__title">Couleurs — Stades de maturité</h3>
    <div class="sg-swatches">
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--seedling-bg"></div>
        <span class="sg-swatch__label">--color-seedling-bg</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--seedling-fg"></div>
        <span class="sg-swatch__label">--color-seedling-fg</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--budding-bg"></div>
        <span class="sg-swatch__label">--color-budding-bg</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--budding-fg"></div>
        <span class="sg-swatch__label">--color-budding-fg</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--evergreen-bg"></div>
        <span class="sg-swatch__label">--color-evergreen-bg</span>
      </div>
      <div class="sg-swatch">
        <div class="sg-swatch__color sg-swatch--evergreen-fg"></div>
        <span class="sg-swatch__label">--color-evergreen-fg</span>
      </div>
    </div>

    <!-- ── Espacement ── -->
    <h3 class="sg-subsection__title">Espacement</h3>
    <div class="sg-spacing">
      <div class="sg-space-row">
        <div class="sg-space-box sg-space--xs"></div>
        <span class="sg-token-label">--space-xs (4px)</span>
      </div>
      <div class="sg-space-row">
        <div class="sg-space-box sg-space--sm"></div>
        <span class="sg-token-label">--space-sm (8px)</span>
      </div>
      <div class="sg-space-row">
        <div class="sg-space-box sg-space--md"></div>
        <span class="sg-token-label">--space-md (16px)</span>
      </div>
      <div class="sg-space-row">
        <div class="sg-space-box sg-space--lg"></div>
        <span class="sg-token-label">--space-lg (24px)</span>
      </div>
      <div class="sg-space-row">
        <div class="sg-space-box sg-space--xl"></div>
        <span class="sg-token-label">--space-xl (40px)</span>
      </div>
      <div class="sg-space-row">
        <div class="sg-space-box sg-space--2xl"></div>
        <span class="sg-token-label">--space-2xl (64px)</span>
      </div>
    </div>

    <!-- ── Typographie ── -->
    <h3 class="sg-subsection__title">Typographie</h3>
    <div class="sg-type-scale">
      <div class="sg-type-row">
        <span class="sg-type--xs">Le jardin numérique pousse lentement.</span>
        <span class="sg-token-label">--text-xs (0.75rem)</span>
      </div>
      <div class="sg-type-row">
        <span class="sg-type--sm">Le jardin numérique pousse lentement.</span>
        <span class="sg-token-label">--text-sm (0.875rem)</span>
      </div>
      <div class="sg-type-row">
        <span class="sg-type--base">Le jardin numérique pousse lentement.</span>
        <span class="sg-token-label">--text-base (1rem)</span>
      </div>
      <div class="sg-type-row">
        <span class="sg-type--lg">Le jardin numérique pousse.</span>
        <span class="sg-token-label">--text-lg (1.125rem)</span>
      </div>
      <div class="sg-type-row">
        <span class="sg-type--xl">Le jardin pousse.</span>
        <span class="sg-token-label">--text-xl (1.25rem)</span>
      </div>
      <div class="sg-type-row">
        <span class="sg-type--2xl">Le jardin pousse.</span>
        <span class="sg-token-label">--text-2xl (1.5rem)</span>
      </div>
      <div class="sg-type-row">
        <span class="sg-type--3xl">Jardin.</span>
        <span class="sg-token-label">--text-3xl (2rem)</span>
      </div>
    </div>

    <!-- ── Rayons ── -->
    <h3 class="sg-subsection__title">Rayons de bordure</h3>
    <div class="sg-radii">
      <div class="sg-radius-item">
        <div class="sg-radius-box sg-radius--small"></div>
        <span class="sg-token-label">--radius-small (4px)</span>
      </div>
      <div class="sg-radius-item">
        <div class="sg-radius-box sg-radius--medium"></div>
        <span class="sg-token-label">--radius-medium (8px)</span>
      </div>
      <div class="sg-radius-item">
        <div class="sg-radius-box sg-radius--large"></div>
        <span class="sg-token-label">--radius-large (12px)</span>
      </div>
      <div class="sg-radius-item">
        <div class="sg-radius-box sg-radius--pill"></div>
        <span class="sg-token-label">--radius-pill (9999px)</span>
      </div>
    </div>

    <!-- ── Transitions ── -->
    <h3 class="sg-subsection__title">Transitions</h3>
    <div class="sg-tokens-list">
      <div class="sg-token-row">
        <span class="sg-token-name">--duration-fast</span>
        <span class="sg-token-value">150ms</span>
      </div>
      <div class="sg-token-row">
        <span class="sg-token-name">--duration-base</span>
        <span class="sg-token-value">200ms</span>
      </div>
    </div>

    <!-- ── Polices ── -->
    <h3 class="sg-subsection__title">Polices</h3>
    <div class="sg-tokens-list">
      <div class="sg-token-row">
        <span class="sg-font--serif">Lora — var(--font-serif)</span>
        <span class="sg-token-value">--font-serif</span>
      </div>
      <div class="sg-token-row">
        <span class="sg-font--sans">Inter — var(--font-sans)</span>
        <span class="sg-token-value">--font-sans</span>
      </div>
      <div class="sg-token-row">
        <span class="sg-font--mono">JetBrains Mono — var(--font-mono)</span>
        <span class="sg-token-value">--font-mono</span>
      </div>
    </div>
  </section>

  <!-- ══════════════════════════════════════════
       SECTION COMPOSANTS (Story 5.2)
       ══════════════════════════════════════════ -->
  <!-- Cette section sera ajoutée dans Story 5.2 -->

</PageLayout>

<style>
  /* ── En-tête page ── */
  .sg-header {
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-xl);
    border-bottom: 2px solid var(--color-border);
  }

  .sg-header__title {
    font-size: var(--text-3xl);
    margin: 0 0 var(--space-sm);
  }

  .sg-header__desc {
    color: var(--color-ink-muted);
    font-size: var(--text-base);
    margin: 0;
  }

  /* ── Section ── */
  .sg-section {
    margin-bottom: var(--space-2xl);
  }

  .sg-section__title {
    font-size: var(--text-2xl);
    font-weight: 600;
    margin: 0 0 var(--space-xl);
    padding-bottom: var(--space-sm);
    border-bottom: 1px solid var(--color-border);
  }

  .sg-subsection__title {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
    margin: var(--space-xl) 0 var(--space-md);
  }

  /* ── Swatches couleurs ── */
  .sg-swatches {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .sg-swatch {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
  }

  .sg-swatch__color {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-medium);
    border: 1px solid transparent;
  }

  .sg-swatch__label {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
    text-align: center;
    max-width: 80px;
    line-height: 1.3;
  }

  /* Palette accent */
  .sg-swatch--accent-50  { background: var(--color-accent-50);  border-color: var(--color-border); }
  .sg-swatch--accent-100 { background: var(--color-accent-100); }
  .sg-swatch--accent-200 { background: var(--color-accent-200); }
  .sg-swatch--accent-500 { background: var(--color-accent-500); }
  .sg-swatch--accent-600 { background: var(--color-accent-600); }
  .sg-swatch--accent-700 { background: var(--color-accent-700); }
  .sg-swatch--accent-900 { background: var(--color-accent-900); }

  /* Couleurs interface */
  .sg-swatch--surface   { background: var(--color-surface);    border-color: var(--color-border); }
  .sg-swatch--ink       { background: var(--color-ink); }
  .sg-swatch--ink-muted { background: var(--color-ink-muted); }
  .sg-swatch--border    { background: var(--color-border);     border-color: var(--color-ink-muted); }

  /* Couleurs stades */
  .sg-swatch--seedling-bg  { background: var(--color-seedling-bg);  border-color: var(--color-seedling-border); }
  .sg-swatch--seedling-fg  { background: var(--color-seedling-fg); }
  .sg-swatch--budding-bg   { background: var(--color-budding-bg);   border-color: var(--color-budding-border); }
  .sg-swatch--budding-fg   { background: var(--color-budding-fg); }
  .sg-swatch--evergreen-bg { background: var(--color-evergreen-bg); border-color: var(--color-evergreen-border); }
  .sg-swatch--evergreen-fg { background: var(--color-evergreen-fg); }

  /* ── Espacement ── */
  .sg-spacing {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .sg-space-row {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .sg-space-box {
    background: var(--color-accent-200);
    border-radius: var(--radius-small);
    flex-shrink: 0;
  }

  .sg-space--xs  { width: var(--space-xs);  height: var(--space-xs); }
  .sg-space--sm  { width: var(--space-sm);  height: var(--space-sm); }
  .sg-space--md  { width: var(--space-md);  height: var(--space-md); }
  .sg-space--lg  { width: var(--space-lg);  height: var(--space-lg); }
  .sg-space--xl  { width: var(--space-xl);  height: var(--space-xl); }
  .sg-space--2xl { width: var(--space-2xl); height: var(--space-2xl); }

  /* ── Typographie ── */
  .sg-type-scale {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .sg-type-row {
    display: flex;
    align-items: baseline;
    gap: var(--space-lg);
    flex-wrap: wrap;
  }

  .sg-type--xs   { font-size: var(--text-xs); }
  .sg-type--sm   { font-size: var(--text-sm); }
  .sg-type--base { font-size: var(--text-base); }
  .sg-type--lg   { font-size: var(--text-lg); }
  .sg-type--xl   { font-size: var(--text-xl); }
  .sg-type--2xl  { font-size: var(--text-2xl); }
  .sg-type--3xl  { font-size: var(--text-3xl); }

  /* ── Rayons ── */
  .sg-radii {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xl);
    align-items: flex-end;
  }

  .sg-radius-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
  }

  .sg-radius-box {
    width: 64px;
    height: 64px;
    background: var(--color-accent-100);
    border: 2px solid var(--color-accent-300, var(--color-accent-200));
  }

  .sg-radius--small  { border-radius: var(--radius-small); }
  .sg-radius--medium { border-radius: var(--radius-medium); }
  .sg-radius--large  { border-radius: var(--radius-large); }
  .sg-radius--pill   { border-radius: var(--radius-pill); }

  /* ── Transitions et tokens liste ── */
  .sg-tokens-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-medium);
    overflow: hidden;
  }

  .sg-token-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm) var(--space-md);
    border-bottom: 1px solid var(--color-border);
  }

  .sg-token-row:last-child {
    border-bottom: none;
  }

  .sg-token-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-accent-700);
  }

  .sg-token-value {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
  }

  .sg-token-label {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
  }

  /* ── Polices ── */
  .sg-font--serif { font-family: var(--font-serif); font-size: var(--text-lg); }
  .sg-font--sans  { font-family: var(--font-sans);  font-size: var(--text-lg); }
  .sg-font--mono  { font-family: var(--font-mono);  font-size: var(--text-base); }
</style>
```

### ⚠️ Note sur `--color-accent-300`

`global.css` ne définit pas `--color-accent-300`. La syntaxe `var(--color-accent-300, var(--color-accent-200))` dans `.sg-radius-box` utilise `--color-accent-200` comme fallback. Alternativement, utiliser directement `var(--color-accent-200)` pour la bordure des boîtes radius.

### Vérification du nombre de pages après build

Avant cette story : 6 pages (index, notes/index, 4 notes).
Après cette story : **7 pages** (+ `/styleguide`). Vérifier dans la sortie de `npm run build`.

### Ce que cette story ne fait PAS

- **Ne pas implémenter la section Composants** — c'est Story 5.2
- **Ne pas modifier les composants existants** — les importer et utiliser tels quels
- **Ne pas créer de nouvelle logique** — page statique uniquement
- **Ne pas modifier `global.css`** — déjà complet

### Références

- Epics → Story 5.1 AC : "palette couleur (swatches), échelle d'espacement, échelle typographique, rayons, transitions"
- Architecture → Règle 10 : "Styleguide = source de vérité"
- Architecture → Convention nommage pages : `kebab-case.astro`
- `src/styles/global.css` → noms réels des tokens
- Story 4.4 → Rappel `--radius-small/medium/large/pill` (pas `sm/md/lg/full`)

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

Création de `src/pages/styleguide.astro` avec la section Tokens complète :
- Imports : `PageLayout`, `NoteCard`, `StageBadge`, `Tag`, `BacklinkList`, `NavLink` + données d'exemple en frontmatter
- Section Couleurs : 7 swatches accent + 4 interface + 6 stades — toutes via classes scoped `.sg-swatch--*`
- Section Espacement : 6 boîtes dimensionnées par `var(--space-*)`, aucun style inline
- Section Typographie : 7 lignes de démonstration via classes `.sg-type--*`
- Section Rayons : 4 boîtes avec `.sg-radius--small/medium/large/pill`
- Section Transitions : tableau `.sg-tokens-list` avec `--duration-fast/base`
- Section Polices : 3 lignes serif/sans/mono
- Placeholder pour Story 5.2 (section Composants)
- `grep 'style="' styleguide.astro` → 0 résultat
- Build : 0 erreur, 7 pages générées (ajout de `/styleguide`)

### File List

- src/pages/styleguide.astro (créé)

## Change Log

- 2026-04-16 : Création de `src/pages/styleguide.astro` — page de documentation vivante avec section Tokens complète (couleurs, espacement, typographie, rayons, transitions, polices). Build : 0 erreur, 7 pages.
