# Story 3.5 : Styles wiki-links et typographie prose

Status: done

<!-- Note: Validation optionnelle. Exécuter validate-create-story pour contrôle qualité avant dev-story. -->

## Story

En tant que visiteur de digitalgarden,
je veux lire les notes avec une typographie soignée et des wiki-links visuellement distincts,
afin de suivre ma curiosité sans friction et sans confusion visuelle.

## Acceptance Criteria

1. **Given** que les tokens sont disponibles (Epic 1)
   **When** j'inspecte `@layer base` dans `global.css`
   **Then** les classes `.wiki-link` et `.wiki-link--new` sont présentes et utilisent des tokens `var(--*)`
   **And** `.wiki-link` a un soulignement solide (`text-decoration: underline solid`)
   **And** `.wiki-link--new` a un soulignement pointillé (`text-decoration: underline dashed`) et `color: var(--color-ink-muted)`

2. **Given** que `NoteLayout.astro` affiche une note avec prose
   **When** j'inspecte les styles de la prose
   **Then** `.prose h2` utilise `var(--text-2xl)`, `var(--font-serif)` (hérité), `font-weight: 400`, `margin-top: var(--space-xl)`
   **And** `.prose h3` utilise `var(--text-xl)`, `font-weight: 400`, `margin-top: var(--space-lg)`
   **And** `.prose blockquote` a une bordure gauche `var(--color-accent-200)`, `padding-left: var(--space-md)`, italic, `var(--color-ink-muted)`
   **And** `.prose code` utilise `var(--color-accent-50)`, `var(--radius-small)`, `var(--font-mono)`
   **And** tous les styles font référence à des tokens — zéro valeur hardcodée pour les propriétés en scope

3. **Given** que les styles sont appliqués
   **When** j'inspecte une note dans le navigateur
   **Then** le rendu est visuellement cohérent avec les specs UX

4. **Given** que les modifications sont appliquées
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur

## Tasks / Subtasks

