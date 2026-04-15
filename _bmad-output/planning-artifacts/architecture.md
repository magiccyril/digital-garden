---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-04-13'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
  - "_bmad-output/planning-artifacts/product-brief-digitalgarden.md"
  - "_bmad-output/planning-artifacts/product-brief-digitalgarden-distillate.md"
  - "_bmad-output/project-context.md"
workflowType: 'architecture'
project_name: 'digitalgarden'
user_name: 'Cyril'
date: '2026-04-13'
---

# Architecture Decision Document — digitalgarden

**Auteur :** Cyril
**Date :** 2026-04-13

_Ce document se construit collaborativement étape par étape. Les sections sont ajoutées progressivement à travers chaque décision architecturale._

---

## Analyse du contexte projet

### Vue d'ensemble des exigences

**Exigences fonctionnelles (37 FRs) organisées en 6 catégories :**

| Catégorie | FRs | Implication architecturale |
|-----------|-----|---------------------------|
| Navigation & structure | FR1–FR5 | Header/Footer/PageLayout stables, routing file-based Astro |
| Lecture de notes | FR6–FR11 | NoteLayout + wiki-links + BacklinkList — tout calculé à la compilation |
| Publication & contenu | FR12–FR16 | Pipeline Syncthing → inotifywait → `astro build` ; filtre `publish` au build |
| Design system / tokens | FR17–FR22 | `global.css` @theme-only + zéro `style=""` inline |
| Composants Astro | FR23–FR31 | 8 composants scopés, autonomes, sans dépendance globale |
| Page /styleguide | FR32–FR34 | Page statique Astro, documentée à chaque nouveau composant |

**Exigences non-fonctionnelles clés :**

- Performance : Lighthouse ≥ 90, TTFB < 200ms (local), zéro JS client non justifié
- Fiabilité : build atomique (échec → ancienne version servie), systemd avec restart automatique
- Sécurité : HTTPS obligatoire (SWAG/TLS), zéro collecte de données
- Maintenabilité : compréhension complète < 15 min après absence prolongée

**Contraintes techniques non-négociables (déjà décidées) :**

- Astro 6 SSG — MPA, zéro hydration par défaut
- Tailwind v4 via `@tailwindcss/vite` — pas de `tailwind.config.js`
- `global.css` = uniquement `@theme {}` + `@layer base {}`
- Migration en **une passe unique** — pas d'approche incrémentale
- Style visuel conservé **pixel-perfect** — aucun changement esthétique

### Complexité & périmètre

- **Complexité** : Faible — site statique personnel, utilisateur unique, SSG pur
- **Domaine** : Web frontend / Design System
- **Nature** : Brownfield — refonte structurelle d'un code fonctionnel existant
- **Composants architecturaux estimés** : 8 composants + 1 layout + 1 page styleguide + tokens @theme

### Contraintes & dépendances techniques

- `remark-wiki-link` 2.0.1 — résolution `[[slug]]` au build → stabilité des slugs requise
- Backlinks calculés à la compilation dans `NoteLayout.astro` (grep `[[note.id]]` dans `n.body`)
- `src/content/notes/` est un symlink Syncthing → ne pas modifier dans les composants
- JS client limité à `notes/index.astro` (filtres stage/tag) — pattern `(window as any).fn` existant

### Préoccupations transversales identifiées

1. **Token contract** — toute valeur visuelle DOIT passer par `var(--*)` ; aucune valeur magique
2. **Scoping CSS** — chaque composant `.astro` est autonome ; zéro dépendance globale hors tokens
3. **Régression visuelle** — captures avant/après sur pages clés (homepage, note, index)
4. **Styleguide comme vérité** — tout composant créé doit y figurer avant d'être utilisé en production
5. **Pipeline de build** — l'architecture ne touche pas Syncthing/systemd/SWAG (hors périmètre)

---

## Stack technique (brownfield — existante)

Projet brownfield. Aucun starter template applicable — la stack est en place et verrouillée.

