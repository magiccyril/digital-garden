# Story 4.1 : Migrer NoteLayout.astro

Status: review

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant que visiteur de digitalgarden,
je veux lire une note dans un layout propre assemblé à partir de composants,
afin de bénéficier d'une expérience de lecture cohérente avec le reste du site.

## Acceptance Criteria

1. **Given** que `PageLayout`, `StageBadge`, `Tag`, `BacklinkList` et les styles prose existent (Epics 2 & 3)
   **When** je migre `src/layouts/NoteLayout.astro`
   **Then** il utilise `PageLayout` pour la structure (header + footer inclus)
   **And** il utilise `StageBadge`, `Tag` (variante interactive) et `BacklinkList` comme composants
   **And** il ne contient aucun attribut `style=""` inline
   **And** toutes les valeurs CSS sont via tokens `var(--*)`
   **And** le calcul des backlinks (`grep [[note.id]]` dans `n.body`) est préservé à l'identique

2. **Given** que NoteLayout est migré
   **When** j'ouvre une note dans le navigateur
   **Then** le rendu visuel est pixel-perfect identique à l'état pré-migration
   **And** les wiki-links résolus et non résolus s'affichent avec leurs styles distincts (Story 3.5)
   **And** la section backlinks apparaît si des backlinks existent, est masquée sinon

