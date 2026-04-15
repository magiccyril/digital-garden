---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments:
  - "_bmad-output/planning-artifacts/product-brief-digitalgarden.md"
  - "_bmad-output/planning-artifacts/product-brief-digitalgarden-distillate.md"
  - "_bmad-output/planning-artifacts/ux-design-specification.md"
workflowType: 'prd'
briefCount: 2
researchCount: 0
projectDocsCount: 0
uxDocCount: 1
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: brownfield
---

# Product Requirements Document — digitalgarden

**Auteur :** Cyril
**Date :** 2026-04-13

## Résumé exécutif

Digitalgarden est un jardin numérique personnel auto-hébergé : les notes rédigées dans Obsidian sont synchronisées via Syncthing vers un homelab, publiées sélectivement sous forme de site statique généré par Astro 6, et servies via SWAG (Nginx/TLS). Le code fonctionne. Cette phase ne change pas ce que fait le site — elle change comment le code est organisé.

Le problème est structurel : ~60 attributs `style=""` inline, des valeurs CSS codées en dur sans échelle cohérente, et un seul composant réutilisable sur l'ensemble du projet. Reprendre ce code après quelques semaines d'absence est laborieux. Ajouter une nouvelle page crée inévitablement de la dette.

L'objectif est de construire un design system à l'état de l'art adapté à la stack existante (Astro + Tailwind v4 `@theme`) : formaliser les tokens CSS, extraire une bibliothèque de composants Astro encapsulés, et créer une page `/styleguide` comme documentation vivante. Le style visuel existant est conservé à l'identique — la refonte est invisible à l'œil, perceptible uniquement dans le code.

**Utilisateur cible :** Cyril — usage 100% personnel.
**Stack :** Astro 6, Tailwind v4, MDX, Syncthing, systemd, SWAG.
**Contexte :** Brownfield — code existant fonctionnel, refonte structurelle uniquement.

### Ce qui rend ce projet unique

Le design system n'est pas l'interface — il est l'infrastructure. Des tokens nommés par leur rôle sémantique (pas leur valeur), des composants autonomes et scopés, une page styleguide qui répond à "est-ce que ça existe ?" avant d'écrire une ligne. Ce n'est pas un changement esthétique : c'est un changement de contrat avec le code futur.

Référence d'inspiration : maggieappleton.com — même paradigme (tokens CSS custom properties + composants autonomes), même philosophie typographique (léger, aéré, texte dominant).

## Critères de succès

### Succès utilisateur

- Rouvrir le projet après plusieurs semaines d'absence et comprendre immédiatement la structure sans lire de commentaires
- Ajouter une nouvelle page en assemblant des composants existants, sans créer un seul nouveau style ad-hoc
- Consulter `/styleguide` et identifier en moins d'une minute tous les composants disponibles avec leurs variantes

### Succès technique

- Build Astro sans erreur après migration complète
- Rendu visuel pixel-perfect identique à l'état pré-refonte
- Chaque composant `.astro` autonome : styles dans `<style>` scoped, zéro dépendance sur styles globaux hors tokens
- `global.css` lisible en moins de 5 minutes : uniquement `@theme` (tokens) et `@layer base` (resets)
- Zéro attribut `style=""` inline dans les fichiers `.astro` (hormis cas dynamiques justifiés)
- Tout pattern visuel utilisé 2+ fois vit dans un composant dédié

### Résultats mesurables

| Critère | Avant | Après |
|---------|-------|-------|
| Attributs `style=""` inline | ~60 | 0 |
| Composants réutilisables | 1 (StageBadge) | 8 |
| Valeurs CSS hardcodées | ~40 valeurs | 0 |
| Page `/styleguide` | Non | Oui |
| Tokens d'espacement formalisés | 0 | 10 |

## Parcours utilisateur

### Parcours 1 — Cyril lecteur : "Je suis ma curiosité"

**Scène d'ouverture :** Cyril a lu un article sur les design systems. Il pense à une note qu'il avait écrite là-dessus il y a quelques semaines. Il ouvre son jardin depuis son navigateur.

