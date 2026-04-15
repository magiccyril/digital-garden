# Story 3.3 : Composant NoteCard avec hover state

Status: review

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant que visiteur de digitalgarden,
je veux voir les notes sous forme de cartes cliquables avec leurs métadonnées,
afin de choisir quelle note lire depuis la homepage ou l'index.

## Acceptance Criteria

1. **Given** que `StageBadge.astro` et `Tag.astro` existent (Stories 3.1, 3.2)
   **When** je crée `src/components/NoteCard.astro`
   **Then** le composant accepte les props `title: string`, `slug: string`, `date: Date`, `stage: 'seedling'|'budding'|'evergreen'`, `description?: string`, `tags?: string[]`
   **And** il compose `StageBadge` pour afficher le stade et `Tag` (variante static — sans `href`) pour les tags
   **And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

2. **Given** que NoteCard est rendu
   **When** le visiteur survole la carte
   **Then** le titre transite vers `var(--color-accent)` en `var(--duration-fast)`
   **And** la carte applique `transform: translateY(-1px)` et un `box-shadow` léger — GPU only (pas de changement de layout)

3. **Given** que NoteCard est rendu
   **When** j'inspecte le HTML
   **Then** le lien englobant `<a>` contient un titre `<h2>` lisible par un lecteur d'écran

4. **Given** que NoteCard est créé
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur (0 erreur TypeScript, 0 erreur Astro)

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/components/NoteCard.astro` (AC: #1, #2, #3)
  - [x] Définir `interface Props` avec le type union pour `stage` (pas `string` brut — voir section tokens)
  - [x] Implémenter la structure HTML : `<a>` englobant → `<div>` flex → contenu + badge
  - [x] Ajouter `<h2>` pour le titre (lecteur d'écran) avec transition couleur via token
  - [x] Formater la date en `fr-FR` avec `toLocaleDateString`
  - [x] Composer `<StageBadge stage={stage} size="sm" />`
  - [x] Composer `<Tag label={tag} />` (variante static, sans `href`) pour chaque tag
  - [x] Implémenter `<style>` scoped : hover `translateY(-1px)` + `box-shadow` + couleur titre → `var(--color-accent)`
  - [x] Utiliser `will-change: transform` pour forcer l'accélération GPU

- [x] Tâche 2 : Valider le build (AC: #4)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

## Dev Notes

### Contexte critique — code existant à reproduire et adapter

**Pattern NoteCard dans `src/pages/notes/index.astro` (lignes 60-98) :**

```astro
<!-- Structure actuelle dans notes/index.astro — style inline à transformer en scoped -->
<a href={`/notes/${note.id}`} class="note-card">
  <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
    <div style="flex: 1; min-width: 0;">
      <h2 style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 400; margin: 0 0 0.35rem; color: var(--color-ink);">
        {note.data.title}
      </h2>
      {note.data.description && (
        <p style="font-size: 0.875rem; color: var(--color-ink-muted); margin: 0 0 0.6rem; line-height: 1.5;">
          {note.data.description}
        </p>
      )}
      <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center;">
        <time datetime={note.data.date.toISOString()} style="font-size: 0.8rem; color: var(--color-ink-muted);">
          {note.data.date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
        {note.data.tags.map((tag) => (
          <span style="font-size: 0.75rem; color: var(--color-ink-muted);">· #{tag}</span>
        ))}
      </div>
    </div>
    <div style="flex-shrink: 0; padding-top: 0.15rem;">
      <StageBadge stage={note.data.stage} size="sm" />
    </div>
  </div>
</a>
```

Hover actuel dans `notes/index.astro` :
```css
.note-card:hover h2 { color: var(--color-accent-600); }
```

**Pattern dans `src/pages/index.astro` (lignes 70-94) :**

```astro
<!-- Structure alternative dans index.astro — grid avec numéro -->
<a href={`/notes/${note.id}`} class="note-row" style="display: grid; grid-template-columns: auto 1fr auto; ...">
  <span style="font-size: 0.8rem; color: var(--color-ink-muted);">{String(i + 1).padStart(2, '0')}</span>
  <span>
    <span style="font-family: var(--font-serif); font-size: 1.1rem;">title</span>
    {description && <span style="font-size: 0.875rem; color: var(--color-ink-muted);">{description}</span>}
  </span>
  <StageBadge stage={note.data.stage} size="sm" />
</a>
```

Hover actuel dans `index.astro` :
```css
.note-row:hover span[style*="font-serif"] { color: var(--color-accent-600); }
```

**Point critique :** le composant NoteCard suivra le pattern de `notes/index.astro` (flex layout, title h2, description, meta date+tags, StageBadge). La hover **doit utiliser `var(--color-accent)`** (alias = `-500`), non `-600` — c'est le token sémantique correct per spec UX-DR5 et architecture.

### Implémentation de référence

```astro
---
import StageBadge from './StageBadge.astro';
import Tag from './Tag.astro';

interface Props {
  title: string;
  slug: string;
  date: Date;
  stage: 'seedling' | 'budding' | 'evergreen';
  description?: string;
  tags?: string[];
}

const { title, slug, date, stage, description, tags = [] } = Astro.props;
---

<a href={`/notes/${slug}`} class="note-card">
  <div class="note-card__body">
    <div class="note-card__content">
      <h2 class="note-card__title">{title}</h2>
      {description && (
        <p class="note-card__description">{description}</p>
      )}
      <div class="note-card__meta">
        <time datetime={date.toISOString()} class="note-card__date">
          {date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' })}
        </time>
        {tags.map((tag) => <Tag label={tag} />)}
      </div>
    </div>
    <div class="note-card__badge">
      <StageBadge stage={stage} size="sm" />
    </div>
  </div>
</a>

<style>
  .note-card {
    display: block;
    padding: var(--space-lg) 0;
    text-decoration: none;
    color: inherit;
    transition: transform var(--duration-fast) ease, box-shadow var(--duration-fast) ease;
    will-change: transform;
  }

  .note-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px oklch(18% 0.01 250 / 0.08);
  }

  .note-card:hover .note-card__title {
    color: var(--color-accent);
  }

  .note-card__body {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-md);
    flex-wrap: wrap;
  }

  .note-card__content {
    flex: 1;
    min-width: 0;
  }

  .note-card__title {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 400;
    margin: 0 0 var(--space-xs);
    color: var(--color-ink);
    transition: color var(--duration-fast) ease;
    line-height: 1.35;
  }

  .note-card__description {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
    margin: 0 0 var(--space-sm);
    line-height: 1.5;
  }

  .note-card__meta {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-xs);
    align-items: center;
  }

  .note-card__date {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
  }

  .note-card__badge {
    flex-shrink: 0;
    padding-top: 0.15rem;
  }
