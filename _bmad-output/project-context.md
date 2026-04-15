---
project_name: 'digitalgarden'
user_name: 'Cyril'
date: '2026-04-13'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
optimized_for_llm: true
---

# Project Context for AI Agents — digitalgarden

_Ce fichier contient les règles critiques que les agents IA doivent respecter lors de l'implémentation de code dans ce projet. Focus sur les détails non-évidents qu'un agent pourrait manquer._

---

## Stack technique & versions

- **Astro** 6.1.4 — SSG uniquement, MPA (Multi-Page Application), zéro hydration par défaut
- **Tailwind CSS** 4.2.2 — via plugin Vite `@tailwindcss/vite` (pas postcss, pas `tailwind.config.js`)
- **@astrojs/mdx** 5.0.3
- **remark-wiki-link** 2.0.1 — transforme `[[slug]]` en liens `/notes/slug`
- **TypeScript** — `content.config.ts` + scripts `<script>` dans les pages Astro
- **Node.js** >= 22.12.0, `"type": "module"` (ES Modules)

---

## Règles d'implémentation critiques

### Design system — contrat fondamental

Ce projet est une **refonte structurelle**. Le style visuel est figé. Aucun changement esthétique.

- **JAMAIS** `style=""` inline dans les fichiers `.astro` — seule exception : valeurs réellement dynamiques (calculées en JS), avec commentaire explicite
- Espacement → `var(--space-*)` (ex: `var(--space-4)` = 16px)
- Couleurs → `var(--color-*)` sémantique (ex: `var(--color-ink)`, jamais `oklch(18% ...)` directement)
- Typographie → `var(--text-*)` (ex: `var(--text-sm)` = 0.875rem)
- Rayons → `var(--radius-*)` (ex: `var(--radius-full)` = 9999px)
- Transitions → `var(--duration-*)` (ex: `var(--duration-fast)` = 150ms)
- Tout pattern utilisé **2+ fois** → extraire en composant `.astro` dédié
- `global.css` contient **uniquement** `@theme {}` et `@layer base {}` — rien d'autre

### Règles Astro

- **Styles** : `<style>` scoped dans chaque composant. Pas de classes globales sauf `var(--token)`
- **Props** : toujours `interface Props {}` dans le frontmatter `---` du composant
- **Classes conditionnelles** : `class:list={[...]}` — pas `className` (syntaxe React)
- **Notes publiées** : toujours filtrer via `getCollection('notes', ({ data }) => data.publish !== false)`
- **Type imports** : `import type { CollectionEntry } from 'astro:content'` (pas de value import)
- **Routing** : fichier = URL. Components → PascalCase. Pages → kebab-case

### Règles Tailwind v4

- Import CSS : `@import "tailwindcss"` (pas `@tailwind base/components/utilities` — syntaxe v3 obsolète)
- Tokens custom : définis dans `@theme {}` comme CSS custom properties, accessibles via `var(--nom)`
- Plugin Vite : `tailwindcss()` dans `vite.plugins` de `astro.config.mjs` — pas de config externe
- Classes utilitaires Tailwind (`flex`, `grid`, etc.) acceptables pour le layout ; **valeurs du design system via tokens uniquement**

### Structure des fichiers

```
src/
├── components/     # PascalCase.astro
├── layouts/        # PascalCase.astro
├── pages/          # kebab-case.astro (routing file-based)
│   └── notes/[slug].astro
├── styles/
│   └── global.css  # @theme + @layer base UNIQUEMENT
└── content/
    └── notes/      # *.md ou *.mdx
```

### Schéma frontmatter des notes

```typescript
{
  title: string                                 // requis
  date: Date                                    // requis (coercé depuis YYYY-MM-DD)
  stage: 'seedling' | 'budding' | 'evergreen'  // requis
  tags: string[]                                // défaut: []
  publish: boolean                              // défaut: false
  description?: string                          // optionnel
}
```

Ne jamais modifier ce schéma sans mettre à jour `src/content.config.ts`.

### Wiki-links et backlinks

- `[[slug]]` → `<a class="wiki-link" href="/notes/slug">` (lien résolu)
- Lien non résolu → classe `wiki-link--new` (pointillé, cursor not-allowed)
- Ces classes sont stylées dans `@layer base` de `global.css` — **ne pas supprimer ni déplacer**
- Backlinks calculés dans `NoteLayout.astro` via recherche de `[[note.id]]` dans `n.body` (corps brut MDX)

### JavaScript client-side

- Quasi-absent — site statique
- Seule exception existante : `notes/index.astro` — filtres stage/tag avec `history.replaceState`
- Fonctions exposées aux handlers `onclick` via `(window as any).fn = fn`
- **Ne pas ajouter de JS client** sans justification explicite

### Composant StageBadge (existant)

- Props : `{ stage: 'seedling'|'budding'|'evergreen', size?: 'sm'|'md' }`
- `size` utilise des classes Tailwind utilitaires pour les dimensions
- Couleurs actuellement hardcodées OKLCH → **migration vers tokens** prévue dans la refonte

---

## Anti-patterns à éviter absolument

| ❌ Interdit | ✅ Correct |
|------------|-----------|
| `style="color: oklch(...)"` | `color: var(--color-ink)` dans `<style>` scoped |
| `style="padding: 16px"` | `padding: var(--space-4)` dans `<style>` scoped |
| `style="border-radius: 999px"` | `border-radius: var(--radius-full)` dans `<style>` scoped |
| Créer un nouveau style ad-hoc | Vérifier `/styleguide` — le token ou composant existe peut-être |
| Modifier le style visuel lors d'une migration | Toute décision = structurelle, jamais esthétique |
| Styles dans `global.css` hors `@theme`/`@layer base` | Tout style de composant dans son `<style>` scoped |
| `import { CollectionEntry }` | `import type { CollectionEntry }` |
| `tailwind.config.js` | Configuration uniquement dans `global.css` via `@theme {}` |

---

## Directives d'utilisation

**Pour les agents IA :**
- Lire ce fichier avant toute implémentation de code
- En cas de doute sur le placement d'un style : composant scoped > global
- Toute valeur visuelle hardcodée est une régression — utiliser un token
- Mettre à jour ce fichier si de nouveaux patterns émergent

**Pour Cyril :**
- Maintenir ce fichier à jour lors des évolutions de stack
- Supprimer les règles devenues évidentes avec le temps

_Dernière mise à jour : 2026-04-13_