**Action montante :** Il arrive sur la homepage — les notes récentes s'affichent. Il reconnaît son titre, clique sur la NoteCard. Il lit la note, et croise un wiki-link : `[[Tailwind v4 @theme]]`. Il clique.

**Point culminant :** Il arrive sur la note liée sans rupture visuelle. Le même layout, la même typographie. En bas, la section backlinks lui montre deux autres notes qui mentionnent ce sujet. Il en suit une.

**Résolution :** Vingt minutes plus tard, il a traversé cinq notes interconnectées. Il a retrouvé quelque chose qu'il avait oublié avoir réfléchi.

**Révèle comme exigences :** NoteLayout lisible, wiki-links cliquables et distincts, BacklinkList fonctionnelle, navigation retour accessible.

### Parcours 2 — Cyril mainteneur : "Je reprends le projet"

**Scène d'ouverture :** Six semaines sans toucher au code. Cyril veut ajouter une page "À propos". Il ouvre VS Code.

**Avant la refonte :** Il ouvre `index.astro`. Il voit 40 lignes de `style=""` inline. Il cherche où est définie la couleur d'accent. Il abandonne après 20 minutes, frustré.

**Après la refonte :** Il ouvre `src/components/`. Il voit `Header.astro`, `Footer.astro`, `PageLayout.astro`. Il ouvre `/styleguide` dans le navigateur. En deux minutes, il sait exactement quels composants existent. Il crée `about.astro`, importe `PageLayout` et `Header`, écrit son contenu. Aucun nouveau style créé. Build propre.

**Résolution :** La page "À propos" existe. Temps total : 15 minutes. Avant la refonte : 2 heures et de la dette.

**Révèle comme exigences :** Composants bien nommés et isolés, `/styleguide` exhaustif, tokens nommés par rôle.

### Parcours 3 — Cyril auteur : "Je publie une note"

**Scène d'ouverture :** Cyril finit d'écrire une note dans Obsidian sur son homelab. Il décide de la publier.

**Action montante :** Il ajoute `publish: true` et `stage: budding` dans le frontmatter. Syncthing synchronise le fichier. Le watcher `inotifywait` détecte le changement. Le build démarre automatiquement.

**Point culminant :** 30 secondes plus tard, la note apparaît dans l'index et sur la homepage. Aucune action manuelle requise.

**Résolution :** La note est publiée. Le design system garantit qu'elle s'affiche exactement comme les autres — typographie cohérente, badges corrects, wiki-links fonctionnels.

**Révèle comme exigences :** Frontmatter schema stable, pipeline de build fiable, NoteLayout cohérent pour toutes les notes.

### Parcours 4 — Cyril développeur : "Je veux ajouter un composant"

**Scène d'ouverture :** Cyril prépare la section "Notes de lecture" (v2). Il a besoin d'un `BookCard` — pas encore créé.

**Action montante :** Il ouvre `/styleguide`. Il vérifie qu'aucun composant existant ne couvre ce besoin. Il crée `BookCard.astro` dans `src/components/`. Il utilise uniquement des tokens `var(--space-*)`, `var(--color-*)`, `var(--radius-*)`. Il ajoute le composant au styleguide.

**Point culminant :** La convention est respectée — le composant est scopé, documenté, et visible dans le styleguide avant d'être utilisé dans une page. Aucune valeur hardcodée.

**Résolution :** `BookCard` s'intègre naturellement dans le design system. Le styleguide reste la source de vérité.

**Révèle comme exigences :** Convention d'extraction claire, `/styleguide` extensible, tokens couvrant les nouveaux cas d'usage.

### Résumé des capacités révélées

| Parcours | Capacités révélées |
|----------|-------------------|
| Lecteur | NoteLayout, wiki-links, BacklinkList, navigation retour |
| Mainteneur | Composants isolés, /styleguide, tokens sémantiques |
| Auteur | Pipeline Syncthing→build, frontmatter stable, NoteLayout cohérent |
| Développeur | Convention extraction, /styleguide extensible, tokens complets |

