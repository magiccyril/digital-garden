---
stepsCompleted: [1, 2, 3, 4]
status: 'complete'
completedAt: '2026-04-13'
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
---

# digitalgarden - Epic Breakdown

## Overview

Ce document décompose les exigences du PRD, de l'Architecture et du Design UX de digitalgarden en epics et stories implémentables.

## Requirements Inventory

### Functional Requirements

FR1: Le visiteur peut accéder à la homepage affichant les notes publiées récentes
FR2: Le visiteur peut accéder à l'index complet des notes publiées
FR3: Le visiteur peut naviguer vers une note individuelle depuis la homepage ou l'index
FR4: Le visiteur peut retourner à la homepage ou à l'index depuis n'importe quelle page
FR5: Le visiteur voit un header cohérent sur toutes les pages avec lien vers l'accueil
FR6: Le visiteur peut lire le contenu complet d'une note publiée
FR7: Le visiteur peut identifier le stade de maturité d'une note via un badge visuel (seedling / budding / evergreen)
FR8: Le visiteur peut voir les tags associés à une note
FR9: Le visiteur peut cliquer sur un wiki-link résolu pour naviguer vers la note liée
FR10: Le visiteur voit visuellement la différence entre un wiki-link résolu et non résolu
FR11: Le visiteur peut consulter la liste des backlinks en bas d'une note
FR12: Cyril peut publier une note en ajoutant `publish: true` dans le frontmatter Obsidian
FR13: Cyril peut définir le stade d'une note via le champ `stage` dans le frontmatter
FR14: Cyril peut associer des tags à une note via le champ `tags` dans le frontmatter
FR15: Le système publie automatiquement les notes marquées après synchronisation Syncthing (pipeline inotifywait → build)
FR16: Les notes sans `publish: true` ne sont jamais exposées sur le site
FR17: Toutes les valeurs d'espacement sont exprimées via des tokens `var(--space-*)`
FR18: Toutes les valeurs de typographie sont exprimées via des tokens `var(--text-*)`
FR19: Toutes les valeurs de couleur sont exprimées via des tokens sémantiques `var(--color-*)`
FR20: Toutes les valeurs de rayon de bordure sont exprimées via des tokens `var(--radius-*)`
FR21: Toutes les valeurs de durée de transition sont exprimées via des tokens `var(--duration-*)`
FR22: Aucun attribut `style=""` inline n'est présent dans les fichiers `.astro` (hors cas dynamiques documentés)
FR23: Le composant `Header` est utilisable de façon autonome dans toute page
FR24: Le composant `Footer` est utilisable de façon autonome dans toute page
FR25: Le composant `PageLayout` encapsule la structure commune à toutes les pages
FR26: Le composant `NavLink` gère l'état actif selon la route courante
FR27: Le composant `NoteCard` affiche le titre, la description, la date et le stade d'une note
FR28: Le composant `StageBadge` affiche le stade de maturité avec son label et sa couleur
FR29: Le composant `Tag` affiche un tag individuel
FR30: Le composant `BacklinkList` affiche la liste des notes qui mentionnent la note courante
FR31: Chaque composant `.astro` contient ses styles dans un bloc `<style>` scoped — zéro dépendance sur des styles globaux hors tokens
FR32: Cyril peut consulter `/styleguide` pour voir tous les composants disponibles avec leurs variantes
FR33: La page `/styleguide` affiche les tokens de design (couleurs, espacement, typographie)
FR34: La page `/styleguide` est extensible — tout nouveau composant peut y être ajouté
FR35: `global.css` contient uniquement `@theme` (tokens) et `@layer base` (resets)
FR36: Tout pattern visuel utilisé 2 fois ou plus est extrait dans un composant dédié
FR37: Le build Astro se termine sans erreur après migration complète

### NonFunctional Requirements

