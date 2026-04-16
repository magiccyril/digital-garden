# Story 2.3 : Composant PageLayout (wrapper de page)

Status: done

## Story

En tant que développeur de digitalgarden,
je veux un composant `PageLayout` qui encapsule Header, Footer et le contenu de la page,
afin que chaque nouvelle page n'ait besoin que d'une ligne pour avoir la structure complète.

## Acceptance Criteria

1. **Given** que `Header.astro` et `Footer.astro` existent (Story 2.2)
   **When** je crée `src/layouts/PageLayout.astro`
   **Then** le composant importe et compose `Header` et `Footer` en interne
   **And** les pages n'importent jamais `Header` ou `Footer` directement — uniquement `PageLayout`
   **And** il accepte les props `title: string` et `description?: string` pour les balises `<meta>`
   **And** il expose un `<slot />` entre Header et Footer dans un `<main>` sémantique
   **And** les styles sont dans `<style>` scoped, toutes valeurs visuelles via tokens `var(--*)`

2. **Given** que `PageLayout` est utilisé dans une page test
   **When** j'inspecte le HTML généré
   **Then** la structure contient `<header>`, `<main>`, `<footer>` avec les balises `<meta>` correctes
   **And** le rendu visuel est pixel-perfect identique à `BaseLayout.astro` existant