## Périmètre et Roadmap

### Stratégie MVP

**Approche :** Developer Experience MVP — le succès n'est pas visible à l'écran, il est perceptible dans le code.
**Ressource :** Développeur unique (Cyril).
**Migration :** En une passe unique — pas d'approche incrémentale.

### Phase 1 — MVP

- Formalisation complète des tokens CSS dans `global.css` (espacement, typographie, rayons, transitions — couleurs et polices déjà présentes)
- Extraction des 8 composants : `Header`, `Footer`, `PageLayout`, `NavLink`, `NoteCard`, `StageBadge`, `Tag`, `BacklinkList`
- Migration en une passe de tous les `style=""` inline et valeurs hardcodées
- Suppression des commentaires `// PERSONNALISE :` résiduels
- Page `/styleguide` documentant tous les composants et leurs variantes
- Rendu visuel pixel-perfect identique à l'état pré-refonte

### Phase 2 — Post-MVP

- Page `/about` (contenu statique)
- Section "Notes de lecture" + composant `BookCard` (couvertures + métadonnées, aspect-ratio 2:3)
- Deuxième collection Astro pour les notes de lecture

### Phase 3 — Vision

- Dark mode (tokens sémantiques déjà préparés pour cette évolution)
- Recherche full-text sur les notes publiées
- Timeline de lecture ou visualisation du jardin

### Mitigation des risques

**Régression visuelle :** Captures d'écran avant/après sur les pages clés avant de merger.

**Scope creep :** Toute décision pendant la migration est structurelle, jamais esthétique. Si un style "pourrait être amélioré", il est noté en TODO pour une issue séparée.

**Couverture incomplète :** Audit final par `grep -r 'style="' src/` avant de clôturer la migration.

## Exigences spécifiques Web App

**Type :** SSG via Astro 6 — Multi-Page Application (MPA). Chaque page est un document HTML complet. Aucune SPA, aucune hydration client-side sauf cas explicite justifié.

### Navigateurs supportés

Navigateurs evergreen modernes uniquement (usage personnel) : Chrome/Chromium, Firefox, Safari — versions courantes. Aucun support IE ou Edge legacy.

### Design responsive

Desktop-first, un seul breakpoint à 768px. Aucun breakpoint tablette — usage principal sur desktop.

### SEO

Aucune exigence SEO formelle. Bonnes pratiques Astro par défaut : `<title>` et `<meta name="description">` issus du frontmatter, structure HTML sémantique via les composants. Pas de sitemap ni de robots.txt d'indexation.

## Exigences fonctionnelles

### Navigation et structure du site

- FR1 : Le visiteur peut accéder à la homepage affichant les notes publiées récentes
- FR2 : Le visiteur peut accéder à l'index complet des notes publiées
- FR3 : Le visiteur peut naviguer vers une note individuelle depuis la homepage ou l'index
- FR4 : Le visiteur peut retourner à la homepage ou à l'index depuis n'importe quelle page
- FR5 : Le visiteur voit un header cohérent sur toutes les pages avec lien vers l'accueil

### Lecture de notes

- FR6 : Le visiteur peut lire le contenu complet d'une note publiée
- FR7 : Le visiteur peut identifier le stade de maturité d'une note (seedling / budding / evergreen) via un badge visuel
- FR8 : Le visiteur peut voir les tags associés à une note
- FR9 : Le visiteur peut cliquer sur un wiki-link `[[slug]]` résolu pour naviguer vers la note liée
- FR10 : Le visiteur voit visuellement la différence entre un wiki-link résolu (note existante) et non résolu (note absente)
- FR11 : Le visiteur peut consulter la liste des backlinks en bas d'une note (autres notes qui la mentionnent)

### Publication et contenu