NFR1: Lighthouse Performance ≥ 90 sur les pages principales (homepage, note, index)
NFR2: Aucun JavaScript client-side non explicitement justifié dans le code
NFR3: TTFB < 200ms depuis le réseau local (servi via SWAG/homelab)
NFR4: Assets statiques (CSS, fonts) servis avec en-têtes de cache appropriés
NFR5: Le pipeline inotifywait → astro build se déclenche dans les 5 secondes suivant la détection d'un changement
NFR6: Un échec de build ne casse pas le site existant (le build précédent reste servi)
NFR7: Le service systemd redémarre automatiquement en cas d'arrêt inattendu
NFR8: Le site est exclusivement servi via HTTPS (TLS géré par SWAG)
NFR9: Aucune donnée personnelle collectée ni stockée côté serveur (pas de cookies, pas d'analytics)
NFR10: Contraste de texte ≥ 4.5:1 (WCAG AA — satisfait par la palette existante)
NFR11: Navigation clavier fonctionnelle sur toutes les pages
NFR12: Structure de titres cohérente (h1 → h2 → h3) via les composants
NFR13: Cyril peut comprendre la structure complète du projet en moins de 15 minutes après une absence prolongée
NFR14: L'ajout d'une nouvelle page ne nécessite pas la création d'un nouveau style
NFR15: La page `/styleguide` est mise à jour à chaque ajout de composant

### Additional Requirements

- Migration en une passe unique — pas de refactoring incrémental fichier par fichier
- Séquence de migration : Phase 1 Tokens → Phase 2 Composants → Phase 3 Migration inline → Phase 4 Styleguide → Phase 5 Audit
- Tokens d'espacement sémantiques : `--space-xs` (4px) → `--space-2xl` (64px)
- PageLayout compose Header + Footer en interne (les pages n'importent jamais Header/Footer directement)
- Slugs stables lors de la migration (les backlinks sont calculés à partir des slugs)
- Audit final : `grep -r 'style="' src/` → 0 résultats (hors cas dynamiques documentés)
- Commentaires `// PERSONNALISE :` résiduels à supprimer (~10+)
- Styles wiki-links (`.wiki-link`, `.wiki-link--new`) restent dans `@layer base` — ne pas déplacer

### UX Design Requirements

UX-DR1: Formaliser les tokens d'espacement sémantiques dans `@theme` (`--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 40px`, `--space-2xl: 64px`)
UX-DR2: Formaliser l'échelle typographique complète dans `@theme` (`--text-xs` à `--text-3xl` avec line-heights associées, base 18px sur html)
UX-DR3: Ajouter les alias couleur manquants dans `@theme` (`--color-accent: var(--color-accent-500)`, `--color-accent-hover: var(--color-accent-600)`)
UX-DR4: Implémenter Header avec `<nav>` sémantique, `aria-current="page"` sur le lien actif, lien logo vers homepage
UX-DR5: Implémenter NoteCard avec hover state GPU-only (`translateY(-1px)` + `box-shadow` léger + transition couleur titre vers `color-accent`) en `var(--duration-fast)`
UX-DR6: Migrer StageBadge en remplaçant toutes les valeurs OKLCH hardcodées par des tokens `var(--color-*)` 
UX-DR7: Implémenter Tag avec deux variantes : `interactive` (lien cliquable, hover fond `color-accent-100`) et `static` (span affiché)
UX-DR8: Implémenter BacklinkList qui se masque automatiquement si `backlinks.length === 0`
UX-DR9: Implémenter les 6 styles de liens distincts dans `@layer base` (standard, wiki-link résolu, wiki-link non résolu, externe avec ↗, navigation, backlink)
UX-DR10: Implémenter les patterns de filtrage /notes (filtres stage + tag toujours visibles, toggle actif/inactif, état vide "Aucune note pour ce filtre.")
UX-DR11: Implémenter les patterns typographiques prose dans NoteLayout (h2 `text-2xl`, h3 `text-xl`, blockquote bordure accent, code inline fond accent-50, pre fond sombre, hr)
UX-DR12: Implémenter outline focus visible sur tous les éléments interactifs (`outline: 2px solid var(--color-accent)`, `outline-offset: 2px`) — jamais `outline: none` sans alternative
UX-DR13: Implémenter le breakpoint responsive à 768px (padding horizontal réduit sur mobile, NoteCard méta sous le titre si nécessaire)
UX-DR14: Éléments sémantiques dans PageLayout (`<main>`, `<header>`, `<footer>`) ; cibles tactiles min 44×44px sur mobile

### FR Coverage Map

FR1 : Epic 4 — Homepage affichant les notes récentes
FR2 : Epic 4 — Index complet des notes
FR3 : Epic 4 — Navigation vers une note
FR4 : Epic 2 — Retour depuis n'importe quelle page (NavLink dans Header)
FR5 : Epic 2 — Header cohérent sur toutes les pages
FR6 : Epic 4 — Lecture du contenu complet d'une note
FR7 : Epic 3 — Badge stade de maturité (StageBadge)
FR8 : Epic 3 — Tags associés à une note (Tag)
FR9 : Epic 3 — Wiki-link résolu cliquable
FR10 : Epic 3 — Distinction wiki-link résolu/non résolu
FR11 : Epic 3 — Backlinks (BacklinkList)
FR12 : Epic 4 — Publication via `publish: true`
FR13 : Epic 4 — Stage via frontmatter
FR14 : Epic 4 — Tags via frontmatter
FR15 : Epic 4 — Pipeline automatique Syncthing → build
FR16 : Epic 4 — Notes sans publish:true jamais exposées
FR17 : Epic 1 — Tokens espacement `var(--space-*)`
FR18 : Epic 1 — Tokens typographie `var(--text-*)`
FR19 : Epic 1 — Tokens couleur `var(--color-*)`
FR20 : Epic 1 — Tokens rayons `var(--radius-*)`
FR21 : Epic 1 — Tokens transitions `var(--duration-*)`
FR22 : Epic 4 — Zéro `style=""` inline (audit final)
FR23 : Epic 2 — Composant Header autonome
FR24 : Epic 2 — Composant Footer autonome
FR25 : Epic 2 — Composant PageLayout
FR26 : Epic 2 — Composant NavLink avec état actif
FR27 : Epic 3 — Composant NoteCard
FR28 : Epic 3 — Composant StageBadge
FR29 : Epic 3 — Composant Tag
FR30 : Epic 3 — Composant BacklinkList
FR31 : Epics 2 & 3 — Styles dans `<style>` scoped
FR32 : Epic 5 — /styleguide avec tous composants et variantes
FR33 : Epic 5 — /styleguide affiche les tokens
FR34 : Epic 5 — /styleguide extensible
FR35 : Epic 1 — global.css uniquement @theme + @layer base
FR36 : Epic 3 — Convention d'extraction (2+ usages → composant)
FR37 : Epic 4 — Build Astro sans erreur après migration

UX-DR1 : Epic 1 — Tokens espacement sémantiques
UX-DR2 : Epic 1 — Échelle typographique complète
UX-DR3 : Epic 1 — Aliases couleur accent/accent-hover
UX-DR4 : Epic 2 — Header accessible (aria-current, nav sémantique)
UX-DR5 : Epic 3 — NoteCard hover GPU-only
UX-DR6 : Epic 3 — StageBadge migré vers tokens
UX-DR7 : Epic 3 — Tag variantes interactive/static
UX-DR8 : Epic 3 — BacklinkList masquée si vide
UX-DR9 : Epic 3 — 6 styles de liens distincts
UX-DR10 : Epic 4 — Patterns filtrage /notes
UX-DR11 : Epic 3 — Patterns typographiques prose
UX-DR12 : Epic 2 — Focus outline visible (accessibilité)
UX-DR13 : Epic 4 — Responsive 768px
UX-DR14 : Epic 2 — Éléments sémantiques dans PageLayout

NFR1–4 : Epic 4 — Performance (Lighthouse, TTFB, cache, zéro JS)
NFR5–7 : Hors périmètre — Pipeline existant (Syncthing, systemd)
NFR8–9 : Hors périmètre — HTTPS SWAG, zéro données
NFR10–12 : Epics 2 & 3 — Accessibilité (contraste, clavier, sémantique)
NFR13–15 : Epic 5 — Maintenabilité (styleguide, < 15 min, extensible)

## Epic List

### Epic 1 : Fondation du Design System (Tokens)
Cyril peut nommer toutes les valeurs visuelles du projet par leur rôle sémantique — plus aucune valeur magique dans le code. C'est le contrat de base que tous les composants respecteront.
**FRs couverts :** FR17, FR18, FR19, FR20, FR21, FR35
**UX-DRs couverts :** UX-DR1, UX-DR2, UX-DR3

### Epic 2 : Composants de Layout
Cyril peut construire n'importe quelle page en assemblant `PageLayout` (qui compose `Header` + `Footer` en interne) et `NavLink`. Toutes les pages partagent une structure cohérente, accessible et sans styles inline.
**FRs couverts :** FR4, FR5, FR23, FR24, FR25, FR26, FR31 (layout)
**UX-DRs couverts :** UX-DR4, UX-DR12, UX-DR14
**NFRs couverts :** NFR10, NFR11, NFR12

### Epic 3 : Composants de Contenu
Cyril peut représenter n'importe quelle note avec des composants dédiés et isolés : `NoteCard`, `StageBadge`, `Tag`, `BacklinkList`. Les styles wiki-links et les patterns typographiques prose sont formalisés.
**FRs couverts :** FR7, FR8, FR9, FR10, FR11, FR27, FR28, FR29, FR30, FR31 (contenu), FR36
**UX-DRs couverts :** UX-DR5, UX-DR6, UX-DR7, UX-DR8, UX-DR9, UX-DR11

### Epic 4 : Migration des Pages
Le site est pixel-perfect et sans dette inline. Toutes les pages existantes utilisent exclusivement les nouveaux composants et tokens — zéro `style=""` inline, build propre, comportements existants préservés.
**FRs couverts :** FR1, FR2, FR3, FR6, FR12, FR13, FR14, FR15, FR16, FR22, FR37
**UX-DRs couverts :** UX-DR10, UX-DR13
**NFRs couverts :** NFR1, NFR2, NFR3, NFR4

### Epic 5 : Page Styleguide
Cyril peut consulter `/styleguide` et identifier en moins d'une minute tous les composants disponibles avec leurs variantes et les tokens du design system.
**FRs couverts :** FR32, FR33, FR34
**NFRs couverts :** NFR13, NFR14, NFR15

## Epic 1 : Fondation du Design System (Tokens)

Cyril peut nommer toutes les valeurs visuelles du projet par leur rôle sémantique — plus aucune valeur magique dans le code. C'est le contrat de base que tous les composants respecteront.

### Story 1.1 : Tokens d'espacement sémantiques

En tant que développeur de digitalgarden,
je veux que tous les espacements soient définis comme tokens sémantiques nommés dans `@theme`,
afin de ne jamais avoir à utiliser une valeur magique pour l'espacement.

**Acceptance Criteria:**

**Given** que `global.css` contient un bloc `@theme {}`
**When** j'ajoute les tokens d'espacement
**Then** les 6 tokens suivants existent : `--space-xs: 4px`, `--space-sm: 8px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 40px`, `--space-2xl: 64px`
**And** ces tokens sont accessibles via `var(--space-xs)` etc. dans tout fichier `.astro`

**Given** que le bloc `@theme {}` est en place
**When** j'inspecte `global.css`
**Then** le fichier contient uniquement `@theme {}` et `@layer base {}` — aucun style de composant

### Story 1.2 : Échelle typographique complète

En tant que développeur de digitalgarden,
je veux que toutes les tailles de texte soient définies comme tokens dans `@theme`,
afin de garantir une typographie cohérente sans valeurs hardcodées.

**Acceptance Criteria:**

**Given** que les tokens d'espacement sont en place (Story 1.1)
**When** j'ajoute l'échelle typographique
**Then** les tokens suivants existent : `--text-xs: 0.75rem`, `--text-sm: 0.875rem`, `--text-base: 1rem`, `--text-lg: 1.125rem`, `--text-xl: 1.25rem`, `--text-2xl: 1.5rem`, `--text-3xl: 2rem`
**And** la base HTML est définie à `font-size: 112.5%` (18px) dans `@layer base`

**Given** que les tokens typographiques existent
**When** j'inspecte le rendu d'une page existante
**Then** les tailles de texte sont visuellement identiques à l'état pré-refonte (pixel-perfect)

### Story 1.3 : Tokens de rayons, transitions et aliases couleur

En tant que développeur de digitalgarden,
je veux que les rayons de bordure, durées de transition et aliases couleur soient des tokens nommés,
afin de disposer d'un système de design complet dans `@theme`.

**Acceptance Criteria:**

**Given** que les tokens espacement et typographie sont en place
**When** j'ajoute les tokens restants
**Then** les rayons existent : `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-full: 9999px`
**And** les transitions existent : `--duration-fast: 150ms`, `--duration-base: 200ms`
**And** les aliases couleur existent : `--color-accent: var(--color-accent-500)`, `--color-accent-hover: var(--color-accent-600)`

**Given** que tous les tokens sont définis
**When** j'exécute `npm run build`
**Then** le build se termine sans erreur et le rendu visuel est pixel-perfect identique à l'état pré-refonte

## Epic 2 : Composants de Layout

Cyril peut construire n'importe quelle page en assemblant `PageLayout` (qui compose `Header` + `Footer` en interne) et `NavLink`. Toutes les pages partagent une structure cohérente, accessible et sans styles inline.

### Story 2.1 : Composant NavLink avec état actif

En tant que visiteur de digitalgarden,
je veux que les liens de navigation indiquent clairement la page courante,
afin de savoir où je me trouve dans le site à tout moment.

**Acceptance Criteria:**

**Given** que les tokens de l'Epic 1 sont disponibles
**When** je crée `src/components/NavLink.astro`
**Then** le composant accepte les props `href: string`, `label: string`, `active: boolean`
**And** les styles sont dans un bloc `<style>` scoped — zéro `style=""` inline
**And** toutes les valeurs CSS utilisent des tokens `var(--*)` (couleur, transition)

**Given** que `active` est `true`
**When** le composant est rendu
**Then** le lien a `aria-current="page"` et un style visuel distinct (`font-weight: 500`, `color-ink`)

**Given** que `active` est `false`
**When** le visiteur survole le lien
**Then** la couleur transite vers `var(--color-ink)` en `var(--duration-fast)` — uniquement sur `color`

### Story 2.2 : Composants Header et Footer

En tant que visiteur de digitalgarden,
je veux trouver un header cohérent sur toutes les pages avec accès à la navigation,
afin de pouvoir me déplacer dans le site depuis n'importe quelle page.

**Acceptance Criteria:**

**Given** que `NavLink.astro` existe (Story 2.1)
**When** je crée `src/components/Header.astro`
**Then** le composant utilise `<header>` et `<nav>` sémantiques
**And** il importe et utilise `NavLink` pour chaque lien de navigation
**And** il accepte une prop `currentPath: string` pour déterminer le lien actif
**And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

**When** je crée `src/components/Footer.astro`
**Then** le composant utilise `<footer>` sémantique, sans props requises
**And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

**Given** que Header et Footer sont créés
**When** j'exécute `npm run build`
**Then** le build se termine sans erreur

### Story 2.3 : Composant PageLayout (wrapper de page)

En tant que développeur de digitalgarden,
je veux un composant `PageLayout` qui encapsule Header, Footer et le contenu de la page,
afin que chaque nouvelle page n'ait besoin que d'une ligne pour avoir la structure complète.

**Acceptance Criteria:**

**Given** que `Header.astro` et `Footer.astro` existent (Story 2.2)
**When** je crée `src/layouts/PageLayout.astro`
**Then** le composant importe et compose `Header` et `Footer` en interne (les pages n'importent jamais Header/Footer directement)
**And** il accepte les props `title: string` et `description?: string` pour les balises `<meta>`
**And** il expose un `<slot />` entre Header et Footer dans un `<main>` sémantique
**And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

**Given** que `PageLayout` est utilisé dans une page test
**When** j'inspecte le HTML généré
**Then** la structure contient `<header>`, `<main>`, `<footer>` avec les balises `<meta>` correctes
**And** le rendu visuel est pixel-perfect identique à `BaseLayout.astro` existant

**Given** que tous les composants de layout sont créés
**When** j'exécute `npm run build`
**Then** le build se termine sans erreur

## Epic 3 : Composants de Contenu

Cyril peut représenter n'importe quelle note avec des composants dédiés et isolés : `NoteCard`, `StageBadge`, `Tag`, `BacklinkList`. Les styles wiki-links et les patterns typographiques prose sont formalisés.

### Story 3.1 : Migrer StageBadge vers les tokens

En tant que visiteur de digitalgarden,
je veux voir le stade de maturité de chaque note via un badge cohérent avec le design system,
afin d'identifier immédiatement le degré de développement d'une idée.

**Acceptance Criteria:**

**Given** que les tokens couleur existent (Epic 1)
**When** je modifie `src/components/StageBadge.astro`
**Then** toutes les valeurs OKLCH hardcodées sont remplacées par des tokens `var(--color-*)`
**And** les props restent identiques : `stage: 'seedling' | 'budding' | 'evergreen'`, `size?: 'sm' | 'md'`
**And** les styles sont dans `<style>` scoped — zéro `style=""` inline

**Given** que StageBadge est migré
**When** j'inspecte les trois variantes (seedling, budding, evergreen)
**Then** le rendu visuel est pixel-perfect identique à l'état pré-migration

### Story 3.2 : Composant Tag (variantes interactive/static)

En tant que visiteur de digitalgarden,
je veux voir et interagir avec les tags associés à une note,
afin d'identifier les thèmes et naviguer par tag.

**Acceptance Criteria:**

**Given** que les tokens sont disponibles (Epic 1)
**When** je crée `src/components/Tag.astro`
**Then** le composant accepte les props `label: string`, `href?: string`
**And** si `href` est fourni, le composant rend un `<a>` (variante interactive)
**And** si `href` est absent, le composant rend un `<span>` (variante static)
**And** les styles sont dans `<style>` scoped avec toutes valeurs via tokens

**Given** que la variante interactive est rendue
**When** le visiteur survole le tag
**Then** le fond transite vers `var(--color-accent-100)` en `var(--duration-fast)`

### Story 3.3 : Composant NoteCard avec hover state

En tant que visiteur de digitalgarden,
je veux voir les notes sous forme de cartes cliquables avec leurs métadonnées,
afin de choisir quelle note lire depuis la homepage ou l'index.

**Acceptance Criteria:**

**Given** que `StageBadge.astro` et `Tag.astro` existent (Stories 3.1, 3.2)
**When** je crée `src/components/NoteCard.astro`
**Then** le composant accepte les props `title: string`, `slug: string`, `date: Date`, `stage: string`, `description?: string`, `tags?: string[]`
**And** il compose `StageBadge` pour afficher le stade et `Tag` (variante static) pour les tags
**And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

**Given** que NoteCard est rendu
**When** le visiteur survole la carte
**Then** le titre transite vers `var(--color-accent)` en `var(--duration-fast)`
**And** la carte applique `transform: translateY(-1px)` et un `box-shadow` léger — GPU only (pas de changement de layout)

**Given** que NoteCard est rendu
**When** j'inspecte le HTML
**Then** le lien englobant contient un titre lisible (accessible au lecteur d'écran)

### Story 3.4 : Composant BacklinkList

En tant que visiteur de digitalgarden,
je veux voir quelles autres notes mentionnent la note que je lis,
afin de découvrir des connexions entre mes idées.

**Acceptance Criteria:**

**Given** que les tokens sont disponibles (Epic 1)
**When** je crée `src/components/BacklinkList.astro`
**Then** le composant accepte la prop `backlinks: Array<{title: string, slug: string}>`
**And** les styles sont dans `<style>` scoped, toutes valeurs via tokens

**Given** que `backlinks` contient au moins un élément
**When** le composant est rendu
**Then** la section est visible avec la liste des liens vers les notes mentionnantes

**Given** que `backlinks` est un tableau vide
**When** le composant est rendu
**Then** la section est entièrement masquée (pas d'espace vide visible)

### Story 3.5 : Styles wiki-links et typographie prose

En tant que visiteur de digitalgarden,
je veux lire les notes avec une typographie soignée et des wiki-links visuellement distincts,
afin de suivre ma curiosité sans friction et sans confusion visuelle.

**Acceptance Criteria:**

**Given** que les tokens sont disponibles (Epic 1)
**When** j'inspecte `@layer base` dans `global.css`
**Then** les classes `.wiki-link` et `.wiki-link--new` sont présentes et utilisent des tokens `var(--*)`
**And** `.wiki-link` a un soulignement solide (`text-decoration: underline solid`)
**And** `.wiki-link--new` a un soulignement pointillé (`text-decoration: underline dashed`) et `var(--color-ink-muted)`

**Given** que `NoteLayout.astro` affiche une note avec prose
**When** j'inspecte les styles de la prose
**Then** `h2` utilise `var(--text-2xl)`, serif, `font-weight: 400`, `margin-top: var(--space-xl)`
**And** `h3` utilise `var(--text-xl)`, serif, `font-weight: 400`, `margin-top: var(--space-lg)`
**And** `blockquote` a une bordure gauche `var(--color-accent-200)`, `padding-left: var(--space-md)`, italique, `var(--color-ink-muted)`
**And** `code` inline utilise `var(--color-accent-50)`, `var(--radius-sm)`, `font-mono`
**And** tous les styles sont via tokens — zéro valeur hardcodée

**Given** que les styles sont appliqués
**When** j'inspecte une note dans le navigateur
**Then** le rendu est pixel-perfect identique à l'état pré-refonte

## Epic 4 : Migration des Pages

Le site est pixel-perfect et sans dette inline. Toutes les pages existantes utilisent exclusivement les nouveaux composants et tokens — zéro `style=""` inline, build propre, comportements existants préservés.

### Story 4.1 : Migrer NoteLayout.astro

En tant que visiteur de digitalgarden,
je veux lire une note dans un layout propre assemblé à partir de composants,
afin de bénéficier d'une expérience de lecture cohérente avec le reste du site.

**Acceptance Criteria:**

**Given** que `PageLayout`, `StageBadge`, `Tag`, `BacklinkList` et les styles prose existent (Epics 2 & 3)
**When** je migre `src/layouts/NoteLayout.astro`
**Then** il utilise `PageLayout` pour la structure (header + footer inclus)
**And** il utilise `StageBadge`, `Tag`, `BacklinkList` comme composants
**And** il ne contient aucun attribut `style=""` inline
**And** toutes les valeurs CSS sont via tokens `var(--*)`
**And** le calcul des backlinks (`grep [[note.id]]` dans `n.body`) est préservé à l'identique

**Given** que NoteLayout est migré
**When** j'ouvre une note dans le navigateur
**Then** le rendu visuel est pixel-perfect identique à l'état pré-migration
**And** les wiki-links résolus et non résolus s'affichent avec leurs styles distincts
**And** la section backlinks apparaît si des backlinks existent, est masquée sinon

### Story 4.2 : Migrer pages/index.astro (homepage)

En tant que visiteur de digitalgarden,
je veux arriver sur la homepage et voir les notes récentes publiées avec leur mise en page familière,
afin de reprendre ma navigation là où je l'avais laissée.

**Acceptance Criteria:**

**Given** que `PageLayout` et `NoteCard` existent (Epics 2 & 3)
**When** je migre `src/pages/index.astro`
**Then** la page utilise `PageLayout` pour la structure
**And** elle utilise `NoteCard` pour chaque note publiée
**And** le filtre `getCollection('notes', ({ data }) => data.publish !== false)` est préservé à l'identique
**And** elle ne contient aucun attribut `style=""` inline
**And** toutes les valeurs CSS sont via tokens dans `<style>` scoped

**Given** que la homepage est migrée
**When** j'ouvre la homepage dans le navigateur
**Then** le rendu visuel est pixel-perfect identique à l'état pré-migration
**And** seules les notes avec `publish: true` sont affichées

### Story 4.3 : Migrer pages/notes/index.astro (index + filtres)

En tant que visiteur de digitalgarden,
je veux parcourir l'index complet des notes avec les filtres par stage et tag,
afin de trouver rapidement les notes qui m'intéressent.

**Acceptance Criteria:**

**Given** que `PageLayout`, `NoteCard`, `Tag` et `StageBadge` existent (Epics 2 & 3)
**When** je migre `src/pages/notes/index.astro`
**Then** la page utilise `PageLayout` pour la structure et `NoteCard` pour chaque note
**And** les filtres stage + tag sont toujours visibles (pas de dropdown caché)
**And** le comportement JS existant (`history.replaceState`, `(window as any).fn`) est préservé à l'identique
**And** l'état vide affiche "Aucune note pour ce filtre." en `var(--color-ink-muted)`, `var(--text-sm)`, centré
**And** elle ne contient aucun attribut `style=""` inline hors cas dynamiques documentés

**Given** que l'index est migré
**When** j'ouvre `/notes` dans le navigateur et filtre par stage ou tag
**Then** les filtres fonctionnent identiquement à l'état pré-migration
**And** le rendu visuel est pixel-perfect identique

**Given** que l'index est migré sur mobile (< 768px)
**When** j'inspecte la mise en page
**Then** le padding horizontal est `var(--space-md)` (réduit vs desktop)
**And** les filtres permettent le scroll horizontal si nécessaire

### Story 4.4 : Audit final et nettoyage de la dette résiduelle

En tant que développeur de digitalgarden,
je veux vérifier que la migration est complète et sans reste de dette inline,
afin de garantir que le contrat du design system est respecté dans l'intégralité du code.

**Acceptance Criteria:**

**Given** que toutes les pages sont migrées (Stories 4.1–4.3)
**When** j'exécute `grep -r 'style="' src/`
**Then** la commande retourne 0 résultat (hors cas dynamiques explicitement commentés `<!-- style dynamique justifié -->`)

**Given** que l'audit grep est propre
**When** j'exécute `grep -r '// PERSONNALISE' src/`
**Then** la commande retourne 0 résultat (commentaires résiduels supprimés)

**Given** que le code est nettoyé
**When** j'exécute `npm run build`
**Then** le build se termine sans erreur ni warning

**Given** que le build est propre
**When** j'ouvre les pages homepage, index et une note dans le navigateur
**Then** le rendu visuel de chacune est pixel-perfect identique à l'état pré-refonte

## Epic 5 : Page Styleguide

Cyril peut consulter `/styleguide` et identifier en moins d'une minute tous les composants disponibles avec leurs variantes et les tokens du design system.

### Story 5.1 : Page /styleguide avec section tokens

En tant que développeur de digitalgarden,
je veux une page `/styleguide` affichant tous les tokens du design system,
afin de connaître d'un coup d'œil les valeurs disponibles sans ouvrir `global.css`.

**Acceptance Criteria:**

**Given** que tous les tokens sont définis (Epic 1) et que `PageLayout` existe (Epic 2)
**When** je crée `src/pages/styleguide.astro`
**Then** la page utilise `PageLayout` pour la structure
**And** elle affiche une section "Tokens" avec : palette couleur (swatches), échelle d'espacement (boîtes), échelle typographique (texte de démonstration), rayons (boîtes avec border-radius), transitions (labels)
**And** la page est accessible via `/styleguide` dans le navigateur

**Given** que la page styleguide est ouverte
**When** j'inspecte son code
**Then** elle ne contient aucun `style=""` inline et toutes les valeurs CSS sont via tokens

### Story 5.2 : Documentation de tous les composants dans le styleguide

En tant que développeur de digitalgarden,
je veux voir tous les composants disponibles avec leurs variantes dans le styleguide,
afin de savoir exactement ce qui existe et comment l'utiliser avant d'écrire une ligne de code.

**Acceptance Criteria:**

**Given** que tous les composants existent (Epics 2 & 3) et que la page styleguide existe (Story 5.1)
**When** j'ajoute la section "Composants" à `styleguide.astro`
**Then** chaque composant est documenté avec ses variantes réelles rendues en live :
`StageBadge` (seedling/budding/evergreen, sm/md), `Tag` (interactive/static), `NoteCard` (avec/sans description), `BacklinkList` (avec backlinks/état vide), `NavLink` (actif/inactif), `Header`, `Footer`

**Given** que la section "Composants" est ajoutée
**When** j'ouvre `/styleguide` dans le navigateur
**Then** je peux identifier en moins d'une minute tous les composants disponibles et leurs variantes
**And** chaque composant affiché est le vrai composant Astro importé — pas une copie de code

**Given** qu'un nouveau composant est créé ultérieurement
**When** je l'ajoute à `styleguide.astro`
**Then** il s'intègre naturellement dans la structure existante de la page
