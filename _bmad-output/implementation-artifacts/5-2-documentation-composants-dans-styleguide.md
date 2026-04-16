# Story 5.2 : Documentation des composants dans le styleguide

Status: review

## Story

En tant que développeur de digitalgarden,
je veux voir tous les composants disponibles avec leurs variantes dans le styleguide,
afin de savoir exactement ce qui existe et comment l'utiliser avant d'écrire une ligne de code.

## Acceptance Criteria

1. **Given** que tous les composants existent (Epics 2 & 3) et que la page styleguide existe (Story 5.1)
   **When** j'ajoute la section "Composants" à `styleguide.astro`
   **Then** chaque composant est documenté avec ses variantes réelles rendues en live :
   `StageBadge` (seedling/budding/evergreen, sm/md), `Tag` (interactive/static), `NoteCard` (avec/sans description), `BacklinkList` (avec backlinks/état vide), `NavLink` (actif/inactif), `Header`, `Footer`

2. **Given** que la section "Composants" est ajoutée
   **When** j'ouvre `/styleguide` dans le navigateur
   **Then** je peux identifier en moins d'une minute tous les composants disponibles et leurs variantes
   **And** chaque composant affiché est le vrai composant Astro importé — pas une copie de code

3. **Given** qu'un nouveau composant est créé ultérieurement
   **When** je l'ajoute à `styleguide.astro`
   **Then** il s'intègre naturellement dans la structure existante de la page

4. **Given** que la section est ajoutée
   **When** j'inspecte le code de `styleguide.astro`
   **Then** aucun `style=""` inline n'est présent et toutes les valeurs CSS sont via tokens

5. **Given** que la section est ajoutée
   **When** j'exécute `npm run build`
   **Then** le build se termine sans erreur (7 pages générées)

## Tasks / Subtasks