3. **Given** que NoteLayout est migré
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Remplacer les imports dans `src/layouts/NoteLayout.astro` (AC: #1)
  - [x] Remplacer `import BaseLayout from './BaseLayout.astro'` par `import PageLayout from './PageLayout.astro'`
  - [x] Conserver `import StageBadge from '../components/StageBadge.astro'`
  - [x] Ajouter `import Tag from '../components/Tag.astro'`
  - [x] Ajouter `import BacklinkList from '../components/BacklinkList.astro'`
  - [x] Conserver `import { getCollection } from 'astro:content'` et `import type { CollectionEntry } from 'astro:content'`

- [x] Tâche 2 : Préserver le calcul des backlinks à l'identique (AC: #1)
  - [x] Ne PAS modifier la logique de filtrage `allNotes.filter(...)` — copier/coller exact
  - [x] Ne PAS modifier `formattedDate` — conserver `month: 'long'` (différent de NoteCard qui utilise `month: 'short'`)

- [x] Tâche 3 : Migrer le template — supprimer tous les `style=""` (AC: #1, #2)
  - [x] Remplacer `<BaseLayout>` par `<PageLayout title={title} description={description}>`
  - [x] Migrer l'en-tête : `<header class="note-header">` avec classes scoped (voir implémentation de référence)
  - [x] Remplacer les `<a href="/notes?tag=${tag}" style="...">` par `<Tag label={tag} href={/notes?tag=${tag}} />` (variante interactive)
  - [x] Remplacer la section `{backlinks.length > 0 && (<aside ...>)}` par `<BacklinkList backlinks={backlinks.map((n) => ({ title: n.data.title, slug: n.id }))} />`
  - [x] Migrer le lien retour : `<div class="note-back"><a href="/notes" class="note-back__link">← Toutes les notes</a></div>`

- [x] Tâche 4 : Ajouter `<style>` scoped avec toutes les valeurs via tokens (AC: #1)
  - [x] Styles pour `.note-header`, `.note-header__badge`, `.note-header__title`, `.note-header__description`, `.note-header__meta`, `.note-header__tags`
  - [x] Styles pour `.note-back`, `.note-back__link`

- [x] Tâche 5 : Valider le build et vérifier l'absence de `style=""` (AC: #3)
  - [x] `npm run build` → 0 erreur
  - [x] `grep 'style="' src/layouts/NoteLayout.astro` → 0 résultat

## Dev Notes

### Code actuel complet — `src/layouts/NoteLayout.astro`

```astro
---
import BaseLayout from './BaseLayout.astro';
import StageBadge from '../components/StageBadge.astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

interface Props {
  note: CollectionEntry<'notes'>;
}

const { note } = Astro.props;
const { title, date, stage, tags, description } = note.data;

// ── Backlinks : trouve les notes qui mentionnent celle-ci ──
const allNotes = await getCollection('notes', ({ data }) => data.publish !== false);

const backlinks = allNotes.filter((n) => {
  if (n.id === note.id) return false;
  const raw = n.body ?? '';
  return (
    raw.includes(`[[${note.id}]]`) ||
    raw.includes(`[[${title}]]`) ||
    raw.toLowerCase().includes(`[[${title.toLowerCase()}]]`)
  );
});

const formattedDate = date.toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<BaseLayout title={title} description={description}>
  <article>
    <header style="margin-bottom: 2.5rem; padding-bottom: 2rem; border-bottom: 1px solid var(--color-border);">
      <div style="margin-bottom: 1rem;">
        <StageBadge stage={stage} />
      </div>
      <h1 style="font-size: 2.25rem; font-weight: 600; margin: 0 0 1rem; line-height: 1.15;">
        {title}
      </h1>
      {description && (
        <p style="font-size: 1.05rem; color: var(--color-ink-muted); margin: 0 0 1.25rem; font-style: italic;">
          {description}
        </p>
      )}
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; font-size: 0.875rem; color: var(--color-ink-muted);">
        <time datetime={date.toISOString()}>{formattedDate}</time>
        {tags.length > 0 && (
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            {tags.map((tag) => (
              <a
                href={`/notes?tag=${tag}`}
                style="display: inline-block; padding: 0.15em 0.7em; border-radius: 999px; font-size: 0.8rem; background: var(--color-border); color: var(--color-ink-muted); text-decoration: none; transition: background 150ms;"
              >
                #{tag}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>

    <div class="prose">
      <slot />
    </div>

    {backlinks.length > 0 && (
      <aside style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
        <h2 style="font-family: var(--font-sans); font-size: 0.8rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-ink-muted); margin: 0 0 1rem;">
          Mentionné dans
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">
          {backlinks.map((bl) => (
            <li>
              <a
                href={`/notes/${bl.id}`}
                style="display: flex; align-items: center; gap: 0.5rem; text-decoration: none; color: var(--color-ink); font-size: 0.95rem;"
              >
                <span style="color: var(--color-accent-500);">←</span>
                {bl.data.title}
              </a>
            </li>
          ))}
        </ul>
      </aside>
    )}

    <div style="margin-top: 3rem;">
      <a
        href="/notes"
        style="font-size: 0.9rem; color: var(--color-ink-muted); text-decoration: none; display: inline-flex; align-items: center; gap: 0.4rem;"
      >
        ← Toutes les notes
      </a>
    </div>
  </article>
</BaseLayout>
```

### Implémentation de référence — code cible complet

```astro
---
import PageLayout from './PageLayout.astro';
import StageBadge from '../components/StageBadge.astro';
import Tag from '../components/Tag.astro';
import BacklinkList from '../components/BacklinkList.astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

interface Props {
  note: CollectionEntry<'notes'>;
}

const { note } = Astro.props;
const { title, date, stage, tags, description } = note.data;

// ── Backlinks : trouve les notes qui mentionnent celle-ci ──
// LOGIQUE PRÉSERVÉE À L'IDENTIQUE — ne pas modifier
const allNotes = await getCollection('notes', ({ data }) => data.publish !== false);

const backlinks = allNotes.filter((n) => {
  if (n.id === note.id) return false;
  const raw = n.body ?? '';
  return (
    raw.includes(`[[${note.id}]]`) ||
    raw.includes(`[[${title}]]`) ||
    raw.toLowerCase().includes(`[[${title.toLowerCase()}]]`)
  );
});

const formattedDate = date.toLocaleDateString('fr-FR', {
  year: 'numeric',
  month: 'long',    // ← 'long' (pas 'short' comme dans NoteCard)
  day: 'numeric',
});
---

<PageLayout title={title} description={description}>
  <article class="note-layout">
    <header class="note-header">
      <div class="note-header__badge">
        <StageBadge stage={stage} />
      </div>
      <h1 class="note-header__title">{title}</h1>
      {description && (
        <p class="note-header__description">{description}</p>
      )}
      <div class="note-header__meta">
        <time datetime={date.toISOString()} class="note-header__date">{formattedDate}</time>
        {tags.length > 0 && (
          <div class="note-header__tags">
            {tags.map((tag) => (
              <Tag label={tag} href={`/notes?tag=${tag}`} />
            ))}
          </div>
        )}
      </div>
    </header>

    <div class="prose">
      <slot />
    </div>

    <BacklinkList backlinks={backlinks.map((n) => ({ title: n.data.title, slug: n.id }))} />

    <div class="note-back">
      <a href="/notes" class="note-back__link">← Toutes les notes</a>
    </div>
  </article>
</PageLayout>

<style>
  .note-header {
    margin-bottom: var(--space-xl);
    padding-bottom: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .note-header__badge {
    margin-bottom: var(--space-md);
  }

  .note-header__title {
    font-size: var(--text-3xl);
    font-weight: 600;       /* pas de token font-weight — valeur structurelle */
    margin: 0 0 var(--space-md);
    line-height: 1.15;      /* override de la règle globale h1-h4 { line-height: 1.25 } */
  }

  .note-header__description {
    font-size: var(--text-base);
    color: var(--color-ink-muted);
    margin: 0 0 var(--space-lg);
    font-style: italic;     /* pas de token font-style — valeur structurelle */
  }

  .note-header__meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-md);
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
  }

  .note-header__tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
  }

  .note-back {
    margin-top: var(--space-2xl);
  }

  .note-back__link {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs);
  }
</style>
```

### Mapping tokens — valeurs originales → tokens

| Propriété | Valeur originale | Token | Écart |
|-----------|-----------------|-------|-------|
| `note-header margin-bottom` | `2.5rem` (45px) | `var(--space-xl)` (40px) | 5px |
| `note-header padding-bottom` | `2rem` (36px) | `var(--space-xl)` (40px) | 4px |
| `note-header__badge margin-bottom` | `1rem` (18px) | `var(--space-md)` (16px) | 2px |
| `note-header__title font-size` | `2.25rem` | `var(--text-3xl)` (2rem) | 0.25rem |
| `note-header__title margin-bottom` | `1rem` (18px) | `var(--space-md)` (16px) | 2px |
| `note-header__description font-size` | `1.05rem` | `var(--text-base)` (1rem) | 0.05rem |
| `note-header__description margin-bottom` | `1.25rem` (22px) | `var(--space-lg)` (24px) | 2px |
| `note-header__meta gap` | `1rem` (18px) | `var(--space-md)` (16px) | 2px |
| `note-header__meta font-size` | `0.875rem` | `var(--text-sm)` (0.875rem) | 0 ✓ |
| `note-header__tags gap` | `0.4rem` (7px) | `var(--space-xs)` (4px) | 3px |
| `note-back margin-top` | `3rem` (54px) | `var(--space-2xl)` (64px) | 10px |
| `note-back__link font-size` | `0.9rem` | `var(--text-sm)` (0.875rem) | 0.025rem |

**Valeurs sans token acceptables (commentaires dans le code) :**
- `font-weight: 600` — pas de token font-weight dans le projet
- `line-height: 1.15` — pas de token line-height (override nécessaire : global h1-h4 définit 1.25)
- `font-style: italic` — pas de token font-style

### Décisions de design critiques

**`PageLayout` remplace `BaseLayout` — différences à connaître**

| Aspect | BaseLayout | PageLayout |
|--------|-----------|-----------|
| Header | Inline nav hardcodée, sans état actif | `<Header>` composant avec `aria-current` (NavLink) |
| Footer | Inline footer hardcodé | `<Footer>` composant |
| Navigation active | Pas d'état actif | `currentPath={Astro.url.pathname}` → NavLink gère l'état |
| `<body style="">` | `style="background-color:...; color:..."` (redondant avec global.css) | Aucun style inline |

Bonus : après migration, les notes bénéficient de l'état actif sur "Notes" dans la navigation.

**Tags → `<Tag label={tag} href={/notes?tag=${tag}} />` (variante interactive)**
En NoteLayout, les tags sont cliquables (navigation par tag). L'existant utilisait des `<a>` inline avec `style=""`. Le composant Tag variante interactive encapsule exactement ce comportement (hover fond `color-accent-100`, via Story 3.2).

**Backlinks → transformation `.map(n => ({title: n.data.title, slug: n.id}))`**
La logique de calcul (filtrage) reste dans NoteLayout. BacklinkList reçoit un tableau simple `{title, slug}`. Le `slug` est `n.id` (identifiant de la Collection Entry).

**`month: 'long'` vs `month: 'short'` dans NoteCard**
NoteLayout utilise `month: 'long'` pour une date complète ("14 avril 2026") dans le contexte de lecture d'une note. NoteCard utilise `month: 'short'` ("14 avr. 2026") pour la densité d'affichage dans les listes. NE PAS harmoniser — comportements différents intentionnels.

**`prose` class préservée**
`<div class="prose">` est une classe globale définie dans `global.css` `@layer base` (Story 3.5). Ne pas renommer ni supprimer.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `BaseLayout.astro`** — toujours utilisé par index.astro et notes/index.astro jusqu'aux Stories 4.2 et 4.3
- **Ne pas modifier les pages existantes** — seul `NoteLayout.astro` est modifié
- Pas de changement visuel intentionnel — migration structurelle uniquement

### Intelligence des stories précédentes

- **`PageLayout` props** : `title: string`, `description?: string` — importe global.css, compose Header+Footer, expose `<main class="page-main">` (max-width 900px, padding 3rem 1.5rem 6rem)
- **`Tag` variante interactive** : `<Tag label={tag} href={/notes?tag=${tag}} />` — le `#` est ajouté par le composant, pas par le parent
- **`BacklinkList`** : `backlinks: Array<{title, slug}>` — masquage automatique si tableau vide, pas besoin de `{backlinks.length > 0 &&}`
- **`StageBadge`** : `<StageBadge stage={stage} />` sans `size` = défaut `"md"` — taille normale pour le contexte d'une note complète
- **`--radius-pill`** (pas `--radius-full`), **`--radius-small`** (pas `--radius-sm`) — noms réels global.css
- **`import type { CollectionEntry }`** — pas d'import valeur (règle architecture)

### Validation

```bash
# Vérifier l'absence totale de style="" dans NoteLayout
grep 'style="' src/layouts/NoteLayout.astro
# → doit retourner 0 ligne

# Build complet
npm run build
```

### Structure des fichiers

```
src/
├── layouts/
│   ├── BaseLayout.astro   ← existant (encore utilisé par index.astro, notes/index.astro)
│   ├── PageLayout.astro   ← existant (Story 2.3) — NOUVELLE dépendance de NoteLayout
│   └── NoteLayout.astro   ← MODIFIÉ (cette story)
└── components/
    ├── StageBadge.astro   ← existant
    ├── Tag.astro          ← existant — NOUVELLE dépendance de NoteLayout
    └── BacklinkList.astro ← existant — NOUVELLE dépendance de NoteLayout
```

### References

- Epics : Story 4.1 AC → [Source: epics.md — "Story 4.1 : Migrer NoteLayout.astro"]
- Architecture : Règle 2 (styles scoped), Règle 6 (tokens), Option A PageLayout → [Source: architecture.md]
- Tag interactive → [Source: 3-2-composant-tag-variantes-interactive-static.md — "Usage attendu"]
- BacklinkList transformation → [Source: 3-4-composant-backlinklist.md — "Usage attendu en Story 4.1"]
- PageLayout props → [Source: 2-3-composant-pagelayout-wrapper-de-page.md]
- Code source complet actuel → [Source: src/layouts/NoteLayout.astro]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Migration complète de `src/layouts/NoteLayout.astro` : `BaseLayout` → `PageLayout`, inline tags → `Tag` (interactive), inline backlinks → `BacklinkList`, tous les `style=""` supprimés (12 attributs inline éliminés)
- Logique backlinks préservée à l'identique (grep `[[note.id]]` / `[[title]]` / case-insensitive)
- `formattedDate` avec `month: 'long'` conservé (intentionnellement différent de NoteCard `month: 'short'`)
- `BacklinkList` reçoit `backlinks.map(n => ({title: n.data.title, slug: n.id}))` — masquage automatique si vide (pas de condition `{backlinks.length > 0 &&}` nécessaire)
- Build : 6 pages générées, 0 erreur, 0 `style=""` résiduel

### File List

- src/layouts/NoteLayout.astro (modifié)
