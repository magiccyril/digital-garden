FROM node:22-alpine

# inotify-tools pour inotifywait, bash pour le script shell
RUN apk add --no-cache inotify-tools bash

WORKDIR /app

# Dépendances Node en premier (meilleur cache des layers)
COPY package.json package-lock.json ./
RUN npm ci

# Copie du projet (node_modules et dist exclus via .dockerignore)
COPY . .

# Le dossier notes sera monté en volume à l'exécution.
# On s'assure qu'il existe comme point de montage vide.
RUN rm -rf src/content/notes && mkdir -p src/content/notes

RUN chmod +x watch-and-build.sh

CMD ["./watch-and-build.sh"]