- [x] Tâche 1 : Ajouter les imports `Header` et `Footer` dans `styleguide.astro` (AC: #2)
  - [x] Ajouter `import Header from '../components/Header.astro'`
  - [x] Ajouter `import Footer from '../components/Footer.astro'`
  - [x] Note : `NoteCard`, `StageBadge`, `Tag`, `BacklinkList`, `NavLink` sont déjà importés (Story 5.1)

- [x] Tâche 2 : Ajouter les données d'exemple en frontmatter (AC: #2)
  - [x] Vérifier que `demoBacklinks` est défini (déjà créé en Story 5.1)
  - [x] Vérifier que `demoNote` est défini (déjà créé en Story 5.1)

- [x] Tâche 3 : Remplacer le commentaire placeholder par la section Composants (AC: #1, #2)
  - [x] Remplacer `<!-- Cette section sera ajoutée dans Story 5.2 -->` par le bloc HTML complet
  - [x] `StageBadge` : 6 variantes (3 stages × 2 sizes)
  - [x] `Tag` : variante static (sans href) et interactive (avec href)
  - [x] `NavLink` : variante inactif et actif
  - [x] `NoteCard` : avec description + tags, et sans description
  - [x] `BacklinkList` : avec backlinks (visible) et vide (masqué)
  - [x] `Header` : rendu direct avec `currentPath="/styleguide"`
  - [x] `Footer` : rendu direct sans props

- [x] Tâche 4 : Ajouter les styles scoped pour la section Composants (AC: #4)
  - [x] `.sg-component`, `.sg-component__name`, `.sg-component__props`
  - [x] `.sg-preview`, `.sg-preview--full-width`
  - [x] `.sg-variant-label`, `.sg-empty-note`
  - [x] `.sg-notelist`, `.sg-notelist__item` (pour NoteCard en contexte liste)

- [x] Tâche 5 : Valider (AC: #4, #5)
  - [x] `grep 'style="' src/pages/styleguide.astro` → 0 résultat
  - [x] `npm run build` → 0 erreur, 7 pages générées

## Dev Notes

### Fichier cible

```
src/pages/styleguide.astro   ← MODIFIER (ajout de la section Composants)
```

Story 5.2 **modifie** `styleguide.astro` créé en Story 5.1 — elle n'est pas un fichier séparé.

### Ancre du placeholder à remplacer

Dans `styleguide.astro` (créé en Story 5.1), le marqueur de remplacement exact est :

```html
  <!-- ══════════════════════════════════════════
       SECTION COMPOSANTS (Story 5.2)
       ══════════════════════════════════════════ -->
  <!-- Cette section sera ajoutée dans Story 5.2 -->
```

**Remplacer ce bloc entier** par la section composants complète.

### Imports à ajouter en frontmatter

Story 5.1 a déjà déclaré les imports suivants :
```astro
import NoteCard from '../components/NoteCard.astro';
import StageBadge from '../components/StageBadge.astro';
import Tag from '../components/Tag.astro';
import BacklinkList from '../components/BacklinkList.astro';
import NavLink from '../components/NavLink.astro';
```

Ajouter uniquement :
```astro
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
```

**Exception architecturale documentée :** `Header` et `Footer` sont normalement importés uniquement par `PageLayout`. Leur import direct dans `styleguide.astro` est une exception justifiée car le styleguide doit montrer *tous* les composants, y compris ceux normalement transparents. Cette exception est propre à cette page.

### Props réelles de chaque composant (état actuel du code)

**`StageBadge`**
```astro
<!-- Props: stage (requis), size (optionnel, défaut 'md') -->
<StageBadge stage="seedling" />                   <!-- md (défaut) -->
<StageBadge stage="budding" />
<StageBadge stage="evergreen" />
<StageBadge stage="seedling" size="sm" />
<StageBadge stage="budding" size="sm" />
<StageBadge stage="evergreen" size="sm" />
```
⚠️ `StageBadge` utilise en interne des classes Tailwind pour les tailles (`text-xs px-2 py-0.5` pour `sm`, `text-sm px-3 py-1` pour `md`). C'est normal — ne pas y toucher.

**`Tag`**
```astro
<!-- Sans href → <span class="tag tag--static"> -->
<Tag label="design" />
<!-- Avec href → <a class="tag tag--interactive"> -->
<Tag label="développement" href="/notes?tag=développement" />
```

**`NavLink`**
```astro
<!-- Props: href, label, active (boolean) -->
<NavLink href="/notes" label="Notes" active={false} />
<NavLink href="/styleguide" label="Styleguide" active={true} />
```
`active={true}` applique `aria-current="page"` + `font-weight: 500`.

**`NoteCard`**
```astro
<!-- Props: title, slug, date (Date object!), stage, description?, tags? -->
<!-- Variante complète -->
<NoteCard
  title="Note avec description et tags"
  slug="example-complete"
  date={new Date('2026-03-01')}
  stage="budding"
  description="Description courte de la note, quelques mots illustratifs."
  tags={["design", "tokens"]}
/>
<!-- Variante minimale (sans description) -->
<NoteCard
  title="Note sans description (evergreen)"
  slug="example-minimal"
  date={new Date('2026-01-15')}
  stage="evergreen"
/>
```
⚠️ `date` est un objet `Date` JavaScript — **pas une string**. `new Date('2026-03-01')` dans le frontmatter Astro.
⚠️ `slug` est utilisé pour construire `href={/notes/${slug}}` — le lien `example-complete` sera cassé (404) mais c'est normal dans un styleguide.

**`BacklinkList`**
```astro
<!-- Avec backlinks — VISIBLE -->
<BacklinkList backlinks={demoBacklinks} />
<!-- Tableau vide — INVISIBLE (le composant se masque entièrement) -->
<BacklinkList backlinks={[]} />
```
`demoBacklinks` défini en frontmatter Story 5.1 :
```astro
const demoBacklinks = [
  { title: 'Note qui mentionne celle-ci', slug: 'other-note' },
  { title: 'Une autre note liée', slug: 'another-linked-note' },
];
```

**`Header`**
```astro
<!-- Props: currentPath (string) -->
<Header currentPath="/styleguide" />
```
Cela affichera le header complet (logo + nav avec "Notes" et l'état actif `/styleguide` non trouvé car `/styleguide` ne correspond pas à `/notes`). Comportement attendu.

**`Footer`**
```astro
<!-- Aucune prop -->
<Footer />
```

### Implémentation de référence — section Composants complète

```astro
  <!-- ══════════════════════════════════════════
       SECTION COMPOSANTS
       ══════════════════════════════════════════ -->
  <section class="sg-section" id="composants">
    <h2 class="sg-section__title">Composants</h2>

    <!-- ── StageBadge ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">StageBadge</h3>
      <p class="sg-component__props">
        <code>stage</code>: 'seedling' | 'budding' | 'evergreen' —
        <code>size?</code>: 'sm' | 'md' (défaut: 'md')
      </p>
      <div class="sg-preview">
        <div class="sg-variant-group">
          <span class="sg-variant-label">size="md" (défaut)</span>
          <div class="sg-flex-row">
            <StageBadge stage="seedling" />
            <StageBadge stage="budding" />
            <StageBadge stage="evergreen" />
          </div>
        </div>
        <div class="sg-variant-group">
          <span class="sg-variant-label">size="sm"</span>
          <div class="sg-flex-row">
            <StageBadge stage="seedling" size="sm" />
            <StageBadge stage="budding" size="sm" />
            <StageBadge stage="evergreen" size="sm" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── Tag ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">Tag</h3>
      <p class="sg-component__props">
        <code>label</code>: string —
        <code>href?</code>: string → interactive (lien) si fourni, static (span) sinon
      </p>
      <div class="sg-preview">
        <div class="sg-variant-group">
          <span class="sg-variant-label">Static (sans href)</span>
          <div class="sg-flex-row">
            <Tag label="design" />
            <Tag label="tokens" />
          </div>
        </div>
        <div class="sg-variant-group">
          <span class="sg-variant-label">Interactive (avec href, hover)</span>
          <div class="sg-flex-row">
            <Tag label="design" href="/notes?tag=design" />
            <Tag label="tokens" href="/notes?tag=tokens" />
          </div>
        </div>
      </div>
    </div>

    <!-- ── NavLink ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">NavLink</h3>
      <p class="sg-component__props">
        <code>href</code>: string —
        <code>label</code>: string —
        <code>active</code>: boolean → ajoute aria-current="page" + style actif
      </p>
      <div class="sg-preview">
        <div class="sg-flex-row">
          <NavLink href="/notes" label="Notes (inactif)" active={false} />
          <NavLink href="/styleguide" label="Styleguide (actif)" active={true} />
        </div>
      </div>
    </div>

    <!-- ── NoteCard ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">NoteCard</h3>
      <p class="sg-component__props">
        <code>title</code>, <code>slug</code>, <code>date</code>: Date, <code>stage</code> requis —
        <code>description?</code>, <code>tags?</code>: string[] optionnels
      </p>
      <div class="sg-preview sg-preview--list">
        <ul class="sg-notelist">
          <li class="sg-notelist__item">
            <NoteCard
              title="Note avec description et tags (budding)"
              slug="example-complete"
              date={new Date('2026-03-01')}
              stage="budding"
              description="Description courte de la note, quelques mots illustratifs."
              tags={["design", "tokens"]}
            />
          </li>
          <li class="sg-notelist__item">
            <NoteCard
              title="Note sans description (evergreen)"
              slug="example-minimal"
              date={new Date('2026-01-15')}
              stage="evergreen"
            />
          </li>
        </ul>
      </div>
    </div>

    <!-- ── BacklinkList ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">BacklinkList</h3>
      <p class="sg-component__props">
        <code>backlinks</code>: Array&lt;&#123;title: string, slug: string&#125;&gt; — entièrement masqué si vide
      </p>
      <div class="sg-preview">
        <div class="sg-variant-group">
          <span class="sg-variant-label">Avec backlinks (visible)</span>
          <BacklinkList backlinks={demoBacklinks} />
        </div>
        <div class="sg-variant-group">
          <span class="sg-variant-label">Vide — rien affiché (comportement attendu)</span>
          <BacklinkList backlinks={[]} />
          <p class="sg-empty-note">↑ Le composant est invisible quand backlinks = []</p>
        </div>
      </div>
    </div>

    <!-- ── Header ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">Header</h3>
      <p class="sg-component__props">
        <code>currentPath</code>: string — détermine le lien actif dans la navigation.
        Normalement géré automatiquement par PageLayout.
      </p>
      <div class="sg-preview sg-preview--full-width">
        <Header currentPath="/styleguide" />
      </div>
    </div>

    <!-- ── Footer ── -->
    <div class="sg-component">
      <h3 class="sg-component__name">Footer</h3>
      <p class="sg-component__props">
        Aucune prop. Normalement géré automatiquement par PageLayout.
      </p>
      <div class="sg-preview sg-preview--full-width">
        <Footer />
      </div>
    </div>

  </section>
```

### Styles scoped à ajouter dans le bloc `<style>` existant

Ajouter à la suite du CSS existant de Story 5.1 :

```css
  /* ══════════════════════════════════════════
     Styles section Composants (Story 5.2)
     ══════════════════════════════════════════ */

  /* ── Carte composant ── */
  .sg-component {
    margin-bottom: var(--space-2xl);
    padding-bottom: var(--space-xl);
    border-bottom: 1px solid var(--color-border);
  }

  .sg-component:last-child {
    border-bottom: none;
  }

  .sg-component__name {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    color: var(--color-accent-700);
    margin: 0 0 var(--space-xs);
  }

  .sg-component__props {
    font-size: var(--text-sm);
    color: var(--color-ink-muted);
    margin: 0 0 var(--space-md);
    line-height: 1.6;
  }

  .sg-component__props code {
    font-family: var(--font-mono);
    font-size: 0.9em;               /* em-based — relatif à la taille du parent */
    background: var(--color-accent-50);
    padding: 0.1em 0.4em;
    border-radius: var(--radius-small);
    color: var(--color-accent-700);
  }

  /* ── Zone de preview ── */
  .sg-preview {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-large);
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  .sg-preview--full-width {
    padding: 0;
    overflow: hidden;
  }

  .sg-preview--list {
    padding: 0;
    border-radius: var(--radius-large);
    overflow: hidden;
  }

  /* ── Variants ── */
  .sg-variant-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .sg-variant-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-ink-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sg-flex-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
    align-items: center;
  }

  /* ── NoteCard en liste ── */
  .sg-notelist {
    list-style: none;
    padding: var(--space-sm) var(--space-lg);
    margin: 0;
  }

  .sg-notelist__item {
    border-bottom: 1px solid var(--color-border);
  }

  .sg-notelist__item:last-child {
    border-bottom: none;
  }

  /* ── Note état vide ── */
  .sg-empty-note {
    font-size: var(--text-xs);
    color: var(--color-ink-muted);
    font-style: italic;
    margin: 0;
  }
```

### Piège : `<code>` dans les descriptions de props

Les descriptions de props utilisent `<code>` pour les noms de props. Ce `<code>` reçoit ses styles depuis `global.css` → `.prose code`. Mais la page styleguide n'est pas dans un container `.prose`.

**Solution** : ajouter une règle `.sg-component__props code` dans le `<style>` scoped (inclus dans le code de référence ci-dessus). Cela évite la dépendance sur `.prose`.

### Piège : `BacklinkList` visible uniquement avec backlinks non vides

`BacklinkList` utilise `{backlinks.length > 0 && (…)}` — quand `backlinks=[]`, **rien n'est rendu dans le DOM**. La section "Vide" du styleguide affichera donc un espace vide + le message `.sg-empty-note`. C'est le comportement attendu et documenté.

### Piège : liens `slug` inexistants dans NoteCard

Les `slug` utilisés dans NoteCard (`example-complete`, `example-minimal`) génèrent des liens `href="/notes/example-complete"` qui retourneront 404. C'est normal et attendu pour un styleguide — ne pas créer de fausses notes dans le content.

### Ce que cette story ne fait PAS

- **Ne pas créer de nouveaux composants** — documentation uniquement
- **Ne pas modifier les composants existants** — les afficher tels quels
- **Ne pas modifier `global.css`**
- **Ne pas créer d'autres pages**

### Commandes de validation

```bash
# 0 style="" inline dans styleguide.astro
grep 'style="' src/pages/styleguide.astro
# → 0 résultat attendu

# Build complet — 7 pages
npm run build
# → "7 page(s) built" sans erreur
```

### Références

- Epics → Story 5.2 AC : liste des composants à documenter
- Story 5.1 → structure du fichier `styleguide.astro` (section Tokens)
- `src/components/*.astro` → props réelles de chaque composant (toutes lues et documentées ci-dessus)
- Architecture → Règle 10 : styleguide extensible, tout nouveau composant peut y être ajouté

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

### Completion Notes List

Ajout de la section Composants dans `src/pages/styleguide.astro` :
- Imports ajoutés : `Header` et `Footer` (exception architecturale documentée)
- Données d'exemple `demoBacklinks` et `demoNote` déjà présentes depuis Story 5.1
- 7 composants documentés avec leurs vraies variantes en live :
  - `StageBadge` : 6 variantes (3 stages × 2 sizes)
  - `Tag` : static (span) et interactive (lien avec hover)
  - `NavLink` : inactif et actif (aria-current="page")
  - `NoteCard` : avec description+tags et sans description
  - `BacklinkList` : avec backlinks (visible) et vide (invisible — comportement documenté)
  - `Header` : rendu direct avec `currentPath="/styleguide"`
  - `Footer` : rendu direct sans props
- Styles ajoutés : `.sg-component`, `.sg-preview`, `.sg-variant-*`, `.sg-notelist`, `.sg-empty-note`
- `grep 'style="' styleguide.astro` → 0 résultat
- Build : 0 erreur, 7 pages générées

### File List

- src/pages/styleguide.astro (modifié — ajout section Composants)

## Change Log

- 2026-04-16 : Ajout de la section Composants dans `styleguide.astro` — 7 composants documentés avec variantes live (StageBadge, Tag, NavLink, NoteCard, BacklinkList, Header, Footer). Build : 0 erreur, 7 pages.
