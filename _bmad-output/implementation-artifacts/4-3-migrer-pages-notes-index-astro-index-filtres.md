# Story 4.3 : Migrer pages/notes/index.astro (index + filtres)

Status: ready-for-dev

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant que visiteur de digitalgarden,
je veux parcourir l'index complet des notes avec les filtres par stage et tag,
afin de trouver rapidement les notes qui m'intéressent.

## Acceptance Criteria

1. **Given** que `PageLayout`, `NoteCard`, `Tag` et `StageBadge` existent (Epics 2 & 3)
   **When** je migre `src/pages/notes/index.astro`
   **Then** la page utilise `PageLayout` pour la structure et `NoteCard` pour chaque note
   **And** les filtres stage + tag sont toujours visibles (pas de dropdown caché)
   **And** le comportement JS existant (`history.replaceState`, `(window as any).fn`) est préservé à l'identique
   **And** l'état vide affiche "Aucune note pour ce filtre." en `var(--color-ink-muted)`, `var(--text-sm)`, centré
   **And** elle ne contient aucun attribut `style=""` inline hors cas dynamiques documentés

2. **Given** que l'index est migré
   **When** j'ouvre `/notes` dans le navigateur
   **Then** le rendu visuel est visuellement cohérent avec l'état pré-migration
   **And** les filtres stage + tag fonctionnent correctement (affichage/masquage des notes)
   **And** les query params `?stage=` et `?tag=` sont lus au chargement et activent le bon filtre

3. **Given** que l'index est migré
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

4. **Given** que l'index est migré sur mobile (< 768px)
   **When** j'inspecte la mise en page
   **Then** le padding horizontal est `var(--space-md)` (réduit vs desktop)
   **And** les filtres permettent le scroll horizontal si nécessaire

## Tasks / Subtasks

