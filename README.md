# Digital Garden

Site statique généré avec Astro, inspiré du style de Maggie Appleton.
Notes évolutives en Markdown/MDX, synchronisées depuis Obsidian via Syncthing, servies par Nginx/SWAG sur homelab.

---

## Stack

| Rôle | Outil |
|---|---|
| Générateur de site | Astro 6 (static) |
| Style | Tailwind CSS v4 |
| Contenu | MDX + remark-wiki-link |
| Sync des notes | Syncthing |
| Watcher de build | inotifywait + bash |
| Daemon | systemd |
| Reverse proxy | Nginx / SWAG |

---

## Structure du projet

```
digitalgarden/
├── src/
│   ├── content.config.ts          # Schéma Zod des notes
│   ├── content/
│   │   └── notes/                 # Symlink → dossier Syncthing
│   ├── components/
│   │   └── StageBadge.astro       # Badge 🌱 / 🌿 / 🌳
│   ├── layouts/
│   │   ├── BaseLayout.astro       # Header + footer communs
│   │   └── NoteLayout.astro       # Template note (backlinks inclus)
│   ├── pages/
│   │   ├── index.astro            # Homepage éditoriale
│   │   └── notes/
│   │       ├── index.astro        # Index filtrable (stage, tag)
│   │       └── [slug].astro       # Page note individuelle
│   └── styles/
│       └── global.css             # Thème Tailwind v4 + prose
├── deploy/
│   ├── digital-garden.service     # Unit systemd
│   └── digital-garden.conf       # Config Nginx/SWAG
├── watch-and-build.sh             # Watcher inotifywait + log
├── DEPLOY.md                      # Guide de déploiement complet
└── build.log                      # Généré au runtime (gitignore)
```

---

## Frontmatter des notes

Chaque note `.md` ou `.mdx` dans `src/content/notes/` doit avoir :

```yaml
---
title: "Titre de la note"
date: 2024-03-15
stage: seedling      # seedling | budding | evergreen
tags: [tag1, tag2]
publish: true        # false = exclu du build
description: "Résumé optionnel affiché dans les listes."
---
```

Les notes avec `publish: false` (ou sans ce champ) sont ignorées par Astro.

---

## Wikilinks

La syntaxe `[[nom-de-la-note]]` est supportée via `remark-wiki-link`.
Elle est résolue vers `/notes/nom-de-la-note`.

Les backlinks sont calculés automatiquement à chaque build : chaque note
affiche les autres notes qui la mentionnent.

---

## Développement local

```bash
npm install
npm run dev
# → http://localhost:4321
```

```bash
npm run build    # Build de production dans dist/
npm run preview  # Prévisualise le build en local
```

---

## Personnalisation — checklist

Les endroits à modifier sont marqués `PERSONNALISE` dans le code.
Voici la liste complète :

### Identité du site

Fichier : `src/layouts/BaseLayout.astro`

```astro
const SITE_NAME = 'Digital Garden';   // ← nom du site (onglet + nav)
const SITE_AUTHOR = 'Votre Nom';      // ← ton nom (footer + meta)
```

Ajoute tes liens de navigation dans le `<nav>` :
```astro
<!-- <a href="/about">À propos</a> -->
```

### Texte d'intro de la homepage

Fichier : `src/pages/index.astro`

- Le `<h1>` : ta phrase d'accroche principale
- Les deux `<p>` : description de ton approche du jardinage numérique

### Polices

Fichier : `src/layouts/BaseLayout.astro`

Remplace le lien Google Fonts par tes polices :
```html
<link href="https://fonts.googleapis.com/css2?family=Lora..." rel="stylesheet" />
```

Puis mets à jour les variables dans `src/styles/global.css` :
```css
--font-serif: "Lora", Georgia, ui-serif, serif;
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
```

### Palette de couleurs

Fichier : `src/styles/global.css`, bloc `@theme`

```css
/* Couleur d'accent (liens, badges, hover) — format oklch recommandé */
--color-accent-500: oklch(60% 0.18 160);   /* ← change la teinte (160 = vert) */

/* Fond et texte */
--color-surface: oklch(99% 0.005 90);      /* ← fond de page */
--color-ink: oklch(18% 0.01 250);          /* ← texte principal */
--color-ink-muted: oklch(50% 0.01 250);    /* ← texte secondaire */
```

Pour changer la teinte globale, modifie le troisième paramètre oklch :
`160` = vert · `250` = bleu · `30` = orange · `0` = rouge

### Couleurs des badges de stage

Fichier : `src/components/StageBadge.astro`, bloc `<style>`

```css
.stage-seedling { background-color: ...; color: ...; border-color: ...; }
.stage-budding  { background-color: ...; color: ...; border-color: ...; }
.stage-evergreen { background-color: ...; color: ...; border-color: ...; }
```

---

## Déploiement sur homelab

Le guide complet est dans `DEPLOY.md`. Résumé des étapes :

### 1. Créer le symlink vers Syncthing

```bash
# Sur le serveur, remplace le dossier notes par un symlink
rm -rf /opt/digital-garden/src/content/notes
ln -s /CHEMIN/SYNCTHING/NOTES /opt/digital-garden/src/content/notes
```

**À adapter :** `/CHEMIN/SYNCTHING/NOTES` = chemin où Syncthing dépose tes notes.

### 2. Adapter le service systemd

Fichier : `deploy/digital-garden.service`

Deux lignes à modifier :
```ini
User=YOUR_USER           # ← ton utilisateur serveur
WorkingDirectory=/opt/digital-garden   # ← si tu as choisi un autre chemin
```

### 3. Adapter la config Nginx

Fichier : `deploy/digital-garden.conf`

Deux valeurs à modifier :
```nginx
server_name garden.ton-domaine.com;       # ← ton sous-domaine
root /opt/digital-garden/dist;            # ← chemin vers dist/ sur le serveur
```

Si tu n'utilises pas SWAG, adapte aussi les chemins des certificats TLS :
```nginx
ssl_certificate     /config/keys/letsencrypt/fullchain.pem;   # ← chemin Certbot
ssl_certificate_key /config/keys/letsencrypt/privkey.pem;
```

### 4. Débounce Syncthing

Fichier : `watch-and-build.sh`, ligne :
```bash
DEBOUNCE=3   # secondes d'attente après le premier événement
```

Augmente à `5` ou `10` si Syncthing synchronise de gros volumes et
déclenche trop de builds consécutifs.

---

## Commandes de référence

```bash
# Dev local
npm run dev

# Build manuel
npm run build

# Lancer le watcher manuellement (hors systemd)
./watch-and-build.sh

# Statut du service
sudo systemctl status digital-garden

# Logs du service
journalctl -u digital-garden -f

# Logs de build avec timestamps
tail -f build.log
```