**Stack :** Astro 6.1.4 + Tailwind CSS 4.2.2 + @astrojs/mdx 5.0.3 + remark-wiki-link 2.0.1
**Runtime :** Node.js ≥ 22.12.0, ES Modules (`"type": "module"`)
**Build :** Vite intégré Astro — sortie statique dans `dist/`
**Commande d'initialisation :** N/A — migration sur codebase existant

**Structure conservée :**

```
src/
├── components/     # PascalCase.astro — cible de l'extraction (vide → 8 composants)
├── layouts/        # PascalCase.astro — BaseLayout existant à décomposer
├── pages/          # kebab-case.astro — routing file-based
│   └── notes/[slug].astro
├── styles/
│   └── global.css  # @theme + @layer base UNIQUEMENT
└── content/
    └── notes/      # symlink Syncthing → immuable, ne pas modifier
```

---

## Décisions architecturales core

### Analyse des priorités de décision

**Décisions critiques (bloquent l'implémentation) :**
- Convention de nommage des tokens → sémantique (`--space-xs/sm/md/lg/xl`)
- Composition de PageLayout → interne (Header + Footer inclus)
- Séquence de migration → tokens en premier

**Décisions déjà établies par la stack (non re-décidées) :**
- SSG Astro, MPA, zéro hydration
- Tailwind v4 via @tailwindcss/vite
- Content Collections + schéma Zod stable
- Pipeline Syncthing → systemd (hors périmètre)

**Décisions différées (post-MVP) :**
- Dark mode (tokens sémantiques préparent le terrain, implémentation v3)
- BookCard + collection "Notes de lecture" (v2)

---

### Architecture des données

Entièrement gérée par Astro Content Collections. Schéma Zod stable dans `content.config.ts` — ne pas modifier. Backlinks calculés à la compilation via grep `[[note.id]]` dans `n.body`. Aucune base de données, aucune API.

---

### Sécurité

HTTPS via SWAG (TLS géré externalement). Site statique : surface d'attaque nulle côté serveur. Zéro cookie, zéro analytics, zéro donnée personnelle. Hors périmètre v1.

---

### Architecture frontend — Design System

#### Tokens CSS (`global.css` → `@theme {}`)

**Convention retenue : scale sémantique**

```css
@theme {
  /* Espacement — base 4px */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;

  /* Typographie */
  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */

  /* Rayons */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-full: 9999px;

  /* Transitions */
  --duration-fast: 150ms;
  --duration-base: 200ms;
}
```

Les tokens couleurs et polices existants dans `@theme` sont conservés à l'identique.

#### Composition de PageLayout

**Option A retenue** : `PageLayout.astro` compose `Header` et `Footer` en interne. Chaque page utilise `<PageLayout>` et n'importe jamais directement `Header` ou `Footer`. Exception future documentée si nécessaire.

```astro
<!-- PageLayout.astro -->
---
import Header from './Header.astro'
import Footer from './Footer.astro'
---
<Header />
<main><slot /></main>
<Footer />
```

#### Séquence de migration (une passe unique)

**Option A retenue** : Tokens d'abord.

1. **Phase 1 — Tokens** : Formaliser toute la `@theme {}` dans `global.css` (espacement, typo, rayons, transitions — couleurs déjà présentes)
2. **Phase 2 — Composants** : Extraire les 8 composants en utilisant les tokens comme référence
3. **Phase 3 — Migration inline** : Remplacer les ~60 `style=""` par des styles scopés utilisant les tokens
4. **Phase 4 — Styleguide** : Créer `/styleguide` documentant tous les composants et leurs variantes
5. **Phase 5 — Audit** : `grep -r 'style="' src/` → 0 résultat (hors cas dynamiques documentés)

---

### Infrastructure & Déploiement

Existant et hors périmètre : Syncthing → inotifywait → `astro build` → systemd → SWAG (Nginx/TLS). Architecture de build atomique : échec → ancienne version servie.

---

## Patterns d'implémentation & règles de cohérence

### Conventions de nommage

| Contexte | Convention | Exemple |
|----------|-----------|---------|
| Fichiers composants | `PascalCase.astro` | `NoteCard.astro` |
| Fichiers pages | `kebab-case.astro` | `styleguide.astro` |
| Props d'interface | `camelCase` | `stage`, `showDate` |
| Classes CSS scopées | `kebab-case` | `.note-card`, `.stage-badge` |
| Tokens CSS | `--categorie-taille` | `--space-md`, `--text-sm` |
| Variables JS/TS | `camelCase` | `publishedNotes`, `backlinks` |

### Patterns de composants Astro

**Règle 1 — Interface Props obligatoire dans chaque composant**
```astro
---
interface Props {
  stage: 'seedling' | 'budding' | 'evergreen'
  title: string
  description?: string
}
const { stage, title, description } = Astro.props
---
```

**Règle 2 — Styles dans `<style>` scoped, jamais inline**
```astro
<!-- ❌ Interdit -->
<div style="padding: 16px; color: oklch(...)">

<!-- ✅ Correct -->
<div class="card">
<style>
  .card { padding: var(--space-md); color: var(--color-ink); }
</style>
```

**Règle 3 — Classes conditionnelles via `class:list`**
```astro
<!-- ❌ Interdit (syntaxe React) -->
<div className={`badge ${active ? 'active' : ''}`}>

<!-- ✅ Correct (syntaxe Astro) -->
<div class:list={['badge', { active }]}>
```

**Règle 4 — Import de types Astro**
```ts
// ❌ Interdit
import { CollectionEntry } from 'astro:content'

// ✅ Correct
import type { CollectionEntry } from 'astro:content'
```

**Règle 5 — Filtrage des notes publiées (pattern figé)**
```ts
const notes = await getCollection('notes', ({ data }) => data.publish !== false)
```

### Patterns CSS / Tokens

**Règle 6 — Toute valeur visuelle passe par un token**

| ❌ Interdit | ✅ Correct |
|------------|-----------|
| `padding: 16px` | `padding: var(--space-md)` |
| `font-size: 0.875rem` | `font-size: var(--text-sm)` |
| `border-radius: 999px` | `border-radius: var(--radius-full)` |
| `transition: 150ms ease` | `transition: var(--duration-fast) ease` |
| `color: oklch(18% ...)` | `color: var(--color-ink)` |

**Règle 7 — Classes Tailwind utilitaires acceptables pour la mise en page structurelle**

`flex`, `grid`, `items-center`, `justify-between`, etc. sont acceptables. Les valeurs visuelles (espacements, couleurs, tailles) passent obligatoirement par les tokens.

### Patterns de structure

**Règle 8 — Convention d'extraction**
- Pattern utilisé **2+ fois** → composant dédié dans `src/components/`
- Pattern utilisé **1 seule fois** → style scopé dans la page, acceptable

**Règle 9 — `global.css` est sacré**
- Contient **uniquement** `@theme {}` et `@layer base {}`
- Les styles wiki-links (`.wiki-link`, `.wiki-link--new`) restent dans `@layer base` — ne pas déplacer ni supprimer

**Règle 10 — Styleguide = source de vérité**
- Tout nouveau composant est ajouté au styleguide **avant** d'être utilisé en production
- Consulter `/styleguide` avant de créer un nouveau composant : il existe peut-être déjà

### Patterns JS client

**Règle 11 — Zéro JS client ajouté sans justification documentée**

Seul le JS existant dans `notes/index.astro` (filtres stage/tag) est autorisé. Tout ajout requiert une justification explicite en commentaire.

**Règle 12 — Pattern `(window as any).fn` conservé tel quel**

Le pattern existant pour les handlers `onclick` n'est pas refactorisé en v1.

### Tableau d'application obligatoire pour tous les agents

**Tous les agents DOIVENT :**
- Lire `project-context.md` avant toute implémentation de code
- Vérifier `/styleguide` avant de créer un nouveau composant
- Utiliser un token pour toute valeur visuelle, sans exception
- Placer les styles dans `<style>` scoped du composant concerné
- Tester le build (`npm run build`) après chaque modification

---

## Structure projet & frontières

### Arborescence complète post-refonte

```
digitalgarden/
├── astro.config.mjs              # Config Astro + plugin Tailwind Vite
├── package.json                  # Node.js >= 22.12.0, "type": "module"
├── tsconfig.json
├── .gitignore
│
├── src/
│   ├── components/               # 8 composants extraits (PascalCase.astro)
│   │   ├── Header.astro          # Logo + nav — FR5, FR23 — compose NavLink
│   │   ├── Footer.astro          # Liens, mentions — FR24
│   │   ├── PageLayout.astro      # Wrapper générique (slot) — FR25
│   │   │                         # ↳ compose Header + Footer en interne
│   │   ├── NavLink.astro         # Lien nav avec état actif — FR4, FR26
│   │   ├── NoteCard.astro        # Carte liste (titre, date, stage, tags) — FR27
│   │   ├── StageBadge.astro      # Badge maturité (existant, migré tokens) — FR7, FR28
│   │   ├── Tag.astro             # Badge tag individuel — FR8, FR29
│   │   └── BacklinkList.astro    # Liste backlinks — FR11, FR30
│   │
│   ├── layouts/
│   │   └── NoteLayout.astro      # Layout note individuelle — FR6–FR11
│   │                             # ↳ calcule backlinks à la compilation
│   │                             # ↳ utilise PageLayout
│   │
│   ├── pages/
│   │   ├── index.astro           # Homepage — notes récentes — FR1, FR3
│   │   ├── styleguide.astro      # Documentation vivante — FR32–FR34
│   │   └── notes/
│   │       ├── index.astro       # Index complet des notes — FR2, JS filtres
│   │       └── [slug].astro      # Page note individuelle — FR6–FR11
│   │
│   ├── styles/
│   │   └── global.css            # @theme {} + @layer base {} UNIQUEMENT
│   │                             # ↳ tokens couleurs + polices (existants)
│   │                             # ↳ tokens espacement/typo/rayons/transitions (nouveaux)
│   │                             # ↳ .wiki-link + .wiki-link--new dans @layer base
│   │
│   └── content/
│       ├── notes/                # symlink → /data/syncthing/notes (IMMUABLE)
│       └── config.ts             # Schéma Zod — NE PAS MODIFIER
│
├── public/                       # Assets statiques (fonts, images)
│
└── dist/                         # Sortie build Astro (gitignored)
```

### Mapping exigences → fichiers

| FR | Composant/Fichier |
|----|------------------|
| FR1 — Homepage notes récentes | `pages/index.astro` |
| FR2 — Index complet | `pages/notes/index.astro` |
| FR3–FR4 — Navigation | `components/NavLink.astro` via `Header.astro` |
| FR5 — Header cohérent | `components/Header.astro` via `PageLayout.astro` |
| FR6 — Lecture note | `layouts/NoteLayout.astro` |
| FR7 — StageBadge | `components/StageBadge.astro` |
| FR8 — Tags | `components/Tag.astro` |
| FR9–FR10 — Wiki-links | `global.css` (`@layer base`) + `remark-wiki-link` |
| FR11 — Backlinks | `components/BacklinkList.astro` + `NoteLayout.astro` |
| FR12–FR16 — Pipeline publication | hors périmètre (Syncthing + systemd) |
| FR17–FR22 — Tokens | `styles/global.css` (`@theme {}`) |
| FR23–FR31 — Composants | `src/components/` |
| FR32–FR34 — Styleguide | `pages/styleguide.astro` |
| FR35–FR37 — Qualité code | Convention + audit grep |

### Frontières architecturales

**Frontière 1 — Tokens (`global.css`)**
Entrée : valeurs visuelles brutes. Sortie : `var(--*)` accessibles dans tous les composants. Aucun composant ne définit de valeur visuelle en dehors de cette frontière.

**Frontière 2 — Composants (`src/components/`)**
Chaque composant est autonome. Entrée : props typées. Sortie : HTML + styles scopés. Seule dépendance inter-composants autorisée : `PageLayout → Header + Footer`.

**Frontière 3 — Content Collections (`src/content/`)**
Immuable. Lecture seule. Schéma Zod dans `content.config.ts` = source de vérité du frontmatter.

**Frontière 4 — Pipeline de build (externe)**
Syncthing → inotifywait → `astro build` → `dist/` → SWAG. Opaque pour les composants.

### Flux de données

```
Obsidian (écriture)
    ↓ Syncthing
src/content/notes/*.md   ←→   content.config.ts (schéma Zod)
    ↓ astro build
    ├── getCollection('notes', publish filter)
    │       ↓
    │   pages/index.astro       → NoteCard → StageBadge, Tag
    │   pages/notes/index.astro → NoteCard → StageBadge, Tag
    │   pages/notes/[slug].astro → NoteLayout → BacklinkList, StageBadge, Tag
    │
    └── global.css (@theme tokens) → var(--*) dans tous les composants
    ↓
dist/ (HTML + CSS statique)
    ↓ SWAG/Nginx
Navigateur (lecture)
```

---

## Validation architecturale

### Cohérence ✅

- Tokens sémantiques → alignés avec Tailwind v4 `@theme`
- PageLayout composant → compatible Astro slots
- Séquence tokens-d'abord → les composants peuvent utiliser `var(--*)` dès leur création
- Zéro `style=""` → enforçable par audit `grep -r 'style="' src/`
- Convention d'extraction (2+ usages → composant) → claire, sans zone grise

### Couverture des exigences ✅

**Fonctionnelles — 37/37 FRs couverts**

| Catégorie | Statut |
|-----------|--------|
| Navigation & structure (FR1–FR5) | ✅ Header, Footer, PageLayout, NavLink |
| Lecture de notes (FR6–FR11) | ✅ NoteLayout, StageBadge, Tag, BacklinkList |
| Publication (FR12–FR16) | ✅ Pipeline existant (hors périmètre) |
| Tokens (FR17–FR22) | ✅ @theme complet, zéro inline |
| Composants (FR23–FR31) | ✅ 8 composants définis |
| Styleguide (FR32–FR34) | ✅ `styleguide.astro` extensible |
| Qualité code (FR35–FR37) | ✅ Conventions + audit grep |

**Non-fonctionnelles — 15/15 NFRs couverts**

| NFR | Couverture |
|-----|-----------|
| Performance (NFR1–NFR4) | ✅ SSG pur, zéro JS ajouté, assets statiques |
| Fiabilité pipeline (NFR5–NFR7) | ✅ Architecture build atomique existante |
| Sécurité (NFR8–NFR9) | ✅ HTTPS SWAG, zéro donnée collectée |
| Accessibilité (NFR10–NFR12) | ✅ Tokens contraste, HTML sémantique via composants |
| Maintenabilité (NFR13–NFR15) | ✅ Styleguide + tokens + composants isolés |

### Lacunes

Aucune lacune critique. Lacune mineure : le contenu détaillé de `/styleguide` (ordre des sections) est laissé à l'implémentation.

### Checklist de complétude

- [x] Analyse du contexte projet et contraintes
- [x] Stack technique verrouillée, versions documentées
- [x] 3 décisions architecturales clés prises collaborativement
- [x] Tokens CSS — scale sémantique complète définie
- [x] 8 composants définis avec rôle et FR associés
- [x] Séquence de migration en 5 phases ordonnées
- [x] 12 règles d'implémentation avec exemples ❌/✅
- [x] Arborescence complète, mapping FR → fichier
- [x] 4 frontières architecturales définies
- [x] Flux de données de bout en bout documenté

### Priorité d'implémentation

**Première action :** Formaliser `@theme {}` dans `global.css` — espacement, typographie, rayons, transitions (couleurs et polices déjà présentes).

**Commande d'audit finale :** `grep -r 'style="' src/` → objectif : 0 résultat.

**Statut : PRÊT POUR IMPLÉMENTATION**