- [ ] Tâche 1 : Remplacer les imports et le wrapper layout (AC: #1)
  - [ ] Remplacer `import BaseLayout` par `import PageLayout from '../../layouts/PageLayout.astro'`
  - [ ] Remplacer `import StageBadge` par `import NoteCard from '../../components/NoteCard.astro'`
  - [ ] Remplacer `<BaseLayout title="Notes" description="...">` par `<PageLayout title="Notes" description="...">`

- [ ] Tâche 2 : Migrer les inline `style=""` du template vers des classes scoped (AC: #1)
  - [ ] Créer `.notes-header`, `.notes-header__title`, `.notes-header__count`
  - [ ] Créer `.filters`, `.filters__group`, `.filters__label`
  - [ ] Créer `.notes-count`, `.notes-list`, `.empty-msg` (voir note sur `empty-msg` ci-dessous)
  - [ ] Tokeniser `.filter-btn` existant (border-radius, font-size, transition)
  - [ ] Supprimer `.note-card` et `.note-card:hover h2` (NoteCard gère son propre hover)

- [ ] Tâche 3 : Remplacer le rendu inline des notes par NoteCard (AC: #1, #2)
  - [ ] Garder `<li class="note-item" data-stage data-tags>` (requis par le JS)
  - [ ] Remplacer le contenu inline `<a class="note-card">` par `<NoteCard ...>`
  - [ ] Passer les 6 props : `title`, `slug={note.id}`, `date`, `stage`, `description`, `tags`

- [ ] Tâche 4 : Préserver le bloc `<script>` à l'identique (AC: #1, #2)
  - [ ] Ne PAS modifier le code JS — copier/coller identiquement
  - [ ] Vérifier que `(window as any).filterStage = filterStage` et `(window as any).filterTag = filterTag` sont présents

- [ ] Tâche 5 : Valider et vérifier (AC: #3)
  - [ ] `npm run build` → 0 erreur
  - [ ] `grep 'style="' src/pages/notes/index.astro` → 1 seul résultat (le `style="display:none"` justifié sur `#empty-msg`)

## Dev Notes

### Code actuel complet — `src/pages/notes/index.astro`

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import StageBadge from '../../components/StageBadge.astro';
import { getCollection } from 'astro:content';

const allNotes = await getCollection('notes', ({ data }) => data.publish !== false);
const sorted = allNotes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
const allTags = [...new Set(sorted.flatMap((n) => n.data.tags))].sort();
---

<BaseLayout title="Notes" description="Index de toutes les notes du garden.">
  <header style="margin-bottom: 3rem;">
    <h1 style="font-size: 2rem; margin: 0 0 0.5rem;">Notes</h1>
    <p style="color: var(--color-ink-muted); margin: 0;">
      {allNotes.length} note{allNotes.length > 1 ? 's' : ''} dans le jardin
    </p>
  </header>

  <div style="margin-bottom: 2.5rem; display: flex; flex-direction: column; gap: 1rem;">
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center;">
      <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-ink-muted); letter-spacing: 0.05em; text-transform: uppercase; margin-right: 0.5rem;">
        Stade
      </span>
      <button class="filter-btn stage-btn active" data-stage="" onclick="filterStage('')">Tous</button>
      <button class="filter-btn stage-btn" data-stage="seedling" onclick="filterStage('seedling')">🌱 Graines</button>
      <button class="filter-btn stage-btn" data-stage="budding" onclick="filterStage('budding')">🌿 Pousses</button>
      <button class="filter-btn stage-btn" data-stage="evergreen" onclick="filterStage('evergreen')">🌳 Arbres</button>
    </div>

    {allTags.length > 0 && (
      <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;">
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--color-ink-muted); letter-spacing: 0.05em; text-transform: uppercase; margin-right: 0.5rem;">
          Tags
        </span>
        <button class="filter-btn tag-btn active" data-tag="" onclick="filterTag('')">Tous</button>
        {allTags.map((tag) => (
          <button class="filter-btn tag-btn" data-tag={tag} onclick={`filterTag('${tag}')`}>
            #{tag}
          </button>
        ))}
      </div>
    )}
  </div>

  <div id="notes-count" style="font-size: 0.85rem; color: var(--color-ink-muted); margin-bottom: 1.25rem;"></div>

  <ul id="notes-list" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0;">
    {sorted.map((note) => (
      <li class="note-item" data-stage={note.data.stage} data-tags={note.data.tags.join(',')}>
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
      </li>
    ))}
  </ul>

  <p id="empty-msg" style="display: none; color: var(--color-ink-muted); font-style: italic; margin-top: 2rem;">
    Aucune note ne correspond à ces filtres.
  </p>
</BaseLayout>

<style>
  .filter-btn {
    display: inline-block;
    padding: 0.3em 0.85em;
    border-radius: 999px;
    font-size: 0.8rem;
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-ink-muted);
    cursor: pointer;
    transition: all 150ms;
    font-family: var(--font-sans);
  }

  .filter-btn:hover,
  .filter-btn.active {
    border-color: var(--color-accent-500);
    background: var(--color-accent-50);
    color: var(--color-accent-700);
  }

  .note-item {
    border-bottom: 1px solid var(--color-border);
  }

  .note-card {
    display: block;
    padding: 1.25rem 0;
    text-decoration: none;
    color: inherit;
    transition: background 150ms;
  }

  .note-card:hover h2 {
    color: var(--color-accent-600);
  }
</style>

<script>
  let currentStage = '';
  let currentTag = '';

  const params = new URLSearchParams(window.location.search);
  if (params.get('stage')) { currentStage = params.get('stage')!; activateStageBtn(currentStage); }
  if (params.get('tag'))   { currentTag   = params.get('tag')!;   activateTagBtn(currentTag); }
  applyFilters();

  function filterStage(stage: string) {
    currentStage = stage;
    activateStageBtn(stage);
    applyFilters();
    updateURL();
  }

  function filterTag(tag: string) {
    currentTag = tag;
    activateTagBtn(tag);
    applyFilters();
    updateURL();
  }

  function activateStageBtn(stage: string) {
    document.querySelectorAll<HTMLButtonElement>('.stage-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.stage === stage);
    });
  }

  function activateTagBtn(tag: string) {
    document.querySelectorAll<HTMLButtonElement>('.tag-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });
  }

  function applyFilters() {
    const items = document.querySelectorAll<HTMLLIElement>('.note-item');
    let visible = 0;

    items.forEach((item) => {
      const stageMatch = !currentStage || item.dataset.stage === currentStage;
      const tags = (item.dataset.tags ?? '').split(',').filter(Boolean);
      const tagMatch = !currentTag || tags.includes(currentTag);
      const show = stageMatch && tagMatch;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const countEl = document.getElementById('notes-count');
    if (countEl) {
      countEl.textContent = visible === items.length
        ? ''
        : `${visible} résultat${visible > 1 ? 's' : ''}`;
    }

    const emptyMsg = document.getElementById('empty-msg');
    if (emptyMsg) emptyMsg.style.display = visible === 0 ? '' : 'none';
  }

  function updateURL() {
    const p = new URLSearchParams();
    if (currentStage) p.set('stage', currentStage);
    if (currentTag)   p.set('tag',   currentTag);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }

  (window as any).filterStage = filterStage;
  (window as any).filterTag   = filterTag;
</script>
```

### ⚠️ Piège critique : `style="display: none"` sur `#empty-msg`

Le JS gère la visibilité de `#empty-msg` via `element.style.display`:
```javascript
if (emptyMsg) emptyMsg.style.display = visible === 0 ? '' : 'none';
```

Quand JS met `style.display = ''`, l'élément retrouve le style CSS. Si `display: none` est dans la classe CSS, le message resterait caché même quand visible === 0. **La seule façon correcte de gérer ce cas sans modifier le JS est de garder `style="display:none"` dans le HTML.**

**→ Conserver `style="display:none"` sur l'élément `#empty-msg` et documenter comme cas dynamique justifié.**

Ce `style=""` est l'unique exception tolérée dans cette story. La Story 4.4 (audit) le documentera explicitement. Le grep de validation en Tâche 5 attend exactement **1 résultat** (ce `style="display:none"`).

### Implémentation de référence — code cible complet

```astro
---
import PageLayout from '../../layouts/PageLayout.astro';
import NoteCard from '../../components/NoteCard.astro';
import { getCollection } from 'astro:content';

const allNotes = await getCollection('notes', ({ data }) => data.publish !== false);

// Trie par date décroissante
const sorted = allNotes.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

// Collecte tous les tags uniques
const allTags = [...new Set(sorted.flatMap((n) => n.data.tags))].sort();
---

<PageLayout title="Notes" description="Index de toutes les notes du garden.">
  <header class="notes-header">
    <h1 class="notes-header__title">Notes</h1>
    <p class="notes-header__count">
      {allNotes.length} note{allNotes.length > 1 ? 's' : ''} dans le jardin
    </p>
  </header>

  <!-- ── Filtres ── -->
  <div class="filters">

    <!-- Filtre par stage -->
    <div class="filters__group">
      <span class="filters__label">Stade</span>
      <button class="filter-btn stage-btn active" data-stage="" onclick="filterStage('')">Tous</button>
      <button class="filter-btn stage-btn" data-stage="seedling" onclick="filterStage('seedling')">🌱 Graines</button>
      <button class="filter-btn stage-btn" data-stage="budding" onclick="filterStage('budding')">🌿 Pousses</button>
      <button class="filter-btn stage-btn" data-stage="evergreen" onclick="filterStage('evergreen')">🌳 Arbres</button>
    </div>

    <!-- Filtre par tag -->
    {allTags.length > 0 && (
      <div class="filters__group">
        <span class="filters__label">Tags</span>
        <button class="filter-btn tag-btn active" data-tag="" onclick="filterTag('')">Tous</button>
        {allTags.map((tag) => (
          <button class="filter-btn tag-btn" data-tag={tag} onclick={`filterTag('${tag}')`}>
            #{tag}
          </button>
        ))}
      </div>
    )}
  </div>

  <!-- ── Liste des notes ── -->
  <div id="notes-count" class="notes-count"></div>

  <ul id="notes-list" class="notes-list">
    {sorted.map((note) => (
      <li
        class="note-item"
        data-stage={note.data.stage}
        data-tags={note.data.tags.join(',')}
      >
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

  <!-- style="display:none" justifié : le JS gère la visibilité via element.style.display -->
  <!-- Supprimer ce style="" casserait le comportement JS (voir Dev Notes) -->
  <p id="empty-msg" class="empty-msg" style="display:none">
    Aucune note pour ce filtre.
  </p>
</PageLayout>

<style>
  /* ── Header ── */
  .notes-header {
    margin-bottom: var(--space-2xl);
  }

  .notes-header__title {
    font-size: var(--text-3xl);    /* 2rem — correspondance exacte */
    margin: 0 0 var(--space-xs);
  }

  .notes-header__count {
    color: var(--color-ink-muted);
    margin: 0;
  }

  /* ── Filtres ── */
  .filters {
    margin-bottom: var(--space-xl);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .filters__group {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    align-items: center;
    overflow-x: auto;           /* scroll horizontal mobile (AC #4) */
  }

  .filters__label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-ink-muted);
    letter-spacing: 0.05em;     /* pas de token letter-spacing */
    text-transform: uppercase;  /* pas de token text-transform */
    margin-right: var(--space-sm);
    white-space: nowrap;        /* le label ne se coupe pas en mobile */
    flex-shrink: 0;
  }

  /* ── Boutons filtre (tokenisés depuis <style> existant) ── */
  .filter-btn {
    display: inline-block;
    padding: 0.3em 0.85em;      /* em-based — intentionnel, relatif à la font-size du bouton */
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    border: 1px solid var(--color-border);
    background: transparent;
    color: var(--color-ink-muted);
    cursor: pointer;
    transition: all var(--duration-fast);
    font-family: var(--font-sans);
    white-space: nowrap;
  }

  .filter-btn:hover,
  .filter-btn.active {
    border-color: var(--color-accent);   /* alias de --color-accent-500 */
    background: var(--color-accent-50);
    color: var(--color-accent-700);
  }

  /* ── Compteur filtré ── */
  .notes-count {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
    margin-bottom: var(--space-md);
  }

  /* ── Liste notes ── */
  .notes-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .note-item {
    border-bottom: 1px solid var(--color-border);
  }

  /* ── Message état vide ── */
  .empty-msg {
    /* display:none est posé en HTML (pas ici) pour compatibilité JS — voir Dev Notes */
    color: var(--color-ink-muted);
    font-style: italic;
    margin-top: var(--space-xl);
    font-size: var(--text-sm);   /* ajout per AC */
    text-align: center;          /* ajout per AC */
  }
</style>

<script>
  // État courant des filtres
  let currentStage = '';
  let currentTag = '';

  // Lit les query params au chargement
  const params = new URLSearchParams(window.location.search);
  if (params.get('stage')) { currentStage = params.get('stage')!; activateStageBtn(currentStage); }
  if (params.get('tag'))   { currentTag   = params.get('tag')!;   activateTagBtn(currentTag); }
  applyFilters();

  function filterStage(stage: string) {
    currentStage = stage;
    activateStageBtn(stage);
    applyFilters();
    updateURL();
  }

  function filterTag(tag: string) {
    currentTag = tag;
    activateTagBtn(tag);
    applyFilters();
    updateURL();
  }

  function activateStageBtn(stage: string) {
    document.querySelectorAll<HTMLButtonElement>('.stage-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.stage === stage);
    });
  }

  function activateTagBtn(tag: string) {
    document.querySelectorAll<HTMLButtonElement>('.tag-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });
  }

  function applyFilters() {
    const items = document.querySelectorAll<HTMLLIElement>('.note-item');
    let visible = 0;

    items.forEach((item) => {
      const stageMatch = !currentStage || item.dataset.stage === currentStage;
      const tags = (item.dataset.tags ?? '').split(',').filter(Boolean);
      const tagMatch = !currentTag || tags.includes(currentTag);
      const show = stageMatch && tagMatch;
      item.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const countEl = document.getElementById('notes-count');
    if (countEl) {
      countEl.textContent = visible === items.length
        ? ''
        : `${visible} résultat${visible > 1 ? 's' : ''}`;
    }

    const emptyMsg = document.getElementById('empty-msg');
    if (emptyMsg) emptyMsg.style.display = visible === 0 ? '' : 'none';
  }

  function updateURL() {
    const p = new URLSearchParams();
    if (currentStage) p.set('stage', currentStage);
    if (currentTag)   p.set('tag',   currentTag);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }

  // Expose aux onclick inline — PRÉSERVER IMPÉRATIVEMENT
  (window as any).filterStage = filterStage;
  (window as any).filterTag   = filterTag;
</script>
```

### Mapping tokens — valeurs originales → tokens

| Propriété | Valeur originale | Token | Écart |
|-----------|-----------------|-------|-------|
| `header margin-bottom` | `3rem` (54px) | `var(--space-2xl)` (64px) | +10px |
| `h1 font-size` | `2rem` | `var(--text-3xl)` (2rem) | 0 ✓ |
| `h1 margin` | `0 0 0.5rem` (~9px) | `0 0 var(--space-xs)` (4px) | -5px |
| `filters margin-bottom` | `2.5rem` (~45px) | `var(--space-xl)` (40px) | -5px |
| `filters gap` | `1rem` (~18px) | `var(--space-md)` (16px) | -2px |
| `filters__group gap (stage)` | `0.5rem` (~9px) | `var(--space-sm)` (8px) | -1px |
| `filters__group gap (tag)` | `0.4rem` (~7px) | `var(--space-sm)` (8px) | +1px |
| `filters__label margin-right` | `0.5rem` (~9px) | `var(--space-sm)` (8px) | -1px |
| `filter-btn border-radius` | `999px` | `var(--radius-pill)` (9999px) | 0 ✓ |
| `filter-btn font-size` | `0.8rem` | `var(--text-xs)` (0.75rem) | ~1px |
| `filter-btn transition` | `all 150ms` | `all var(--duration-fast)` | 0 ✓ |
| `filter-btn.active border-color` | `var(--color-accent-500)` | `var(--color-accent)` | 0 ✓ (alias) |
| `notes-count font-size` | `0.85rem` | `var(--text-sm)` (0.875rem) | ~0.5px |
| `notes-count margin-bottom` | `1.25rem` (~22.5px) | `var(--space-md)` (16px) | -6.5px |
| `empty-msg margin-top` | `2rem` (36px) | `var(--space-xl)` (40px) | +4px |

**Valeurs sans token (commentées dans le code) :**
- `padding: 0.3em 0.85em` — em-based intentionnel sur `.filter-btn` (relatif à sa propre font-size)
- `letter-spacing: 0.05em` et `text-transform: uppercase` — pas de token pour ces propriétés
- `font-weight: 600` — pas de token font-weight
- `font-style: italic` — pas de token font-style

### Changements visuels attendus (et intentionnels)

> ⚠️ Les notes dans l'index passent du rendu inline `<a class="note-card">` à `<NoteCard>`. Le visuel est similaire mais NoteCard utilise son hover GPU (`translateY(-1px)` + ombre légère) au lieu de `.note-card:hover h2 { color: accent-600 }`.

| Aspect | Avant | Après |
|--------|-------|-------|
| Structure note | `<a class="note-card">` inline | `<NoteCard>` (hover GPU) |
| Tags dans la note | `· #tag` en span | `<Tag>` composant (static, span avec `#`) |
| Date | `fr-FR` `month: 'short'` | identique via NoteCard |
| StageBadge | importé directement | via NoteCard (interne) |
| Hover note | titre → `color-accent-600` | titre → `var(--color-accent)` + `translateY(-1px)` |
| Message vide | "Aucune note ne correspond à ces filtres." | "Aucune note pour ce filtre." (per AC) |

### Décisions critiques

**Pourquoi `style="display:none"` reste sur `#empty-msg`**

Le JS fait `emptyMsg.style.display = visible === 0 ? '' : 'none'`. Quand il met `''`, il retire l'inline style et l'élément tombe en cascade CSS. Si `display: none` est dans la classe `.empty-msg`, l'élément reste caché même quand il devrait s'afficher. La seule solution sans modifier le JS : garder le `style="display:none"` HTML comme état initial. C'est un **cas dynamique documenté et justifié** per architecture.md.

**Classes JS critiques — NE PAS renommer**

Ces classes/IDs sont utilisés par le JS client-side et doivent être préservés exactement :
- `id="notes-count"` — `document.getElementById('notes-count')`
- `id="empty-msg"` — `document.getElementById('empty-msg')`
- `.note-item` — `document.querySelectorAll('.note-item')`
- `.stage-btn` — `document.querySelectorAll('.stage-btn')`
- `.tag-btn` — `document.querySelectorAll('.tag-btn')`
- `data-stage` et `data-tags` — attributs lus par `item.dataset.stage/tags`

**`note.id` comme slug**

Pattern établi dans Stories 3.3, 3.4, 4.1, 4.2. `note.id` est l'identifiant Content Collections = slug URL.

**`data-tags={note.data.tags.join(',')}`**

Format de sérialisation des tags pour le JS : liste séparée par virgule. Le JS parse avec `.split(',').filter(Boolean)`. Ce format doit être préservé exactement.

**StageBadge supprimé des imports**

NoteCard compose StageBadge en interne. La page ne doit plus importer StageBadge.

**`(window as any).filterStage/filterTag` OBLIGATOIRE**

Les boutons de filtre utilisent `onclick="filterStage(...)"`. En SSG Astro, le scope du `<script>` ne rend pas les fonctions globales automatiquement. Le pattern `(window as any).fn = fn` en fin de script est la seule solution fonctionnelle. Ne pas supprimer.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `src/layouts/BaseLayout.astro`** — encore utilisé par NoteLayout jusqu'à Story 4.1
- **Ne pas modifier NoteCard** — la story utilise NoteCard tel quel
- **Ne pas supprimer BaseLayout** — c'est Story 4.4
- **Ne pas modifier le JS** — préserver à l'identique, y compris les noms de fonctions

### Intelligence des stories précédentes

- **`PageLayout` props** : `title: string`, `description?: string` — wrapper HTML complet avec Header+Footer, import depuis `../../layouts/PageLayout.astro`
- **NoteCard props** : `title`, `slug`, `date`, `stage` (requis) + `description?`, `tags?` (optionnels) — Story 3.3
- **`--radius-pill`** (pas `--radius-full`) — nom réel dans global.css après renommage Epic 1
- **`--color-accent`** = alias de `--color-accent-500` — alias défini dans global.css
- **`--duration-fast`** = 150ms — token de transition rapide (`.filter-btn transition`)

### Validation

```bash
# Doit retourner exactement 1 ligne (le style="display:none" justifié sur #empty-msg)
grep 'style="' src/pages/notes/index.astro

# Build complet — 0 erreur attendue
npm run build

# Vérifier que les fonctions JS sont bien exposées globalement
grep 'window as any' src/pages/notes/index.astro
# → doit retourner 2 lignes (filterStage et filterTag)
```

### Structure des fichiers

```
src/
└── pages/
    └── notes/
        └── index.astro   ← MODIFIÉ (cette story)
```

### References

- Epics : Story 4.3 AC → [Source: epics.md — "Story 4.3 : Migrer pages/notes/index.astro"]
- Architecture : JS client limité + `(window as any)` pattern → [Source: architecture.md]
- NoteCard props → [Source: 3-3-composant-notecard-avec-hover-state.md]
- PageLayout props → [Source: 2-3-composant-pagelayout-wrapper-de-page.md]
- Code source actuel → [Source: src/pages/notes/index.astro]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

### File List