3. **Given** que tous les composants de layout sont créés
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Créer `src/layouts/PageLayout.astro` (AC: #1, #2)
  - [x] Importer `Header` depuis `../components/Header.astro` et `Footer` depuis `../components/Footer.astro`
  - [x] Importer `../styles/global.css`
  - [x] Définir `interface Props { title: string; description?: string }`
  - [x] Utiliser `Astro.url.pathname` pour la prop `currentPath` de Header
  - [x] Structurer : `<html>` → `<head>` (meta, fonts) → `<body>` → `<Header />` → `<main>` → `<slot />` → `<Footer />`
  - [x] Reproduire le `<head>` complet de `BaseLayout.astro` (meta charset, viewport, description, author, title, Google Fonts, favicon)
  - [x] Styles `<main>` dans `<style>` scoped avec valeurs structurelles documentées (3rem/1.5rem/6rem)

- [x] Tâche 2 : Valider en intégrant PageLayout dans une page existante (AC: #2)
  - [x] Modifier temporairement `src/pages/index.astro` pour utiliser `PageLayout` à la place de `BaseLayout`
  - [x] Build validé avec PageLayout dans index.astro → 0 erreur
  - [x] Revenu à `BaseLayout` dans `index.astro` après validation

- [x] Tâche 3 : Valider le build (AC: #3)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

### Review Findings

- [x] [Review][Defer] `SITE_NAME` / `SITE_AUTHOR` dupliqués dans PageLayout et Footer [PageLayout.astro:16-17] — deferred, documenté dans la spec : BaseLayout sera supprimé en Epic 4, les constantes seront consolidées à ce moment
- [x] [Review][Defer] Absence de meta Open Graph et Twitter card [PageLayout.astro:head] — deferred, hors périmètre Epic 2 ; à adresser lors d'une story dédiée SEO
- [x] [Review][Defer] Absence de `<link rel="canonical">` et meta robots [PageLayout.astro:head] — deferred, hors périmètre Epic 2
- [x] [Review][Defer] Google Fonts chargé sans stratégie de fallback réseau (FOIT/FOUT) [PageLayout.astro:32-35] — deferred, hors périmètre Epic 2
- [x] [Review][Defer] `<html lang="fr">` hardcodé, aucune prop pour surcharger par page [PageLayout.astro:22] — deferred, le site est mono-langue pour l'instant
- [x] [Review][Defer] `title=""` génère " - 18 rue Divona" sans garde [PageLayout.astro:28] — deferred, responsabilité du caller ; faible probabilité d'occurrence
- [x] [Review][Defer] `description=""` contourne le fallback et génère une meta vide [PageLayout.astro:26] — deferred, responsabilité du caller ; faible probabilité d'occurrence

## Dev Notes

### Contexte critique — BaseLayout.astro à reproduire

`PageLayout.astro` remplace fonctionnellement `BaseLayout.astro`. Voici le code source complet de `BaseLayout.astro` pour référence :

**`<head>` à reproduire à l'identique :**
```astro
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content={description} />
  <meta name="author" content={SITE_AUTHOR} />
  <title>{title === SITE_NAME ? title : `${title} - ${SITE_NAME}`}</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500&display=swap"
    rel="stylesheet"
  />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
```

**Constantes à conserver :**
- `SITE_NAME = '18 rue Divona - Digital Garden'`
- `SITE_AUTHOR = 'Cyril G'`

**`<body>` actuel à améliorer :**
```astro
<!-- Existant (à NE PAS reproduire tel quel) -->
<body style="background-color: var(--color-surface); color: var(--color-ink);">
```
→ **Les styles `body` sont inutiles** : `global.css` définit déjà `html { background-color: var(--color-surface); color: var(--color-ink); }` dans `@layer base`. Le `style=""` inline est redondant et doit être supprimé.

**`<main>` actuel :**
```
max-width: 900px; margin: 0 auto; padding: 3rem 1.5rem 6rem;
```

### Gestion du padding `<main>` — tension tokens vs pixel-perfect

Les valeurs de padding actuelles (`3rem 1.5rem 6rem`) ne correspondent pas exactement aux tokens disponibles :
- `3rem` × 18px = **54px** → pas de token exact (entre `--space-xl: 40px` et `--space-2xl: 64px`)
- `1.5rem` × 18px = **27px** → pas de token exact (entre `--space-lg: 24px` et `--space-xl: 40px`)
- `6rem` × 18px = **108px** → pas de token exact

**Décision recommandée :** Utiliser les classes Tailwind utilitaires pour la mise en page structurelle (Règle 7 de l'architecture) car Tailwind v4 maintient les valeurs rem :
- `pt-12` = `3rem` → 54px (pixel-perfect)
- `px-6` = `1.5rem` → 27px (pixel-perfect)
- `pb-24` = `6rem` → 108px (pixel-perfect)

Alternativement, utiliser des valeurs CSS directement dans le `<style>` scoped pour ces valeurs structurelles non répétées :
```css
.page-main {
  max-width: 900px;
  margin: 0 auto;
  padding: 3rem 1.5rem 6rem;
}
```
Ces valeurs de layout structurel (pas du design system visual) peuvent être utilisées directement. La règle des tokens s'applique aux valeurs du design system (couleurs, espacement sémantique) — le `max-width: 900px` et le padding de la page sont des décisions structurelles.

### Implémentation de référence — PageLayout.astro

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
}

const {
  title,
  description = 'Digital garden : notes et réflexions en croissance.'
} = Astro.props;

const SITE_NAME = '18 rue Divona - Digital Garden';
const SITE_AUTHOR = 'Cyril G';
const currentPath = Astro.url.pathname;
---

<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta name="author" content={SITE_AUTHOR} />
    <title>{title === SITE_NAME ? title : `${title} - ${SITE_NAME}`}</title>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500&display=swap"
      rel="stylesheet"
    />

    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>

  <body>
    <Header currentPath={currentPath} />
    <main class="page-main">
      <slot />
    </main>
    <Footer />
  </body>
</html>

<style>
  .page-main {
    max-width: 900px;
    margin: 0 auto;
    padding: 3rem 1.5rem 6rem;
  }
</style>
```

**Points clés :**
- `Astro.url.pathname` est disponible dans les layouts sans configuration supplémentaire
- `<body>` sans `style=""` — les couleurs de base sont dans `@layer base`
- `<style>` dans un layout Astro est bien scoped au composant (Astro le gère correctement)
- Les constantes `SITE_NAME` et `SITE_AUTHOR` sont dupliquées depuis `BaseLayout` — acceptable car `BaseLayout` sera supprimé en Epic 4

### Ce que CETTE story ne fait PAS

- **Ne pas supprimer `BaseLayout.astro`** → BaseLayout reste en place jusqu'à Epic 4 (Stories 4.1–4.3)
- **Ne pas migrer toutes les pages** vers PageLayout → Epic 4
- **La validation en Tâche 2 est temporaire** : modifier `index.astro` pour tester, puis revenir à BaseLayout

### Flux de données `currentPath`

```
PageLayout.astro
  ├── Astro.url.pathname → currentPath
  └── <Header currentPath={currentPath} />
        └── <NavLink active={currentPath.startsWith('/notes')} />
              └── aria-current="page" si active
```

### Intelligence des stories précédentes

- **Story 2.1 (NavLink)** : gère `aria-current` et état actif via prop `active`
- **Story 2.2 (Header/Footer)** : Header accepte `currentPath: string`, Footer sans props
- **Epic 1** : `global.css` → `@layer base` gère les styles de `html` et `body` — pas besoin de `style=""` inline

### Validation

1. `npm run build` pour vérifier l'absence d'erreur de compilation Astro
2. `npm run dev` + test visuel temporaire via `index.astro` → PageLayout (puis revenir)
3. Vérifier avec les outils dev navigateur : structure HTML, meta tags, `aria-current` sur le bon lien

### Commandes

```bash
npm run dev    # validation visuelle
npm run build  # validation finale
```

### Structure des fichiers

```
src/
├── components/
│   ├── NavLink.astro      ← Story 2.1
│   ├── Header.astro       ← Story 2.2
│   └── Footer.astro       ← Story 2.2
└── layouts/
    ├── BaseLayout.astro   ← existant, NE PAS SUPPRIMER
    ├── NoteLayout.astro   ← existant, NE PAS MODIFIER
    └── PageLayout.astro   ← NOUVEAU
```

### Project Structure Notes

- `PageLayout.astro` va dans `src/layouts/` (pas `src/components/`) — convention layouts Astro
- `Header` et `Footer` vont dans `src/components/` — composants autonomes réutilisables
- Après cette story, l'Epic 2 est complet et l'Epic 3 peut démarrer

### References

- Epics : Story 2.3 AC → [Source: epics.md — "Story 2.3 : Composant PageLayout"]
- Architecture : composition PageLayout → [Source: architecture.md — "Composition de PageLayout", Option A]
- Architecture : arborescence projet → [Source: architecture.md — "Arborescence complète post-refonte"]
- Code existant : BaseLayout.astro → [Source: src/layouts/BaseLayout.astro]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

- `PageLayout.astro` créé dans `src/layouts/` — compose Header + Footer en interne
- `Astro.url.pathname` → prop `currentPath` de Header → NavLink `aria-current`
- `<body>` sans `style=""` : `@layer base` dans `global.css` gère les couleurs de base
- Padding `<main>` : valeurs structurelles `3rem 1.5rem 6rem` dans `<style>` scoped (pixel-perfect, pas dans l'échelle des tokens)
- Validation temporaire avec `index.astro` → build propre → revenu à BaseLayout
- `BaseLayout.astro` non supprimé — migration complète = Epic 4

### File List

- src/layouts/PageLayout.astro

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-04-14 | 1.0 | Story créée — inclut décision sur padding structurel vs tokens | create-story |
