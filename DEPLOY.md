# Guide de déploiement — Digital Garden sur homelab

Stack : Astro (static) · Syncthing · inotifywait · Docker · Nginx/SWAG

---

## Déploiement Docker (recommandé)

### Architecture

```
Obsidian (local)
    │  Syncthing
    ▼
/data/syncthing/notes/          ← bind mount (lecture seule) dans le conteneur
    │  inotifywait (dans le conteneur)
    ▼
npm run build → /app/dist/
    │  bind mount vers l'hôte
    ▼
/opt/digital-garden/dist/       ← servi par SWAG (chemin hôte inchangé)
    │  SWAG
    ▼
https://garden.ton-domaine.com
```

### 1. Préparer le serveur

```bash
# Crée le dossier dist/ sur l'hôte (point de montage partagé avec SWAG)
sudo mkdir -p /opt/digital-garden/dist

# Adapte les chemins dans compose.yaml si nécessaire
nano compose.yaml
```

Les deux volumes à vérifier dans `compose.yaml` :

| Volume | Ce qu'il contient |
|---|---|
| `/data/syncthing/notes` | Chemin où Syncthing dépose tes notes Obsidian |
| `/opt/digital-garden/dist` | Chemin que SWAG sert via `root` dans sa config Nginx |

### 2. Builder et démarrer

```bash
# Depuis la racine du projet (où se trouve compose.yaml)
docker compose up -d --build

# Voir les logs en temps réel (build initial + watcher)
docker compose logs -f
```

### 3. Configurer SWAG

La config Nginx (`deploy/digital-garden.conf`) reste **inchangée** : SWAG continue
à servir `/opt/digital-garden/dist` sur l'hôte, qui est maintenant alimenté par le conteneur.

```bash
cp deploy/digital-garden.conf /path/to/swag/config/nginx/site-confs/digital-garden.conf
docker exec swag nginx -s reload
```

### Commandes utiles

```bash
# Redémarrer le watcher (ex : après un changement de config)
docker compose restart digital-garden

# Voir les logs de build
docker compose logs digital-garden

# Forcer un rebuild de l'image (ex : après mise à jour du projet)
docker compose up -d --build

# Stopper
docker compose down
```

### Dépannage Docker

| Symptôme | Cause probable | Solution |
|---|---|---|
| `ERREUR : dossier notes introuvable` | Chemin Syncthing incorrect | Vérifie le bind mount dans `compose.yaml` |
| Le site ne se met pas à jour | inotifywait ne voit pas les événements | Vérifie que Syncthing écrit bien dans `/data/syncthing/notes` sur l'hôte |
| `dist/` vide après démarrage | Build échoué au démarrage | `docker compose logs digital-garden` |
| SWAG renvoie 404 | Chemin `dist/` incorrect dans SWAG | Vérifie `root` dans `digital-garden.conf` |

---

## Déploiement systemd (legacy)

> L'approche systemd reste documentée ci-dessous pour référence, mais le déploiement Docker est désormais recommandé.

---

## Vue d'ensemble

```
Obsidian (local)
    │  Syncthing
    ▼
/data/syncthing/notes/          ← tes fichiers .mdx Obsidian
    │  symlink
    ▼
/opt/digital-garden/src/content/notes/
    │  inotifywait (watch-and-build.sh)
    ▼
npm run build → dist/
    │  Nginx/SWAG
    ▼
https://garden.ton-domaine.com
```

---

## 1. Prérequis serveur

```bash
# Node.js 18+
node --version

# npm
npm --version

# inotify-tools (pour inotifywait)
sudo apt install inotify-tools

# Vérifie que Syncthing est installé et synchronise tes notes
```

---

## 2. Déployer le projet

```bash
# Clone ou copie le projet sur le serveur
sudo mkdir -p /opt/digital-garden
sudo chown YOUR_USER:YOUR_USER /opt/digital-garden

# Copie les fichiers (depuis ta machine de dev, ou via git)
rsync -av --exclude node_modules --exclude dist --exclude .git \
  ./ YOUR_USER@homelab:/opt/digital-garden/

# Installe les dépendances Node sur le serveur
cd /opt/digital-garden
npm install

# Rends le script exécutable
chmod +x watch-and-build.sh
```

