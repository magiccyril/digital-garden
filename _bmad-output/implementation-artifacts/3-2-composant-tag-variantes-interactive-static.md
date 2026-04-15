# Story 3.2 : Composant Tag (variantes interactive/static)

Status: review

## Story

En tant que visiteur de digitalgarden,
je veux voir et interagir avec les tags associés à une note,
afin d'identifier les thèmes et naviguer par tag.

## Acceptance Criteria

1. **Given** que les tokens sont disponibles (Epic 1)
   **When** je crée `src/components/Tag.astro`
   **Then** le composant accepte les props `label: string`, `href?: string`
   **And** si `href` est fourni, le composant rend un `<a>` (variante interactive)
   **And** si `href` est absent, le composant rend un `<span>` (variante static)
   **And** les styles sont dans `<style>` scoped avec toutes valeurs via tokens

2. **Given** que la variante interactive est rendue
   **When** le visiteur survole le tag
   **Then** le fond transite vers `var(--color-accent-100)` en `var(--duration-fast)`

3. **Given** que Tag est créé
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/components/Tag.astro` (AC: #1, #2)
  - [x] Définir `interface Props { label: string; href?: string }`
  - [x] Implémenter le rendu conditionnel : `{href ? <a href={href}>...</a> : <span>...</span>}`
  - [x] Afficher `#{label}` dans les deux variantes (le `#` est géré par le composant)
  - [x] Ajouter `<style>` scoped avec : base commune, variante interactive (hover), toutes valeurs via tokens