</style>
```

### Tokens disponibles — valeurs réelles dans `global.css`

> ⚠️ **PIÈGE CRITIQUE** : Les noms dans le doc d'architecture (`--radius-sm`, `--radius-full`) ont été renommés lors du code review Epic 1. Utiliser les noms réels ci-dessous.

| Token | Valeur réelle | Utilisation dans NoteCard |
|-------|--------------|--------------------------|
| `--space-xs` | 4px | gap meta, margin titre |
| `--space-sm` | 8px | margin description |
| `--space-md` | 16px | gap body flex |
| `--space-lg` | 24px | padding vertical carte |
| `--text-xs` | 0.75rem | date |
| `--text-sm` | 0.875rem | description |
| `--text-lg` | 1.125rem | titre h2 |
| `--font-serif` | Lora, Georgia... | titre h2 |
| `--color-ink` | oklch(18% 0.01 250) | titre couleur défaut |
| `--color-ink-muted` | oklch(50% 0.01 250) | date, description |
| `--color-accent` | var(--color-accent-500) | titre hover couleur |
| `--duration-fast` | 150ms | transitions |
| `--radius-pill` | 9999px | utilisé par Tag (déjà géré dans Tag.astro) |
| `--radius-small` | 4px | (non utilisé dans NoteCard) |

**Token box-shadow** : Pas de token shadow défini dans le projet. Valeur hardcodée acceptable avec justification : `0 4px 12px oklch(18% 0.01 250 / 0.08)` — utilise la même couleur `--color-ink` mais avec 8% d'opacité. Commentaire à ajouter dans le style.

### Décisions de design documentées

**`stage: 'seedling' | 'budding' | 'evergreen'` (pas `string`)**
StageBadge.astro requiert ce type union — utiliser `string` causerait une erreur TypeScript au build.

**`will-change: transform`**
Assure le rendu GPU de la transition `translateY(-1px)`. Conforme à la règle UX : "GPU only — pas de changement de layout" (width, height, padding, margin restent fixes).

**Transition sur `transform` ET `box-shadow`**
Les deux propriétés doivent transitionner ensemble en `var(--duration-fast)`. La transition `color` du titre est gérée séparément sur `.note-card__title`.

**`var(--color-accent)` au hover (pas `var(--color-accent-600)`)**
Le code existant dans `notes/index.astro` et `index.astro` utilise `-600`, mais c'est une valeur brute. Le composant NoteCard est une création propre — utiliser l'alias sémantique correct `var(--color-accent)` = `-500`. Conforme à UX-DR5.

**`size="sm"` pour StageBadge**
Cohérent avec l'usage existant dans les listes (index.astro et notes/index.astro utilisent tous deux `size="sm"` dans les listes de notes).

**Tags via `<Tag label={tag} />` (sans `href`)**
NoteCard affiche les tags en mode static (pas de navigation par tag depuis la carte). L'attribution href pour la navigation par tag est le rôle des pages qui intègrent NoteCard (Epic 4).

**Locale `fr-FR` pour la date**
Préserve le format existant de notes/index.astro : `{ year: 'numeric', month: 'short', day: 'numeric' }`.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `src/pages/index.astro`** → Epic 4, Story 4.2 (migration homepage)
- **Ne pas modifier `src/pages/notes/index.astro`** → Epic 4, Story 4.3 (migration index)
- **Ne pas modifier `NoteLayout.astro`** → Epic 4, Story 4.1
- NoteCard n'est pas encore utilisé dans les pages existantes — c'est intentionnel, le composant est créé pour être prêt à l'intégration en Epic 4
- Pas de responsive spécifique dans cette story (UX-DR13 "NoteCard méta sous le titre si nécessaire" est géré en Epic 4 lors de l'intégration dans les pages)

### Usage attendu en Epic 4 (contexte)

```astro
<!-- Dans pages/notes/index.astro (Story 4.3) -->
import NoteCard from '../../components/NoteCard.astro';

