# Story 3.4 : Composant BacklinkList

Status: done

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant que visiteur de digitalgarden,
je veux voir quelles autres notes mentionnent la note que je lis,
afin de découvrir des connexions entre mes idées.

## Acceptance Criteria

1. **Given** que les tokens sont disponibles (Epic 1)
   **When** je crée `src/components/BacklinkList.astro`
   **Then** le composant accepte la prop `backlinks: Array<{title: string, slug: string}>`
   **And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

2. **Given** que `backlinks` contient au moins un élément
   **When** le composant est rendu
   **Then** la section `<aside>` est visible avec la liste des liens vers les notes mentionnantes
   **And** chaque lien pointe vers `/notes/${slug}`

3. **Given** que `backlinks` est un tableau vide
   **When** le composant est rendu
   **Then** la section est entièrement masquée — aucun espace vide visible

4. **Given** que BacklinkList est créé
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/components/BacklinkList.astro` (AC: #1, #2, #3)
  - [x] Définir `interface Props { backlinks: Array<{title: string; slug: string}> }`
  - [x] Implémenter le masquage conditionnel : `{backlinks.length > 0 && (...)}`
  - [x] Structurer l'`<aside>` avec `<h2>` "Mentionné dans" + `<ul>` de liens
  - [x] Ajouter `aria-hidden="true"` sur le `<span>` flèche (décoratif)
  - [x] Ajouter `<style>` scoped : heading uppercase, liens avec hover couleur+soulignement
  - [x] Toutes valeurs CSS via tokens (sauf `letter-spacing` et `text-transform` — pas de token)

- [x] Tâche 2 : Valider le build (AC: #4)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

### Review Findings

- [x] [Review][Patch] Prop `backlinks` obligatoire sans valeur par défaut — crash si non fournie [BacklinkList.astro:3] — remplacer `backlinks: Array<...>` par `backlinks?: Array<...>` avec défaut `= []` dans le destructuring
- [x] [Review][Defer] Slugs non encodés dans les hrefs `/notes/${slug}` [BacklinkList.astro:15] — deferred, les slugs Astro Content Collections sont normalisés, risque pratique faible

## Dev Notes

### Contexte critique — code existant à reproduire pixel-perfect

**Section backlinks dans `src/layouts/NoteLayout.astro` (lignes 80-99) :**

```astro
{backlinks.length > 0 && (
  <aside style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid var(--color-border);">
    <h2 style="font-family: var(--font-sans); font-size: 0.8rem; font-weight: 600;
               letter-spacing: 0.08em; text-transform: uppercase;
               color: var(--color-ink-muted); margin: 0 0 1rem;">
      Mentionné dans
    </h2>
    <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.6rem;">
      {backlinks.map((bl) => (
        <li>
          <a
            href={`/notes/${bl.id}`}
            style="display: flex; align-items: center; gap: 0.5rem;
                   text-decoration: none; color: var(--color-ink); font-size: 0.95rem;"
          >
            <span style="color: var(--color-accent-500);">←</span>
            {bl.data.title}
          </a>
        </li>
      ))}
    </ul>
  </aside>
)}
```

**Différences importantes composant vs code actuel :**

| Propriété | Code actuel (NoteLayout) | Composant BacklinkList |
|-----------|--------------------------|------------------------|
| `bl.id` (CollectionEntry) | `href={/notes/${bl.id}}` | `href={/notes/${slug}}` — prop string directe |
| `bl.data.title` | valeur depuis Collection | `title` — prop string directe |
| `color: var(--color-accent-500)` (flèche) | valeur brute | `var(--color-accent)` — alias sémantique |
| hover | aucun état hover | `var(--color-accent-hover)` + soulignement (UX spec) |
| `font-size: 0.95rem` | hors échelle token | `var(--text-base)` (1rem ≈ 0.95rem, différence ~1px) |

### Implémentation de référence

```astro
---
interface Props {
  backlinks: Array<{ title: string; slug: string }>;
}

const { backlinks } = Astro.props;
---

{backlinks.length > 0 && (
  <aside class="backlinks">
    <h2 class="backlinks__heading">Mentionné dans</h2>
    <ul class="backlinks__list">
      {backlinks.map(({ title, slug }) => (
        <li class="backlinks__item">
          <a href={`/notes/${slug}`} class="backlinks__link">
            <span class="backlinks__arrow" aria-hidden="true">←</span>
            {title}
          </a>
        </li>
      ))}
    </ul>
  </aside>
)}