---

## 3. Créer le symlink vers les notes Syncthing

> Remplace `/data/syncthing/notes` par le chemin réel où Syncthing
> synchronise tes notes Obsidian sur le serveur.

```bash
# Supprime le dossier placeholder (vide, ou avec les notes de démo)
rm -rf /opt/digital-garden/src/content/notes

# Crée le symlink
ln -s /data/syncthing/notes /opt/digital-garden/src/content/notes

# Vérifie
ls -la /opt/digital-garden/src/content/notes
# → doit lister tes fichiers .md / .mdx Obsidian
```

**Note sur les fichiers Obsidian :** Astro ne traite que les fichiers `.md`
et `.mdx`. Si tes notes Obsidian sont en `.md`, le Content Collection les
prend en charge automatiquement. Assure-toi que le frontmatter correspond
au schéma attendu (`title`, `date`, `stage`, `tags`, `publish`).

---

## 4. Installer le service systemd

```bash
# Édite le fichier service pour adapter User et WorkingDirectory
nano /opt/digital-garden/deploy/digital-garden.service

# Remplace YOUR_USER par ton utilisateur serveur
# Remplace /opt/digital-garden si tu as choisi un autre chemin

# Installe le service
sudo cp /opt/digital-garden/deploy/digital-garden.service /etc/systemd/system/

# Recharge systemd et active le service
sudo systemctl daemon-reload
sudo systemctl enable --now digital-garden

# Vérifie le statut
sudo systemctl status digital-garden

# Suis les logs en temps réel
journalctl -u digital-garden -f

# Consulte le log de build applicatif
tail -f /opt/digital-garden/build.log
```

---

## 5. Configurer SWAG / Nginx

### Avec SWAG (conteneur Docker linuxserver/swag)

```bash
# Édite le fichier de config
nano /opt/digital-garden/deploy/digital-garden.conf

# Remplace :
#   garden.ton-domaine.com  → ton sous-domaine réel
#   /opt/digital-garden/dist → chemin vers dist/ sur l'hôte

# Copie dans SWAG
cp /opt/digital-garden/deploy/digital-garden.conf \
   /path/to/swag/config/nginx/site-confs/digital-garden.conf

# Recharge SWAG
docker exec swag nginx -s reload
# ou
docker restart swag
```

### Avec Nginx standard (sans conteneur)

```bash
# Adapte les chemins ssl_certificate selon ta config (Certbot, etc.)
nano /opt/digital-garden/deploy/digital-garden.conf

sudo cp /opt/digital-garden/deploy/digital-garden.conf \
        /etc/nginx/sites-available/digital-garden.conf

sudo ln -s /etc/nginx/sites-available/digital-garden.conf \
           /etc/nginx/sites-enabled/

sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Test de bout en bout

```bash
# 1. Vérifie que le service tourne
sudo systemctl status digital-garden

# 2. Modifie une note sur Obsidian (ou directement sur le serveur)
touch /data/syncthing/notes/test.mdx

# 3. Observe le build se déclencher
tail -f /opt/digital-garden/build.log

# 4. Vérifie le site
curl -I https://garden.ton-domaine.com
```

---

## Commandes utiles

```bash
# Redémarrer le watcher
sudo systemctl restart digital-garden

# Stopper le watcher
sudo systemctl stop digital-garden

# Voir les 50 dernières lignes de log de build
tail -50 /opt/digital-garden/build.log

# Build manuel (sans le watcher)
cd /opt/digital-garden && npm run build

# Tester la config Nginx sans recharger
sudo nginx -t
```

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Le service ne démarre pas | `YOUR_USER` non remplacé | Édite le `.service`, `daemon-reload` |
| Build ne se déclenche pas | inotifywait manquant | `apt install inotify-tools` |
| Symlink cassé | Chemin Syncthing incorrect | Vérifie avec `ls -la src/content/notes` |
| Page 404 sur toutes les routes | `root` incorrect dans Nginx | Vérifie le chemin vers `dist/` |
| Erreur de schéma Frontmatter | Note sans `title`/`date`/`stage` | Ajoute le frontmatter requis |
| Trop de builds en rafale | Debounce trop court | Augmente `DEBOUNCE` dans `watch-and-build.sh` |