- FR12 : Cyril peut publier une note en ajoutant `publish: true` dans le frontmatter Obsidian
- FR13 : Cyril peut définir le stade d'une note via le champ `stage` dans le frontmatter
- FR14 : Cyril peut associer des tags à une note via le champ `tags` dans le frontmatter
- FR15 : Le système publie automatiquement les notes marquées après synchronisation Syncthing (pipeline inotifywait → build)
- FR16 : Les notes sans `publish: true` ne sont jamais exposées sur le site

### Design system et tokens

- FR17 : Toutes les valeurs d'espacement sont exprimées via des tokens `var(--space-*)`
- FR18 : Toutes les valeurs de typographie sont exprimées via des tokens `var(--text-*)`
- FR19 : Toutes les valeurs de couleur sont exprimées via des tokens sémantiques `var(--color-*)`
- FR20 : Toutes les valeurs de rayon de bordure sont exprimées via des tokens `var(--radius-*)`
- FR21 : Toutes les valeurs de durée de transition sont exprimées via des tokens `var(--duration-*)`
- FR22 : Aucun attribut `style=""` inline n'est présent dans les fichiers `.astro` (hors cas dynamiques documentés)

### Composants Astro

- FR23 : Le composant `Header` est utilisable de façon autonome dans toute page
- FR24 : Le composant `Footer` est utilisable de façon autonome dans toute page
- FR25 : Le composant `PageLayout` encapsule la structure commune à toutes les pages
- FR26 : Le composant `NavLink` gère l'état actif selon la route courante
- FR27 : Le composant `NoteCard` affiche le titre, la description, la date et le stade d'une note
- FR28 : Le composant `StageBadge` affiche le stade de maturité d'une note avec son label et sa couleur
- FR29 : Le composant `Tag` affiche un tag individuel
- FR30 : Le composant `BacklinkList` affiche la liste des notes qui mentionnent la note courante
- FR31 : Chaque composant `.astro` contient ses styles dans un bloc `<style>` scoped — zéro dépendance sur des styles globaux hors tokens

### Page /styleguide

- FR32 : Cyril peut consulter `/styleguide` pour voir tous les composants disponibles avec leurs variantes
- FR33 : La page `/styleguide` affiche les tokens de design (couleurs, espacement, typographie)
- FR34 : La page `/styleguide` est extensible — tout nouveau composant peut y être ajouté

### Qualité du code

- FR35 : `global.css` contient uniquement `@theme` (tokens) et `@layer base` (resets)
- FR36 : Tout pattern visuel utilisé 2 fois ou plus est extrait dans un composant dédié
- FR37 : Le build Astro se termine sans erreur après migration complète

## Exigences non-fonctionnelles

### Performance

- NFR1 : Lighthouse Performance ≥ 90 sur les pages principales (homepage, note, index)
- NFR2 : Aucun JavaScript client-side non explicitement justifié dans le code
- NFR3 : TTFB < 200ms depuis le réseau local (servi via SWAG/homelab)
- NFR4 : Assets statiques (CSS, fonts) servis avec en-têtes de cache appropriés

### Fiabilité du pipeline de publication

- NFR5 : Le pipeline inotifywait → astro build se déclenche dans les 5 secondes suivant la détection d'un changement
- NFR6 : Un échec de build ne casse pas le site existant (le build précédent reste servi)
- NFR7 : Le service systemd redémarre automatiquement en cas d'arrêt inattendu

### Sécurité

- NFR8 : Le site est exclusivement servi via HTTPS (TLS géré par SWAG)
- NFR9 : Aucune donnée personnelle collectée ni stockée côté serveur (pas de cookies, pas d'analytics)

### Accessibilité

- NFR10 : Contraste de texte ≥ 4.5:1 (WCAG AA — satisfait par la palette existante)
- NFR11 : Navigation clavier fonctionnelle sur toutes les pages
- NFR12 : Structure de titres cohérente (h1 → h2 → h3) via les composants

### Maintenabilité

- NFR13 : Cyril peut comprendre la structure complète du projet en moins de 15 minutes après une absence prolongée
- NFR14 : L'ajout d'une nouvelle page ne nécessite pas la création d'un nouveau style
- NFR15 : La page `/styleguide` est mise à jour à chaque ajout de composant
