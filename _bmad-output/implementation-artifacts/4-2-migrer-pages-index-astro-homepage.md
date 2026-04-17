# Story 4.2 : Migrer pages/index.astro (homepage)

Status: done

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant que visiteur de digitalgarden,
je veux arriver sur la homepage et voir les notes récentes publiées avec leur mise en page familière,
afin de reprendre ma navigation là où je l'avais laissée.

## Acceptance Criteria

1. **Given** que `PageLayout` et `NoteCard` existent (Epics 2 & 3)
   **When** je migre `src/pages/index.astro`
   **Then** la page utilise `PageLayout` pour la structure
   **And** elle utilise `NoteCard` pour chaque note récente
   **And** le filtre `getCollection('notes', ({ data }) => data.publish !== false)` est préservé à l'identique
   **And** elle ne contient aucun attribut `style=""` inline
   **And** toutes les valeurs CSS sont via tokens dans `<style>` scoped

2. **Given** que la homepage est migrée
   **When** j'ouvre la homepage dans le navigateur
   **Then** le rendu visuel est visuellement cohérent avec l'état pré-migration
   **And** seules les notes avec `publish: true` sont affichées
   **And** les 5 notes les plus récentes apparaissent dans la section "Récemment planté"

3. **Given** que la homepage est migrée
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Remplacer les imports et le wrapper layout (AC: #1)
  - [x] Remplacer `import BaseLayout` par `import PageLayout from '../layouts/PageLayout.astro'`
  - [x] Remplacer `import StageBadge` par `import NoteCard from '../components/NoteCard.astro'`
  - [x] Remplacer `<BaseLayout title="Digital Garden">` par `<PageLayout title="Digital Garden">`
  - [x] Supprimer l'import de StageBadge (plus nécessaire — NoteCard le compose en interne)

- [x] Tâche 2 : Migrer la section Hero vers des classes scoped (AC: #1)
  - [x] Créer `.hero`, `.hero__label`, `.hero__title`, `.hero__intro`, `.hero__intro--lg`, `.hero__stats` avec tokens
  - [x] Créer `.stat-card`, `.stat-card__emoji`, `.stat-card__count`, `.stat-card__label` avec tokens
  - [x] Supprimer tous les `style=""` de la section hero

- [x] Tâche 3 : Remplacer les note-rows par NoteCard (AC: #1, #2)
  - [x] Créer `.section-label`, `.notes-list`, `.notes-list__item`, `.notes-more`, `.notes-more__link` avec tokens
  - [x] Remplacer le `<ol>` + `<a class="note-row">` par `<ul class="notes-list">` + `<NoteCard ...>` par item
  - [x] Passer les props à NoteCard : `title={note.data.title}`, `slug={note.id}`, `date={note.data.date}`, `stage={note.data.stage}`, `description={note.data.description}`, `tags={note.data.tags}`
  - [x] Migrer le lien "Voir toutes les notes" vers `.notes-more__link`

- [x] Tâche 4 : Valider et vérifier l'absence de `style=""` (AC: #3)
  - [x] `npm run build` → 0 erreur
  - [x] `grep 'style="' src/pages/index.astro` → 0 résultat

## Dev Notes

### Code actuel complet — `src/pages/index.astro`

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import StageBadge from '../components/StageBadge.astro';
import { getCollection } from 'astro:content';

const allNotes = await getCollection('notes', ({ data }) => data.publish !== false);
const recentNotes = allNotes
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 5);

const counts = {
  seedling: allNotes.filter((n) => n.data.stage === 'seedling').length,
  budding: allNotes.filter((n) => n.data.stage === 'budding').length,
  evergreen: allNotes.filter((n) => n.data.stage === 'evergreen').length,
};
---

<BaseLayout title="Digital Garden">
  <!-- ── Hero / Intro ── -->
  <!-- PERSONNALISE : remplace ce texte d'introduction par le tien -->
  <section style="padding-bottom: 4rem; border-bottom: 1px solid var(--color-border); margin-bottom: 4rem;">
    <p style="font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-accent-600); margin-bottom: 1.5rem;">
      Digital Garden
    </p>
    <h1 style="font-size: clamp(2rem, 5vw, 3.25rem); font-weight: 600; line-height: 1.15; margin: 0 0 1.75rem; max-width: 18ch;">
      <!-- PERSONNALISE : ta phrase d'accroche -->
      Un espace pour noter, partager et laisser pousser les idées.
    </h1>
    <p style="font-size: 1.1rem; color: var(--color-ink-muted); max-width: 55ch; line-height: 1.7; margin: 0 0 1rem;">
      <!-- PERSONNALISE : ton paragraphe d'intro -->
      Bienvenue. Ceci n'est pas un blog : c'est mon jardin numérique...
    </p>
    <p style="font-size: 1rem; color: var(--color-ink-muted); max-width: 55ch; line-height: 1.7; margin: 0;">
      Les notes marquées 🌱 sont fraîches et incomplètes...
    </p>
    <!-- Aperçu du jardin -->
    <div style="display: flex; gap: 1.5rem; margin-top: 2.5rem; flex-wrap: wrap;">
      <a href="/notes?stage=seedling" style="text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 0.25rem; padding: 1rem 1.5rem; border: 1px solid var(--color-border); border-radius: 12px; min-width: 90px; transition: border-color 200ms;">
        <span style="font-size: 1.75rem;">🌱</span>
        <span style="font-size: 1.25rem; font-weight: 600; color: var(--color-ink);">{counts.seedling}</span>
        <span style="font-size: 0.75rem; color: var(--color-ink-muted);">graine{counts.seedling > 1 ? 's' : ''}</span>
      </a>
      <!-- ... idem pour budding et evergreen -->
    </div>
  </section>

  <!-- ── Notes récentes ── -->
  <section>
    <h2 style="font-family: var(--font-sans); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-ink-muted); margin: 0 0 2rem;">
      Récemment planté
    </h2>
    <ol style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0;">
      {recentNotes.map((note, i) => (
        <li>
          <a href={`/notes/${note.id}`} style="display: grid; grid-template-columns: auto 1fr auto; ..." class="note-row">
            <span style="...">{String(i + 1).padStart(2, '0')}</span>
            <span>
              <span style="font-family: var(--font-serif); ...">{note.data.title}</span>
              {note.data.description && <span style="...">{note.data.description}</span>}
            </span>
            <StageBadge stage={note.data.stage} size="sm" />
          </a>
        </li>
      ))}
    </ol>
    <div style="margin-top: 2.5rem;">
      <a href="/notes" style="font-size: 0.9rem; color: var(--color-accent-600); ...">
        Voir toutes les notes →
      </a>
    </div>
  </section>
</BaseLayout>

<style>
  .note-row:hover span[style*="font-serif"] {
    color: var(--color-accent-600);
  }
</style>
```

### Implémentation de référence — code cible complet

```astro
---
import PageLayout from '../layouts/PageLayout.astro';
import NoteCard from '../components/NoteCard.astro';
import { getCollection } from 'astro:content';

// Filtre PRÉSERVÉ À L'IDENTIQUE
const allNotes = await getCollection('notes', ({ data }) => data.publish !== false);
const recentNotes = allNotes
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 5);

const counts = {
  seedling: allNotes.filter((n) => n.data.stage === 'seedling').length,
  budding: allNotes.filter((n) => n.data.stage === 'budding').length,
  evergreen: allNotes.filter((n) => n.data.stage === 'evergreen').length,
};
---

<PageLayout title="Digital Garden">
  <!-- ── Hero / Intro ── -->
  <!-- PERSONNALISE : remplace ce texte d'introduction par le tien -->
  <section class="hero">
    <p class="hero__label">Digital Garden</p>

    <h1 class="hero__title">
      <!-- PERSONNALISE : ta phrase d'accroche -->
      Un espace pour noter, partager et laisser pousser les idées.
    </h1>

    <p class="hero__intro hero__intro--lg">
      <!-- PERSONNALISE : ton paragraphe d'intro -->
      Bienvenue. Ceci n'est pas un blog : c'est mon jardin numérique. Un espace où les notes évoluent lentement, en public, du brouillon à la maturité.
    </p>

    <p class="hero__intro">
      Les notes marquées 🌱 sont fraîches et incomplètes : c'est le point de départ qui demande à être arrosé. Les 🌿 sont en développement.
      Les 🌳 sont solides, durables et interconnectées. Mais un jardin n'est jamais vraiment terminé.
    </p>

    <!-- Aperçu du jardin -->
    <div class="hero__stats">
      <a href="/notes?stage=seedling" class="stat-card">
        <span class="stat-card__emoji">🌱</span>
        <span class="stat-card__count">{counts.seedling}</span>
        <span class="stat-card__label">graine{counts.seedling > 1 ? 's' : ''}</span>
      </a>
      <a href="/notes?stage=budding" class="stat-card">
        <span class="stat-card__emoji">🌿</span>
        <span class="stat-card__count">{counts.budding}</span>
        <span class="stat-card__label">pousse{counts.budding > 1 ? 's' : ''}</span>
      </a>
      <a href="/notes?stage=evergreen" class="stat-card">
        <span class="stat-card__emoji">🌳</span>
        <span class="stat-card__count">{counts.evergreen}</span>
        <span class="stat-card__label">arbre{counts.evergreen > 1 ? 's' : ''}</span>
      </a>
    </div>
  </section>

  <!-- ── Notes récentes ── -->
  <section>
    <h2 class="section-label">Récemment planté</h2>

    <ul class="notes-list">
      {recentNotes.map((note) => (
        <li class="notes-list__item">
          <NoteCard
            title={note.data.title}
            slug={note.id}
            date={note.data.date}
            stage={note.data.stage}
            description={note.data.description}
            tags={note.data.tags}
          />
        </li>
      ))}
    </ul>

    <div class="notes-more">
      <a href="/notes" class="notes-more__link">Voir toutes les notes →</a>
    </div>
  </section>
</PageLayout>

<style>
  /* ── Hero ── */
  .hero {
    padding-bottom: var(--space-2xl);
    border-bottom: 1px solid var(--color-border);
    margin-bottom: var(--space-2xl);
  }

  .hero__label {
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;    /* pas de token letter-spacing */
    text-transform: uppercase; /* pas de token text-transform */
    color: var(--color-accent-600);
    margin-bottom: var(--space-lg);
  }

  .hero__title {
    /* clamp : valeur dynamique viewport — pas de token direct */
    font-size: clamp(2rem, 5vw, 3.25rem);
    font-weight: 600;          /* pas de token font-weight */
    line-height: 1.15;         /* override de la règle globale h1-h4 { line-height: 1.25 } */
    margin: 0 0 var(--space-xl);
    max-width: 18ch;           /* pas de token pour ch-units */
  }

  .hero__intro {
    font-size: var(--text-base);
    color: var(--color-ink-muted);
    max-width: 55ch;
    line-height: 1.7;          /* pas de token line-height */
    margin: 0 0 var(--space-md);
  }

  .hero__intro--lg {
    font-size: var(--text-lg);  /* approxime 1.1rem */
  }

  /* Cartes stats (seedling / budding / evergreen) */
  .hero__stats {
    display: flex;
    gap: var(--space-lg);
    margin-top: var(--space-xl);
    flex-wrap: wrap;
  }

  .stat-card {
    text-decoration: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-md) var(--space-lg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-large);
    min-width: 90px;            /* pas de token min-width */
    transition: border-color var(--duration-base);
  }

  .stat-card__emoji {
    font-size: 1.75rem;         /* entre --text-2xl (1.5rem) et --text-3xl (2rem) — pas de token exact */
  }

  .stat-card__count {
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--color-ink);
  }

  .stat-card__label {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
  }

  /* ── Section label (heading uppercase muted) ── */
  .section-label {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-ink-muted);
    margin: 0 0 var(--space-xl);
  }

  /* ── Liste notes récentes ── */
  .notes-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .notes-list__item {
    border-bottom: 1px solid var(--color-border);
  }

  /* ── Lien "Voir toutes les notes" ── */
  .notes-more {
    margin-top: var(--space-xl);
  }

  .notes-more__link {
    font-size: var(--text-sm);
    color: var(--color-accent-600);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
    font-weight: 500;
  }