- [x] Tâche 1 : Corriger les styles de liens dans `@layer base` (AC: #1)
  - [x] `a { }` : remplacer `150ms` par `var(--duration-fast)` dans `transition`
  - [x] `a:hover { }` : remplacer `var(--color-accent-700)` par `var(--color-accent-hover)`
  - [x] `.wiki-link { }` : remplacer `text-decoration-style: dotted` par `text-decoration: underline solid`
  - [x] `.wiki-link--new { }` : remplacer `text-decoration-style: dashed` par `text-decoration: underline dashed`
  - [x] Ajouter `a.wiki-link--new:hover { color: var(--color-ink-muted); }` (fix override `a:hover` — voir section décisions)

- [x] Tâche 2 : Migrer les styles prose vers les tokens (AC: #2)
  - [x] `.prose h2` : `font-size: 1.5rem` → `var(--text-2xl)` ; `margin-top: 2.5em` → `var(--space-xl)` ; ajouter `font-weight: 400`
  - [x] `.prose h3` : `font-size: 1.2rem` → `var(--text-xl)` ; `margin-top: 2em` → `var(--space-lg)` ; ajouter `font-weight: 400`
  - [x] `.prose blockquote` : `padding-left: 1.25em` → `var(--space-md)`
  - [x] `.prose code` : `border-radius: 4px` → `var(--radius-small)`
  - [x] `.prose pre` : `border-radius: 8px` → `var(--radius-medium)`

- [x] Tâche 3 : Valider le build (AC: #4)
  - [x] Exécuter `npm run build` et confirmer 0 erreur

## Dev Notes

### SEUL FICHIER MODIFIÉ : `src/styles/global.css`

Cette story ne touche aucun composant ni aucune page. Toutes les modifications sont dans `@layer base` de `src/styles/global.css`.

### État actuel de `global.css` — diff attendu

#### Liens (section `@layer base`)

**État actuel :**
```css
a {
  color: var(--color-accent-600);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: color 150ms ease;               /* ← à tokeniser */
}

a:hover {
  color: var(--color-accent-700);             /* ← à remplacer par alias */
}

/* Wiki-links (générés par remark-wiki-link) */
.wiki-link {
  color: var(--color-accent-600);
  text-decoration-style: dotted;              /* ← à corriger : doit être solid */
}

/* Lien vers une note qui n'existe pas encore */
.wiki-link--new {
  color: var(--color-ink-muted);
  text-decoration-style: dashed;              /* ← à rendre explicite : underline dashed */
  cursor: not-allowed;
}
```

**État cible :**
```css
a {
  color: var(--color-accent-600);
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
  transition: color var(--duration-fast) ease;  /* ← tokenisé */
}

a:hover {
  color: var(--color-accent-hover);             /* ← alias sémantique (-600) */
}

/* Wiki-links (générés par remark-wiki-link) */
.wiki-link {
  color: var(--color-accent-600);
  text-decoration: underline solid;             /* ← solide pour les liens résolus */
}

/* Lien vers une note qui n'existe pas encore */
.wiki-link--new {
  color: var(--color-ink-muted);
  text-decoration: underline dashed;            /* ← pointillé explicite */
  cursor: not-allowed;
}

/* Override : empêche a:hover d'écraser la couleur wiki-link--new */
a.wiki-link--new:hover {
  color: var(--color-ink-muted);
}
```

#### Prose (section `.prose` dans `@layer base`)

**État actuel — changes ciblés :**

```css
/* h2 — AVANT */
.prose h2 {
  font-size: 1.5rem;           /* ← remplacer par var(--text-2xl) */
  margin-top: 2.5em;           /* ← remplacer par var(--space-xl) */
  margin-bottom: 0.75em;       /* ← conserver tel quel */
  border-bottom: 1px solid var(--color-border);  /* ← conserver */
  padding-bottom: 0.25em;      /* ← conserver tel quel */
  /* font-weight manquant       ← ajouter : 400 */
}

/* h2 — APRÈS */
.prose h2 {
  font-size: var(--text-2xl);
  font-weight: 400;
  margin-top: var(--space-xl);
  margin-bottom: 0.75em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.25em;
}

/* h3 — AVANT */
.prose h3 {
  font-size: 1.2rem;           /* ← remplacer par var(--text-xl) */
  margin-top: 2em;             /* ← remplacer par var(--space-lg) */
  margin-bottom: 0.5em;        /* ← conserver */
  /* font-weight manquant       ← ajouter : 400 */
}

/* h3 — APRÈS */
.prose h3 {
  font-size: var(--text-xl);
  font-weight: 400;
  margin-top: var(--space-lg);
  margin-bottom: 0.5em;
}

/* blockquote — AVANT */
.prose blockquote {
  border-left: 3px solid var(--color-accent-200);  /* ← conserver */
  padding-left: 1.25em;        /* ← remplacer par var(--space-md) */
  color: var(--color-ink-muted);  /* ← conserver */
  font-style: italic;          /* ← conserver */
  margin-block: 1.5em;         /* ← conserver */
}

/* blockquote — APRÈS */
.prose blockquote {
  border-left: 3px solid var(--color-accent-200);
  padding-left: var(--space-md);
  color: var(--color-ink-muted);
  font-style: italic;
  margin-block: 1.5em;
}

/* code — AVANT */
.prose code {
  font-family: var(--font-mono);      /* ← conserver */
  font-size: 0.875em;                 /* ← conserver (em relatif, pas un token rem) */
  background: var(--color-accent-50); /* ← conserver */
  padding: 0.1em 0.35em;             /* ← conserver (em relatif) */
  border-radius: 4px;                 /* ← remplacer par var(--radius-small) */
}

/* code — APRÈS */
.prose code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--color-accent-50);
  padding: 0.1em 0.35em;
  border-radius: var(--radius-small);
}

/* pre — AVANT */
.prose pre {
  background: oklch(14% 0.01 250);   /* ← conserver (hors périmètre — pas de token shadow/dark) */
  color: oklch(90% 0.01 250);        /* ← conserver */
  padding: 1.25em 1.5em;             /* ← conserver (em relatif) */
  border-radius: 8px;                 /* ← remplacer par var(--radius-medium) */
  overflow-x: auto;                  /* ← conserver */
  margin-block: 1.5em;               /* ← conserver */
  font-size: 0.875em;                /* ← conserver */
  line-height: 1.6;                  /* ← conserver */
}

/* pre — APRÈS */
.prose pre {
  background: oklch(14% 0.01 250);
  color: oklch(90% 0.01 250);
  padding: 1.25em 1.5em;
  border-radius: var(--radius-medium);
  overflow-x: auto;
  margin-block: 1.5em;
  font-size: 0.875em;
  line-height: 1.6;
}
```

### Tokens impliqués — noms réels dans `global.css`

> ⚠️ **PIÈGE CRITIQUE** : Le doc UX-spec utilise `--space-10`, `--space-8`, `--space-5`, `--radius-sm`, `--radius-md`. Ces noms planifiés N'EXISTENT PAS. Les AC des epics font autorité — utiliser les noms réels ci-dessous.

| Token réel | Valeur | Remplace |
|------------|--------|---------|
| `--duration-fast` | 150ms | `150ms` dans `a { transition }` |
| `--color-accent-hover` | var(--color-accent-600) | `var(--color-accent-700)` dans `a:hover` |
| `--text-2xl` | 1.5rem | `1.5rem` dans `.prose h2` (même valeur) |
| `--text-xl` | 1.25rem | `1.2rem` dans `.prose h3` (légère différence) |
| `--space-xl` | 40px | `2.5em` dans `.prose h2 margin-top` |
| `--space-lg` | 24px | `2em` dans `.prose h3 margin-top` |
| `--space-md` | 16px | `1.25em` dans `.prose blockquote padding-left` |
| `--radius-small` | 4px | `4px` dans `.prose code border-radius` (même valeur) |
| `--radius-medium` | 8px | `8px` dans `.prose pre border-radius` (même valeur) |

**Valeurs conservées sans token (justification) :**
- `oklch(14% 0.01 250)` et `oklch(90% 0.01 250)` dans `.prose pre` — couleurs dark/light code block sans équivalent sémantique dans le token system (documenté dans deferred-work.md comme hors périmètre)
- `margin-bottom: 0.75em` (h2), `margin-bottom: 0.5em` (h3), `margin-block: 1.5em` (blockquote, pre) — valeurs em relatives au contexte d'affichage, pas de token correspondant dans la grille d'espacement px
- `padding: 0.1em 0.35em` (code), `padding: 1.25em 1.5em` (pre) — idem
- `font-size: 0.875em` (code, pre) — em relatif à l'élément parent, pas un token rem
- `line-height: 1.6` (pre) — pas de token line-height dans le projet
- `letter-spacing`, `text-transform`, `text-underline-offset` — pas de tokens pour ces propriétés

### Décisions de design documentées

**`text-decoration: underline solid` sur `.wiki-link`**
L'état actuel (`text-decoration-style: dotted`) est incorrect — le dotted visuellement ressemble à un lien non-résolu. La spec UX prévoit : résolu = solid, non-résolu = dashed. C'est une correction de bug visuel, pas un changement esthétique.

**`a.wiki-link--new:hover { color: var(--color-ink-muted); }`**
Problème identifié dans deferred-work.md : `a:hover { color: var(--color-accent-700) }` écrase la couleur de `.wiki-link--new` au survol. Le lien apparaît alors avec la couleur accent au lieu de `ink-muted`, ce qui est trompeur (suggère que le lien est résolu). Ce sélecteur plus spécifique corrige ce comportement.

**`a:hover` → `var(--color-accent-hover)` (pas `--color-accent-700`)**
`--color-accent-hover` = `--color-accent-600`. Remplacer `-700` par `-600` est une légère amélioration de lisibilité (couleur moins sombre au hover). Changement visuel mineur — conforme à la règle "toute valeur brute → alias sémantique".

**`font-weight: 400` sur h2/h3 prose**
La règle globale `h1, h2, h3, h4 { }` ne définit pas `font-weight` — le navigateur applique sa valeur par défaut (~700). La spec UX indique explicitement `font-weight: 400` pour les headings prose. Cela donne un rendu plus léger, cohérent avec la typographie editoriale du site (Lora, ton journal).

**`var(--text-xl)` pour `.prose h3` (1.25rem vs 1.2rem actuel)**
Documenté dans deferred-work.md comme un cas à corriger en Story 3.5. La valeur 1.2rem est hors de l'échelle typographique définie — `var(--text-xl)` = 1.25rem est le token le plus proche. Changement de ~1px visuel, acceptable.

**`var(--space-xl)` pour h2 margin-top (40px vs 2.5em = 45px)**
2.5em à la base 18px = 45px. `--space-xl` = 40px. Écart de 5px. Acceptable — l'objectif est la conformité au token system, pas la reproduction pixel-perfect des valeurs em-relatives.

**`var(--space-lg)` pour h3 margin-top (24px vs 2em = 36px)**
Écart plus notable (12px). C'est une conséquence de l'adoption de la grille d'espacement px — 36px n'existe pas dans le token system. `--space-lg` (24px) est le token sémantique le plus approprié pour un espacement de heading. Documenté comme décision intentionnelle.

**`var(--space-md)` pour blockquote padding-left (16px vs 1.25em = 22.5px)**
Écart de 6px. Même logique que ci-dessus — le token le plus proche sémantiquement pour un indentation de blockquote.

### Ce que CETTE story ne fait PAS

- **Ne pas modifier `NoteLayout.astro`** → Epic 4, Story 4.1
- **Ne pas modifier d'autres fichiers que `src/styles/global.css`**
- **Ne pas ajouter `pointer-events: none` sur `.wiki-link--new`** — documenté dans deferred-work.md comme pré-existant mais la spec ne le demande pas explicitement
- **Ne pas migrer `color: oklch(...)` dans `.prose pre`** — explicitement hors périmètre (pas de token dark code block)
- **Ne pas créer de nouveaux tokens** — tous les tokens nécessaires existent déjà dans `@theme`

### Intelligence des stories précédentes

- **`--radius-small`** (pas `--radius-sm`) / **`--radius-medium`** (pas `--radius-md`) — renommés lors du code review Epic 1. Confirmé dans global.css actuel.
- **`--duration-fast`** = 150ms — token créé en Story 1.3, jamais encore utilisé dans `@layer base`. Cette story est la première à le consommer dans les liens globaux.
- **`--color-accent-hover`** = var(--color-accent-600) — alias créé en Story 1.3 pour remplacer les valeurs brutes `-600`.
- **Seul `global.css` est modifié** dans toutes les stories Epic 1 — ce pattern s'applique aussi ici.
- **Build validation** après chaque story — pattern établi.

### Validation

1. Inspection de `global.css` : chercher `grep "150ms\|accent-700\|dotted\|1\.2rem\|2\.5em\|2em\|1\.25em\|border-radius: 4\|border-radius: 8" src/styles/global.css` → doit retourner 0 ligne
2. Vérifier que `a.wiki-link--new:hover` est bien présent après `.wiki-link--new`
3. `npm run build` → 0 erreur
4. Vérification visuelle optionnelle (`npm run dev`) : ouvrir une note avec des wiki-links et des headings

### Commandes utiles

```bash
# Vérifier qu'aucune valeur hardcodée ne subsiste dans les zones modifiées
grep -n "150ms\|accent-700\|: dotted\|: 1\.2rem\|: 2\.5em\|: 2em\|: 1\.25em\|border-radius: 4\|border-radius: 8" src/styles/global.css

# Build de validation
npm run build
```

### References

- Epics : Story 3.5 AC → [Source: epics.md — "Story 3.5 : Styles wiki-links et typographie prose"]
- UX : Patterns de liens → [Source: ux-design-specification.md — "Patterns de liens"]
- UX : Prose typographie → [Source: ux-design-specification.md — "Patterns typographiques (prose)"]
- Travail différé : `.prose code border-radius`, `a transition`, `a:hover override` → [Source: deferred-work.md]
- Token renommage : `--radius-small/medium/pill` → [Source: 1-3-tokens-rayons-transitions-et-aliases-couleur.md]
- Architecture : Règle 6 (tokens), Règle 9 (global.css sacré) → [Source: architecture.md]

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

Aucun — toutes les modifications ont été appliquées directement via les patterns du story file.

### Completion Notes List

- `a { transition }` : `150ms` → `var(--duration-fast)` — premier usage du token dans `@layer base`
- `a:hover { color }` : `var(--color-accent-700)` → `var(--color-accent-hover)` (alias = -600, légèrement moins sombre)
- `.wiki-link` : `text-decoration-style: dotted` → `text-decoration: underline solid` — correction bug visuel (liens résolus apparaissaient pointillés)
- `.wiki-link--new` : `text-decoration-style: dashed` → `text-decoration: underline dashed` — soulignement explicite
- Ajout `a.wiki-link--new:hover { color: var(--color-ink-muted) }` — corrige override `a:hover` documenté dans deferred-work.md
- `.prose h2` : `1.5rem` → `var(--text-2xl)` ; `2.5em` → `var(--space-xl)` ; ajout `font-weight: 400`
- `.prose h3` : `1.2rem` → `var(--text-xl)` ; `2em` → `var(--space-lg)` ; ajout `font-weight: 400`
- `.prose blockquote` : `padding-left: 1.25em` → `var(--space-md)`
- `.prose code` : `border-radius: 4px` → `var(--radius-small)` (même valeur, nom token)
- `.prose pre` : `border-radius: 8px` → `var(--radius-medium)` (même valeur, nom token)
- Grep de validation : 0 valeur hardcodée résiduelle dans les zones modifiées
- Build : 6 pages, 0 erreur

### File List

- src/styles/global.css
