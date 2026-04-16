# Story 4.4 : Audit final et nettoyage de la dette résiduelle

Status: review

## Story

En tant que développeur de digitalgarden,
je veux vérifier que la migration est complète et sans reste de dette inline,
afin de garantir que le contrat du design system est respecté dans l'intégralité du code.

## Acceptance Criteria

1. **Given** que toutes les pages sont migrées (Stories 4.1–4.3)
   **When** j'exécute `grep -r 'style="' src/`
   **Then** la commande retourne 1 seul résultat (le `style="display:none"` documenté sur `#empty-msg` dans `src/pages/notes/index.astro`)
   **And** ce résultat est adjacent à un commentaire HTML qui le justifie explicitement

2. **Given** que l'audit grep est propre
   **When** j'exécute `grep -r 'PERSONNALISE' src/`
   **Then** la commande retourne 0 résultat (tous les commentaires résiduels sont supprimés)

3. **Given** que le code est nettoyé
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur ni warning TypeScript

4. **Given** que le build est propre
   **When** j'ouvre la homepage, l'index `/notes` et une note individuelle dans le navigateur
   **Then** le rendu visuel de chacune est identique à l'état pré-nettoyage

## Tasks / Subtasks

- [x] Tâche 1 : Supprimer `BaseLayout.astro` (AC: #1)
  - [x] Confirmer qu'aucun fichier n'importe `BaseLayout` (`grep -r 'BaseLayout' src/` → 0 résultat)
  - [x] Supprimer `src/layouts/BaseLayout.astro`

- [x] Tâche 2 : Supprimer les commentaires `PERSONNALISE` dans `src/pages/index.astro` (AC: #2)
  - [x] Supprimer `<!-- PERSONNALISE : remplace ce texte d'introduction par le tien -->`
  - [x] Supprimer `<!-- PERSONNALISE : ta phrase d'accroche -->`
  - [x] Supprimer `<!-- PERSONNALISE : ton paragraphe d'intro -->`

- [x] Tâche 3 : Supprimer le commentaire `PERSONNALISE` dans `src/styles/global.css` (AC: #2)
  - [x] Supprimer `/* PERSONNALISE : change --color-accent-* pour ta couleur de marque */`

- [x] Tâche 4 : Audit final et validation (AC: #1, #2, #3)
  - [x] `grep -r 'BaseLayout' src/` → 0 résultat
  - [x] `grep -r 'style="' src/` → exactement 1 résultat (le `display:none` justifié)
  - [x] `grep -r 'PERSONNALISE' src/` → 0 résultat
  - [x] `npm run build` → 0 erreur

## Dev Notes

### État de la codebase avant cette story

**Résultats des greps de départ (base de référence) :**

```bash
# style="" restants dans src/
grep -r 'style="' src/

# → src/layouts/BaseLayout.astro (10 occurrences — fichier à supprimer)
# → src/pages/notes/index.astro:73 (1 occurrence — justifiée, à conserver)
```

```bash
# PERSONNALISE restants dans src/
grep -r 'PERSONNALISE' src/

# → src/layouts/BaseLayout.astro (lignes 11, 25, 48, 63 — fichier à supprimer)
# → src/pages/index.astro (lignes 22, 27, 32 — 3 commentaires HTML à supprimer)
# → src/styles/global.css (ligne 14 — 1 commentaire CSS à supprimer)
```

### Tâche 1 — Suppression de `BaseLayout.astro` : ce que ça résout

`BaseLayout.astro` est l'ancien layout monolithique pré-migration. Depuis la Story 4.1 (NoteLayout migré vers PageLayout), 4.2 (homepage), et 4.3 (notes/index), **aucune page ni layout n'importe plus BaseLayout**. Le fichier est orphelin.

**Confirmation :** `grep -r 'BaseLayout' src/ --include="*.astro"` → 0 résultat.

Sa suppression élimine :
- 10 `style=""` inline (corps, header, nav, liens, main, footer...)
- 4 commentaires `PERSONNALISE`
- La référence à `JetBrains Mono` sans chargement Google Fonts (bug silencieux de police)
- Le `<body style="background-color: ...">` qui dupliquait les règles `html {}` de `global.css`

### Tâche 2 — Commentaires `PERSONNALISE` dans `pages/index.astro`

Trois commentaires HTML à supprimer dans `src/pages/index.astro`. Ces commentaires sont sur des lignes séparées et ne contiennent que le commentaire — suppression de la ligne entière.

**Lignes cibles (état actuel) :**
```html
<!-- PERSONNALISE : remplace ce texte d'introduction par le tien -->  ← ligne 22
<!-- PERSONNALISE : ta phrase d'accroche -->                           ← ligne 27
<!-- PERSONNALISE : ton paragraphe d'intro -->                         ← ligne 32
```

Le contenu autour de ces commentaires (sections, h1, paragraphes) est conservé intact — seules les lignes de commentaire sont supprimées.

### Tâche 3 — Commentaire `PERSONNALISE` dans `global.css`

Un seul commentaire CSS à supprimer dans `src/styles/global.css` :

```css
/* PERSONNALISE : change --color-accent-* pour ta couleur de marque */  ← ligne 14
```

Ce commentaire est sur sa propre ligne entre les polices et la palette — suppression de la ligne entière.

### Le cas `style="display:none"` — À CONSERVER

Dans `src/pages/notes/index.astro`, la ligne suivante doit être préservée :
```html
<p id="empty-msg" class="empty-msg" style="display:none">
```

Le JS gère la visibilité via `element.style.display`. Si `display: none` était dans la classe CSS, l'affichage serait cassé quand `visible === 0`. C'est le seul `style=""` autorisé dans la codebase — documenté par le commentaire HTML adjacent (lignes 71-72 du fichier).

**Le grep `grep -r 'style="' src/` retournera donc 1 résultat** (et non 0). C'est le comportement attendu et correct.

### Noms réels des tokens `--radius-*` (important)

L'architecture doc planifiait `--radius-sm/md/lg/full` mais l'implémentation Epic 1 a retenu des noms plus explicites pour éviter les conflits avec le namespace Tailwind v4 :

| Token dans global.css | Valeur |
|----------------------|--------|
| `--radius-small`     | `4px`  |
| `--radius-medium`    | `8px`  |
| `--radius-large`     | `12px` |
| `--radius-pill`      | `9999px` |

Ces noms sont déjà utilisés correctement dans les composants existants (ex: `var(--radius-pill)` dans `filter-btn`, `var(--radius-large)` dans `.stat-card`).

### Fichiers concernés par cette story

| Fichier | Action | Raison |
|---------|--------|--------|
| `src/layouts/BaseLayout.astro` | **Supprimer** | Orphelin — 0 import, 10 style="" inline |
| `src/pages/index.astro` | Supprimer 3 lignes | Commentaires PERSONNALISE résiduels |
| `src/styles/global.css` | Supprimer 1 ligne | Commentaire PERSONNALISE résiduel |
| `src/pages/notes/index.astro` | **Ne pas toucher** | `style="display:none"` justifié |
| `src/layouts/NoteLayout.astro` | **Ne pas toucher** | Propre depuis Story 4.1 |
| `src/pages/notes/[slug].astro` | **Ne pas toucher** | Propre depuis Story 4.1 |

### Ce que cette story ne fait PAS

- **Ne pas modifier les tokens CSS** — les noms `--radius-small/medium/large/pill` sont définis et utilisés
- **Ne pas modifier le contenu éditorial** — les textes d'intro de `pages/index.astro` restent tels quels
- **Ne pas supprimer `global.css`** — seule la ligne de commentaire PERSONNALISE est retirée
- **Ne pas créer de nouveaux composants** — c'est une story de nettoyage uniquement
- **Ne pas modifier le JS** de `notes/index.astro`

### Commandes de validation (Tâche 4)

```bash
# 1 — Confirmer BaseLayout orphelin avant suppression
grep -r 'BaseLayout' src/ --include="*.astro"
# → 0 résultat attendu

# 2 — Audit style="" post-suppression (exactement 1 résultat attendu)
grep -r 'style="' src/
# → src/pages/notes/index.astro: <p id="empty-msg" class="empty-msg" style="display:none">

# 3 — Audit PERSONNALISE (0 résultat attendu)
grep -r 'PERSONNALISE' src/
# → (aucun résultat)

# 4 — Build final
npm run build
# → "6 page(s) built" sans erreur
```

### Intelligence des stories précédentes

- **Story 4.1 (NoteLayout)** — Confirme que BaseLayout n'est plus nécessaire : NoteLayout utilise PageLayout
- **Story 4.2 (homepage)** — `pages/index.astro` utilise PageLayout + NoteCard, styles scopés avec tokens
- **Story 4.3 (notes/index)** — Le `style="display:none"` sur `#empty-msg` est un cas dynamique intentionnel documenté
- **Epic 1** — Tokens `--radius-pill` (pas `--radius-full`), `--radius-small/medium/large` (pas `sm/md/lg`)

### Références

- Architecture → FR22 : `grep -r 'style="' src/` objectif 0 résultat (hors cas dynamiques)
- Architecture → Règle 2 : Styles dans `<style>` scoped, jamais inline
- Story 4.3 Dev Notes → Justification du `style="display:none"` sur `#empty-msg`

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

Audit final et nettoyage terminés :
- `src/layouts/BaseLayout.astro` supprimé (orphelin, 0 import, 10 style="" inline éliminés)
- `src/pages/index.astro` : 3 commentaires HTML `PERSONNALISE` supprimés
- `src/styles/global.css` : 1 commentaire CSS `PERSONNALISE` supprimé
- `grep -r 'style="' src/` → 1 résultat justifié (display:none documenté sur #empty-msg)
- `grep -r 'PERSONNALISE' src/` → 0 résultat
- `grep -r 'BaseLayout' src/` → 0 résultat
- Build : 0 erreur, 6 pages générées

### File List

- src/layouts/BaseLayout.astro (supprimé)
- src/pages/index.astro (nettoyé)
- src/styles/global.css (nettoyé)

## Change Log

- 2026-04-16 : Audit final — suppression de BaseLayout.astro (orphelin), nettoyage des 4 commentaires PERSONNALISE résiduels dans index.astro et global.css. Build : 0 erreur. Le design system respecte désormais FR22 dans l'intégralité du code.