</style>
```

### Mapping tokens — valeurs originales → tokens

| Propriété | Valeur originale | Token | Écart |
|-----------|-----------------|-------|-------|
| `hero padding-bottom` | `4rem` (72px) | `var(--space-2xl)` (64px) | 8px |
| `hero margin-bottom` | `4rem` (72px) | `var(--space-2xl)` (64px) | 8px |
| `hero__label font-size` | `0.8rem` | `var(--text-xs)` (0.75rem) | ~1px |
| `hero__label margin-bottom` | `1.5rem` (27px) | `var(--space-lg)` (24px) | 3px |
| `hero__title margin` | `1.75rem` (31.5px) | `var(--space-xl)` (40px) | 8.5px |
| `hero__intro--lg font-size` | `1.1rem` | `var(--text-lg)` (1.125rem) | ~0.5px |
| `hero__intro font-size` | `1rem` | `var(--text-base)` (1rem) | 0 ✓ |
| `hero__intro margin` | `1rem` (18px) | `var(--space-md)` (16px) | 2px |
| `hero__stats gap` | `1.5rem` (27px) | `var(--space-lg)` (24px) | 3px |
| `hero__stats margin-top` | `2.5rem` (45px) | `var(--space-xl)` (40px) | 5px |
| `stat-card padding` | `1rem 1.5rem` (18/27px) | `var(--space-md) var(--space-lg)` (16/24px) | 2/3px |
| `stat-card border-radius` | `12px` | `var(--radius-large)` (12px) | 0 ✓ |
| `stat-card gap` | `0.25rem` (4.5px) | `var(--space-xs)` (4px) | 0.5px |
| `stat-card transition` | `border-color 200ms` | `border-color var(--duration-base)` | 0 ✓ |
| `stat-card__count font-size` | `1.25rem` | `var(--text-xl)` (1.25rem) | 0 ✓ |
| `stat-card__label font-size` | `0.75rem` | `var(--text-xs)` (0.75rem) | 0 ✓ |
| `section-label margin` | `2rem` (36px) | `var(--space-xl)` (40px) | 4px |
| `notes-more margin-top` | `2.5rem` (45px) | `var(--space-xl)` (40px) | 5px |
| `notes-more__link font-size` | `0.9rem` | `var(--text-sm)` (0.875rem) | ~0.5px |
| `notes-more__link gap` | `0.4rem` (7px) | `var(--space-xs)` (4px) | 3px |

**Valeurs sans token acceptable (commentaires dans le code) :**
- `font-size: clamp(2rem, 5vw, 3.25rem)` — valeur dynamique viewport responsive, pas de token
- `font-size: 1.75rem` — entre `--text-2xl` (1.5rem) et `--text-3xl` (2rem) — pas de token exact
- `font-weight: 600` et `font-weight: 500` — pas de token font-weight
- `line-height: 1.15` et `line-height: 1.7` — pas de token line-height
- `max-width: 18ch` et `max-width: 55ch` — pas de token pour ch-units
- `min-width: 90px` — pas de token min-width
- `letter-spacing: 0.1em` et `text-transform: uppercase` — pas de token pour ces propriétés

### Changements visuels attendus (et intentionnels)

> ⚠️ La migration introduit un changement visuel inévitable : les notes récentes passent d'une liste numérotée à des **NoteCard** avec titre, description optionnelle, **date et tags visibles**.

| Aspect | Avant (note-row) | Après (NoteCard) |
|--------|-----------------|-----------------|
| Numéro d'ordre (01, 02...) | ✓ affiché | ✗ supprimé |
| Titre | ✓ serif | ✓ serif (via NoteCard) |
| Description | ✓ optionnelle | ✓ optionnelle (via NoteCard) |
| Date | ✗ non affichée | ✓ visible (NoteCard ajoute la date) |
| Tags | ✗ non affichés | ✓ visibles (NoteCard ajoute les tags) |
| StageBadge | ✓ size="sm" | ✓ size="sm" (via NoteCard) |
| Hover | titre → `color-accent-600` | titre → `var(--color-accent)` + `translateY(-1px)` + shadow |
| Layout | `grid` (3 colonnes) | `flex` (contenu + badge) |

Ces changements sont **conformes aux specs** : l'AC impose d'utiliser NoteCard. L'affichage est plus riche qu'avant.

### Décisions de design critiques

**`<ol>` → `<ul>`**
L'original utilisait `<ol>` avec des numéros générés en CSS/JS. Puisque NoteCard ne montre plus de numéro, on utilise `<ul>` (sémantiquement non ordonné).

**`note.id` comme slug**
`note.id` est l'identifiant de la Content Collection Entry — c'est le slug de l'URL. Pattern établi dans NoteCard (Story 3.3) et BacklinkList (Story 3.4).

**`note.data.description` sans `|| undefined`**
Le type Zod de `description` est déjà `string | undefined`. Passer directement `description={note.data.description}` est correct, NoteCard gère le cas `undefined`.

**`note.data.tags` direct**
Le type Zod de `tags` est `string[]` avec défaut `[]`. Passer `tags={note.data.tags}` est direct.

**StageBadge supprimé des imports**
NoteCard importe et compose StageBadge en interne. La page ne doit plus importer StageBadge directement.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `src/layouts/BaseLayout.astro`** — toujours utilisé par `notes/index.astro` jusqu'à Story 4.3
- **Ne pas modifier les autres pages**
- Pas de suppression de BaseLayout — c'est Story 4.4

### Intelligence des stories précédentes

- **`PageLayout` props** : `title: string`, `description?: string` — wrapper HTML complet avec Header+Footer
- **NoteCard props** : `title`, `slug`, `date`, `stage` (requis) + `description?`, `tags?` (optionnels) — voir Story 3.3
- **`--radius-large`** (pas `--radius-lg`) — nom réel dans global.css après code review Epic 1
- **`--duration-base`** = 200ms — token de transition normale (plus longue que `--duration-fast`)
- **`import type { CollectionEntry }`** si nécessaire (pas d'import valeur) — règle architecture

### Validation

```bash
# Vérifier l'absence totale de style="" dans index.astro
grep 'style="' src/pages/index.astro
# → doit retourner 0 ligne