{sorted.map((note) => (
  <li class="note-item" data-stage={note.data.stage} data-tags={note.data.tags.join(',')}>
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

<!-- Dans pages/index.astro (Story 4.2) — variante sans numéro d'ordre -->
import NoteCard from '../components/NoteCard.astro';

{recentNotes.map((note) => (
  <li>
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
```

### Intelligence des stories précédentes (Epic 1–3)

- **`--radius-pill`** (renommé depuis `--radius-full` lors code review Epic 1) — utilisé par Tag.astro et StageBadge.astro
- **`--radius-small`** (renommé depuis `--radius-sm`) — 4px
- **`--radius-medium`** (renommé depuis `--radius-md`) — 8px
- **`class:list={[...]}`** (pas `className`) — syntaxe Astro obligatoire pour classes conditionnelles
- **`import type { CollectionEntry }`** pas d'import de valeur (Story 1.x, rule 4)
- **StageBadge** : props `stage` (union type) + `size` ('sm'|'md') — déjà migré vers tokens (Story 3.1)
- **Tag** : props `label: string`, `href?: string` — le `#` est ajouté par le composant (pas par le parent)
- **Build validation** : `npm run build` après chaque story — pattern établi Epic 1

### Structure des fichiers

```
src/
└── components/
    ├── NavLink.astro      ← existant (Story 2.1)
    ├── Header.astro       ← existant (Story 2.2)
    ├── Footer.astro       ← existant (Story 2.2)
    ├── StageBadge.astro   ← existant (Story 3.1, migré vers tokens)
    ├── Tag.astro          ← existant (Story 3.2)
    └── NoteCard.astro     ← NOUVEAU (cette story)
```

### Project Structure Notes

- `NoteCard.astro` dans `src/components/` (PascalCase, convention établie)
- Importe `StageBadge` et `Tag` depuis `./` (même dossier)
- Zéro dépendance sur des layouts ou pages
- Sera composé par les pages index.astro (Story 4.2) et notes/index.astro (Story 4.3)

### Validation

1. Inspection visuelle du code : `interface Props` complet, styles scoped, tokens partout sauf `box-shadow`
2. Vérifier que `stage` utilise bien le type union et non `string`
3. Vérifier que `Tag` reçoit bien `label={tag}` sans `href` (variante static)
4. `npm run build` → 0 erreur (composant importé mais non utilisé dans les pages existantes ne casse pas le build)

### Commandes

```bash
npm run build
```

### References

- Epics : Story 3.3 AC → [Source: epics.md — "Story 3.3 : Composant NoteCard avec hover state"]
- UX : UX-DR5 NoteCard hover → [Source: ux-design-specification.md — "Patterns d'interaction hover"]
- Architecture : Règle 2 (styles scoped), Règle 3 (class:list), Règle 6 (tokens) → [Source: architecture.md — "Patterns de composants Astro"]
- Code existant : notes/index.astro lignes 60-98 → pattern note-card de référence
- Code existant : index.astro lignes 70-94 → pattern note-row (variante grid avec numéro)
- Token renommage : `--radius-pill` → [Source: 1-3-tokens-rayons-transitions-et-aliases-couleur.md — "Dev Notes"]
- Tag usage : variante static → [Source: 3-2-composant-tag-variantes-interactive-static.md — "Usage attendu en Story 3.3"]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun — implémentation directe sans blocage.

### Completion Notes List

- Création de `src/components/NoteCard.astro` avec `interface Props` typée (union pour `stage`)
- Structure HTML : `<a>` englobant (accessible) → flex div → titre `<h2>` + description optionnelle + méta (date + tags) + badge
- Hover GPU-only : `will-change: transform`, `transition: transform + box-shadow var(--duration-fast)`, `translateY(-1px)` + shadow `oklch(18% 0.01 250 / 0.08)`
- Titre : `font-family: var(--font-serif)`, `font-size: var(--text-lg)`, `font-weight: 400`, transition `color → var(--color-accent)`
- Tags via `<Tag label={tag} />` sans `href` (variante static) — le composant ajoute le `#`
- Badge via `<StageBadge stage={stage} size="sm" />`
- Date formatée `fr-FR` : `{ year: 'numeric', month: 'short', day: 'numeric' }`
- Toutes valeurs CSS via tokens — seule exception documentée : `box-shadow` (pas de token shadow dans le projet)
- Build : 6 pages, 0 erreur TypeScript, 0 warning

### File List

- src/components/NoteCard.astro