<style>
  .backlinks {
    margin-top: var(--space-2xl);
    padding-top: var(--space-xl);
    border-top: 1px solid var(--color-border);
  }

  .backlinks__heading {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.08em;   /* pas de token letter-spacing — valeur décorative */
    text-transform: uppercase; /* pas de token text-transform — valeur décorative */
    color: var(--color-ink-muted);
    margin: 0 0 var(--space-md);
  }

  .backlinks__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .backlinks__link {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    text-decoration: none;
    color: var(--color-ink);
    font-size: var(--text-base);
    transition: color var(--duration-fast) ease;
  }

  .backlinks__link:hover {
    color: var(--color-accent-hover);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .backlinks__arrow {
    color: var(--color-accent);
    flex-shrink: 0;
  }
</style>
```

### Tokens utilisés — valeurs réelles dans `global.css`

> ⚠️ **RAPPEL** : utiliser les noms réels issus de global.css (renommés lors du code review Epic 1)

| Token | Valeur | Rôle dans BacklinkList |
|-------|--------|------------------------|
| `--space-sm` | 8px | gap entre flèche et texte; gap entre items liste |
| `--space-md` | 16px | margin-bottom du heading |
| `--space-xl` | 40px | padding-top de l'aside |
| `--space-2xl` | 64px | margin-top de l'aside |
| `--text-xs` | 0.75rem | taille heading (0.8rem existant → approx token) |
| `--text-base` | 1rem | taille liens (0.95rem existant → approx token) |
| `--font-sans` | Inter... | heading font |
| `--color-ink` | oklch(18%...) | couleur texte liens (défaut) |
| `--color-ink-muted` | oklch(50%...) | couleur heading |
| `--color-border` | oklch(88%...) | bordure supérieure |
| `--color-accent` | var(--color-accent-500) | couleur flèche |
| `--color-accent-hover` | var(--color-accent-600) | couleur liens au hover |
| `--duration-fast` | 150ms | transition couleur liens |

**Valeurs sans token (acceptables) :**
- `letter-spacing: 0.08em` — style typographique décoratif, pas de token letter-spacing dans le projet
- `text-transform: uppercase` — pas de token pour les transformations texte
- `text-underline-offset: 3px` — décoration de lien, valeur fixe cohérente avec `global.css` (`a { text-underline-offset: 3px }`)

**Approximations de tokens (écarts mineurs, pixel-perfect conservé) :**
- `margin-top: 4rem` (72px au design base 18px) → `var(--space-2xl)` (64px) : écart 8px, acceptable
- `padding-top: 2rem` (36px) → `var(--space-xl)` (40px) : écart 4px, acceptable
- `gap: 0.6rem` (≈11px) → `var(--space-sm)` (8px) : écart 3px, acceptable
- `font-size: 0.8rem` → `var(--text-xs)` (0.75rem) : écart ~1px, acceptable
- `font-size: 0.95rem` → `var(--text-base)` (1rem) : écart ~1px, acceptable

### Décisions de design documentées

**Masquage conditionnel via `{backlinks.length > 0 && (...)}`**
Pattern Astro standard — quand `backlinks` est vide, aucun HTML n'est rendu, donc zéro espace vide. Conforme à UX-DR8.

**Props : `Array<{title: string, slug: string}>` (pas `CollectionEntry`)**
Le composant est découplé du système de Content Collections. NoteLayout se charge de la logique de calcul des backlinks et passe des objets simples. Cela rend BacklinkList réutilisable et testable indépendamment.

**Hover : `color-accent-hover` + `text-decoration: underline`**
Conforme à UX spec "Patterns d'interaction hover" : "Backlink | couleur → color-accent-hover + soulignement". L'existant dans NoteLayout n'avait pas de hover — c'est une amélioration UX prévue dans la spec.

**`aria-hidden="true"` sur la flèche `←`**
Le caractère flèche est décoratif. Le lecteur d'écran lira le titre de la note — pas besoin de lire "←" en plus.

**`var(--color-accent)` (alias) vs `var(--color-accent-500)` (brut)**
Le code existant utilisait `-500` directement. Le composant utilise l'alias sémantique correct, conformément à l'architecture et au pattern établi dans Tag.astro et NoteCard.astro.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `NoteLayout.astro`** → Epic 4, Story 4.1 (le composant est créé mais pas encore intégré)
- Le calcul des backlinks (grep `[[note.id]]` dans `n.body`) reste dans `NoteLayout.astro` — il s'agit de logique métier, pas de rendu
- Pas de gestion du titre de section "Mentionné dans" comme prop — c'est une constante UI

### Usage attendu en Story 4.1 (NoteLayout migration)

```astro
<!-- Dans NoteLayout.astro (Story 4.1) — après migration -->
import BacklinkList from '../components/BacklinkList.astro';

// La logique de calcul reste dans NoteLayout :
const backlinks = allNotes
  .filter((n) => {
    if (n.id === note.id) return false;
    const raw = n.body ?? '';
    return (
      raw.includes(`[[${note.id}]]`) ||
      raw.includes(`[[${title}]]`) ||
      raw.toLowerCase().includes(`[[${title.toLowerCase()}]]`)
    );
  })
  .map((n) => ({ title: n.data.title, slug: n.id })); // ← transformation pour le composant

// Dans le template :
<BacklinkList backlinks={backlinks} />
```

### Intelligence des stories précédentes

- **`--radius-pill`** (pas `--radius-full`), **`--radius-small`** (pas `--radius-sm`) : noms réels dans global.css après code review Epic 1
- **`var(--color-accent)`** alias sémantique = `--color-accent-500` — à préférer aux valeurs brutes numériques
- **`var(--color-accent-hover)`** alias = `--color-accent-600` — token hover pour les liens
- **`class:list={[...]}`** (pas `className`) — syntaxe Astro si classes conditionnelles nécessaires
- **`import type { CollectionEntry }`** (pas d'import valeur) — règle 4 architecture
- **Build validation** après chaque story — pattern établi depuis Epic 1
- **Masquage conditionnel** via `{condition && (<element>)}` — pattern Astro établi dans NoteLayout existant

### Structure des fichiers

```
src/
└── components/
    ├── NavLink.astro       ← existant (Story 2.1)
    ├── Header.astro        ← existant (Story 2.2)
    ├── Footer.astro        ← existant (Story 2.2)
    ├── StageBadge.astro    ← existant (Story 3.1)
    ├── Tag.astro           ← existant (Story 3.2)
    ├── NoteCard.astro      ← existant (Story 3.3)
    └── BacklinkList.astro  ← NOUVEAU (cette story)
```

### Project Structure Notes

- `BacklinkList.astro` dans `src/components/` (PascalCase, convention projet)
- Zéro import d'autres composants (autonome)
- Sera consommé par `NoteLayout.astro` lors de la migration Epic 4 (Story 4.1)

### Validation

1. Inspection visuelle : `interface Props` avec type array, rendu conditionnel `backlinks.length > 0`, styles scoped, tokens partout sauf `letter-spacing`/`text-transform`/`text-underline-offset`
2. Vérifier que le composant ne rend RIEN quand `backlinks = []` (aucun wrapper vide)
3. `npm run build` → 0 erreur (composant non utilisé dans les pages existantes est toléré)

### Commandes

```bash
npm run build
```

### References

- Epics : Story 3.4 AC → [Source: epics.md — "Story 3.4 : Composant BacklinkList"]
- UX : UX-DR8 masquage auto → [Source: ux-design-specification.md — "UX Design Requirements"]
- UX : hover backlinks → [Source: ux-design-specification.md — "Patterns d'interaction hover"]
- Code existant : NoteLayout.astro lignes 80-99 → section backlinks de référence
- Architecture : Règle 6 (tokens), Règle 1 (interface Props) → [Source: architecture.md — "Patterns de composants Astro"]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun — implémentation directe sans blocage.

### Completion Notes List

- Création de `src/components/BacklinkList.astro`, zéro dépendance sur d'autres composants
- Masquage conditionnel via `{backlinks.length > 0 && (...)}` — aucun HTML rendu si tableau vide (AC #3)
- Structure : `<aside>` → heading `<h2>` "Mentionné dans" → `<ul>` de `<a>` avec flèche `←`
- `aria-hidden="true"` sur `<span class="backlinks__arrow">` — décoratif, le titre suffit pour le lecteur d'écran
- Hover : `color: var(--color-accent-hover)` + `text-decoration: underline` + `text-underline-offset: 3px`
- Flèche : `color: var(--color-accent)` (alias sémantique, pas `-500` brut)
- `letter-spacing: 0.08em` et `text-transform: uppercase` conservés comme valeurs décoratives (pas de token)
- Toutes autres valeurs via tokens : `--space-2xl`, `--space-xl`, `--space-md`, `--space-sm`, `--text-xs`, `--text-base`, `--font-sans`, `--color-*`, `--duration-fast`
- Build : 6 pages, 0 erreur

### File List

- src/components/BacklinkList.astro