# Build complet
npm run build
```

### Structure des fichiers

```
src/
└── pages/
    └── index.astro   ← MODIFIÉ (cette story)
```

### References

- Epics : Story 4.2 AC → [Source: epics.md — "Story 4.2 : Migrer pages/index.astro"]
- NoteCard : props et comportement → [Source: 4-1-migrer-notelayout-astro.md, 3-3-composant-notecard-avec-hover-state.md]
- Code source actuel → [Source: src/pages/index.astro]
- PageLayout → [Source: 2-3-composant-pagelayout-wrapper-de-page.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Migration complète de `src/pages/index.astro` : `BaseLayout` → `PageLayout`, `StageBadge` supprimé (composé dans NoteCard), `<ol>` numéroté → `<ul class="notes-list">` avec `<NoteCard>` par item
- Hero : 10 attributs `style=""` → classes scoped (`.hero`, `.hero__label`, `.hero__title`, `.hero__intro`, `.hero__intro--lg`, `.hero__stats`, `.stat-card*`)
- Notes récentes : 3 attributs `style=""` + `.note-row:hover` CSS → classes scoped (`.section-label`, `.notes-list`, `.notes-list__item`, `.notes-more`, `.notes-more__link`)
- Filtre `getCollection` préservé à l'identique ; tri + `.slice(0,5)` inchangés
- Changement visuel attendu : les notes affichent maintenant date + tags (NoteCard plus riche que l'ancienne note-row numérotée)
- Build : 6 pages, 0 erreur, 0 `style=""` résiduel

### File List

- src/pages/index.astro (modifié)

### Review Findings

- [ ] [Review][Decision] Tri et date affichés par `update` au lieu de `date` — Sort et prop `date={note.data.update}` passés à NoteCard utilisent `update` au lieu de `date` (spec). Titre "Récemment cultivé" cohérent avec ce choix. Intentionnel ? À valider. [index.astro:9,68]
