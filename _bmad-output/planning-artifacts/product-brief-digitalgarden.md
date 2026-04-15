---
title: "Product Brief : digitalgarden — Refonte du Design System"
status: "complete"
created: "2026-04-13"
updated: "2026-04-13"
inputs: ["analyse codebase src/", "entretien utilisateur"]
---

# Product Brief : Digitalgarden — Refonte du Design System

## Résumé exécutif

Digitalgarden est un jardin numérique personnel auto-hébergé : les notes écrites dans Obsidian sont synchronisées via Syncthing vers un homelab, puis publiées sélectivement sous forme de site statique généré par Astro. Le projet fonctionne. Le problème n'est pas fonctionnel — il est structurel.

Le code actuel souffre d'une dette technique de présentation : styles CSS dispersés en attributs `style=""` inline, valeurs codées en dur sans échelle cohérente, et une quasi-absence de composants réutilisables. Ajouter une nouvelle page aujourd'hui implique de copier-coller des patterns visuels sans garantie de cohérence. Dans six mois, reprendre ce projet serait laborieux.

L'objectif de cette refonte est de construire un **design system à l'état de l'art** adapté à la stack Astro + Tailwind v4, avec une bibliothèque de composants claire et une organisation CSS qui rend le code immédiatement lisible et durablement maintenable — par vous, seul, dans le temps.

---

## Le problème

Le projet a été généré rapidement et fonctionne en développement local. Mais l'organisation du code ne tient pas la distance :

- **Styles inline omniprésents** : ~60 attributs `style=""` répartis dans les fichiers `.astro`, rendant chaque modification visuelle une chasse au trésor.
- **Valeurs magiques** : espacements (`1rem`, `1.5rem`, `2.5rem`), rayons (`4px`, `8px`, `12px`), transitions (`150ms`, `200ms`) — aucune échelle formelle, aucune cohérence garantie.
- **Un seul composant** : `StageBadge` est le seul élément vraiment encapsulé. Tout le reste est du HTML inerte avec des styles éparpillés.
- **Extension coûteuse** : ajouter une page "À propos" ou une section "Notes de lecture" avec des couvertures de livre nécessitera de repartir de zéro visuellement à chaque fois.

Le style visuel actuel est satisfaisant. Ce n'est pas le style qui pose problème — c'est son absence d'architecture.

---

## La solution

Refondre l'organisation du code en trois axes complémentaires :

### 1. Design tokens formalisés
Compléter le `@theme` Tailwind v4 existant avec une échelle complète et explicite :
- **Espacements** : une scale nommée (`--space-1` → `--space-16`) dérivée d'une base de 4px
- **Typographie** : échelle de tailles (`--text-sm`, `--text-base`, `--text-lg`...) et hauteurs de ligne
- **Rayons** : scale cohérente (`--radius-sm`, `--radius-md`, `--radius-full`)
- **Transitions** : durées nommées (`--duration-fast`, `--duration-base`)
- Les tokens couleurs et polices, déjà présents, sont conservés tels quels

### 2. Bibliothèque de composants Astro
Extraire des composants réutilisables à partir des patterns existants :
- **Layout** : `Header`, `Footer`, `PageLayout` (wrapper générique)
- **Navigation** : `NavLink`
- **Contenu** : `NoteCard` (carte dans les listes), `StageBadge` (existant, conservé)
- **Primitives** : `Tag`, `BacklinkList`

Chaque composant encapsule ses styles — plus de styles inline dans les pages.

**Convention d'extraction :** tout pattern visuel utilisé à deux endroits ou plus devient un composant. Un pattern utilisé une seule fois peut rester dans la page, en style scopé.

### 3. Page `/styleguide`
Une page dédiée liste tous les composants en contexte réel, avec leurs variantes. Elle sert de documentation vivante : pas besoin d'ouvrir le code pour savoir ce qui existe et comment ça se présente. Elle évolue naturellement à chaque nouveau composant ajouté.

### 4. Organisation CSS claire
- `global.css` : uniquement les tokens (`@theme`) et les styles de base (`@layer base`)
- Styles des composants : dans des blocs `<style>` scoped dans chaque `.astro`, ou en classes Tailwind utilitaires explicites
- Zéro attribut `style=""` dans les pages et layouts

---

## Ce qui rend cette approche solide

- **Tailwind v4 natif** : l'architecture `@theme` + CSS custom properties est exactement le paradigme prévu par Tailwind v4 — on l'utilise correctement, pas contre lui.
- **Astro scoped styles** : les styles dans `<style>` des composants Astro sont scopés par défaut — pas de fuite, pas de collision, composants autonomes.
- **Tokens comme contrat** : toute valeur visuelle passe par un token nommé. Changer la couleur d'accentuation ou l'espacement de base devient un changement en un seul endroit.
- **Composants comme documentation** : la structure `/src/components/` devient un inventaire lisible de tous les éléments visuels du site.

---

## Utilisateur cible

Usage 100% personnel. L'utilisateur est Cyril — développeur familier d'Astro, qui auto-héberge ses services, et qui veut une base de code qu'il peut reprendre sans friction après des semaines d'absence.

Le critère de succès n'est pas l'adoption par d'autres — c'est la **confiance dans le code** : pouvoir ajouter une nouvelle page sans se demander où mettre les styles ni quels tokens utiliser.

---

## Critères de succès

- Zéro attribut `style=""` inline dans les fichiers `.astro` (hormis cas exceptionnels justifiés)
- Tous les composants visuels identifiables ont un fichier de composant dédié
- Ajouter la page "À propos" ou la section "Notes de lecture" ne nécessite que d'assembler des composants existants, sans créer de nouveaux styles ad-hoc
- Le `global.css` est lisible en moins de 5 minutes et contient uniquement des tokens et des resets

---

## Périmètre

**Dans le périmètre (v1 — refonte) :**
- Formalisation complète des design tokens dans `global.css` (espacement, typographie, rayons, transitions)
- Extraction des composants Astro : `Header`, `Footer`, `PageLayout`, `NavLink`, `NoteCard`, `Tag`, `BacklinkList`
- Remplacement de tous les styles inline par des styles scopés ou classes Tailwind
- Migration en une passe unique — pas de refactoring incrémental
- Suppression des commentaires `// PERSONNALISE :` résiduels (dette silencieuse)
- Page `/styleguide` listant tous les composants avec leurs variantes
- Conservation du style visuel existant — aucun changement esthétique

**Hors périmètre (v1) :**
- `BookCard` et section "Notes de lecture" → v2
- Contenu de la page "À propos" → v2 (la page peut exister mais vide)
- Dark mode (tokens non préparés pour l'instant)
- Refonte du pipeline de déploiement (Syncthing, systemd, SWAG — fonctionnel)
- Migration vers un autre framework

---

## Vision

Un jardin numérique qui grandit sans dette. Quand l'envie vient d'ajouter une page "À propos" ou d'afficher les couvertures de livres lus, le travail est d'écrire du contenu et d'assembler des composants — pas de déchiffrer du CSS éparpillé.

À terme, le design system posé ici peut aussi accueillir un mode sombre, une page de recherche, ou une timeline de lecture — sans nécessiter de nouveau refactoring structurel.