- [x] Tâche 2 : Valider le build (AC: #3)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

## Dev Notes

### Contexte critique — code existant à reproduire pixel-perfect

**Tag interactif dans `NoteLayout.astro` (lignes 62-68) :**

```astro
<a
  href={`/notes?tag=${tag}`}
  style="display: inline-block; padding: 0.15em 0.7em; border-radius: 999px;
         font-size: 0.8rem; background: var(--color-border);
         color: var(--color-ink-muted); text-decoration: none; transition: background 150ms;"
>
  #{tag}
</a>
```

**Tag static dans `notes/index.astro` (ligne 87-89) :**
```astro
<span style="font-size: 0.75rem; color: var(--color-ink-muted);">· #{tag}</span>
```

**Note :** Le tag static dans `notes/index.astro` est légèrement différent (préfixe `·` et taille `0.75rem`). Ce contexte est particulier au layout de liste et ne fait pas partie du composant `Tag` générique — le composant Tag aura un style unifié pour les deux variantes.

### Implémentation de référence

```astro
---
interface Props {
  label: string;
  href?: string;
}

const { label, href } = Astro.props;
---

{href ? (
  <a href={href} class="tag tag--interactive">#{label}</a>
) : (
  <span class="tag tag--static">#{label}</span>
)}

<style>
  .tag {
    display: inline-block;
    padding: 0.15em 0.7em;
    border-radius: var(--radius-pill);
    font-size: var(--text-xs);
    background: var(--color-border);
    color: var(--color-ink-muted);
    font-family: var(--font-sans);
  }

  .tag--interactive {
    text-decoration: none;
    transition: background var(--duration-fast) ease;
    cursor: pointer;
  }

  .tag--interactive:hover {
    background: var(--color-accent-100);
    color: var(--color-ink);
  }

  .tag--static {
    user-select: none;
  }
</style>
```

### Décisions de design documentées

**`border-radius: var(--radius-pill)`** (9999px)
Remplace `999px` du code existant — visuellement identique (les deux sont >50% de la hauteur du badge).

**`font-size: var(--text-xs)`** (0.75rem = ~13.5px avec base 112.5%)
Approxime `0.8rem` du code existant (14.4px vs 13.5px — légère différence acceptable dans le contexte de la migration).

**`background: var(--color-border)`** au repos
Préserve la couleur de fond existante.

**`color: var(--color-ink)` au hover**
Amélioration UX légère : le texte passe de muted à ink au hover sur fond accent-100, pour meilleure lisibilité.

**Le `#` est géré par le composant**
Tag reçoit `label="javascript"` et affiche `#javascript`. Les parents passent le nom brut du tag (depuis `note.data.tags`).

**Pas de `color` dans la transition** (seulement `background`)
La spec UX-DR7 spécifie "hover fond `color-accent-100`" — la transition porte sur `background` uniquement.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `NoteLayout.astro`** → Epic 4 (Story 4.1)
- **Ne pas modifier `notes/index.astro`** → Epic 4 (Story 4.3)
- **Ne pas créer NoteCard** → Story 3.3
- Le composant Tag ne gère pas les boutons de filtre de `notes/index.astro` (ceux-ci utilisent `<button>` avec JS — hors scope)

### Usage attendu en Story 3.3 (NoteCard)

```astro
<!-- Dans NoteCard.astro (variante static — pas de href) -->
{tags.map((tag) => <Tag label={tag} />)}

<!-- Dans NoteLayout.astro (variante interactive — avec href) -->
{tags.map((tag) => <Tag label={tag} href={`/notes?tag=${tag}`} />)}
```

### Intelligence des stories précédentes

- **`--radius-pill`** (pas `--radius-full`) : renommé lors du code review Epic 1
- **`--color-accent-100`** : token couleur accent existant = `oklch(92% 0.05 160)` (hover bg)
- **`--color-border`** : token couleur bordure existant = `oklch(88% 0.01 250)` (bg repos)
- **`--text-xs`** : token typographie = 0.75rem (base 18px = ~13.5px)
- **`--duration-fast`** : token transition = 150ms

### Validation

1. Inspection visuelle du code : deux variantes conditionnelles, styles scoped, tokens partout
2. `npm run build` → 0 erreur (composant non utilisé ne casse pas le build)
3. Validation visuelle en Story 3.3/4.1 quand Tag sera intégré dans NoteCard/NoteLayout

### Commandes

```bash
npm run build
```

### Structure des fichiers

```
src/
└── components/
    ├── StageBadge.astro   ← existant (migré en Story 3.1)
    ├── NavLink.astro      ← existant (Story 2.1)
    ├── Header.astro       ← existant (Story 2.2)
    ├── Footer.astro       ← existant (Story 2.2)
    └── Tag.astro          ← NOUVEAU
```

### Project Structure Notes

- `Tag.astro` dans `src/components/` (PascalCase)
- Zéro dépendance sur d'autres composants
- Sera composé par NoteCard (Story 3.3) et utilisé dans NoteLayout (Epic 4)

### References

- Epics : Story 3.2 AC → [Source: epics.md — "Story 3.2 : Composant Tag (variantes interactive/static)"]
- UX : UX-DR7 Tag variantes → [Source: ux-design-specification.md — UX-DR7]
- Code existant : NoteLayout.astro lignes 62-68 → tag interactif
- Code existant : notes/index.astro ligne 87-89 → tag static contextuel
- Code review : renommage radius → [Source: 1-3-tokens-rayons-transitions-et-aliases-couleur.md — Review Findings]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- Création de `src/components/Tag.astro` avec rendu conditionnel `href ? <a> : <span>`
- Variante interactive (`.tag--interactive`) : transition `background var(--duration-fast)`, hover `var(--color-accent-100)` + `var(--color-ink)`
- Variante static (`.tag--static`) : `user-select: none`
- Le composant ajoute le préfixe `#` au label — les parents passent le nom brut du tag
- Toutes les valeurs CSS via tokens : `--radius-pill`, `--text-xs`, `--color-border`, `--color-ink-muted`, `--font-sans`, `--duration-fast`, `--color-accent-100`, `--color-ink`
- Build propre : 6 pages générées, 0 erreur

### File List

- src/components/Tag.astro

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée — inclut code existant tag dans NoteLayout et notes/index | create-story |
| 2026-04-14 | 1.1 | Implémentation — Tag.astro avec variantes interactive/static, styles via tokens | dev-story |
