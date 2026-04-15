#!/usr/bin/env bash
# watch-and-build.sh
# Surveille le dossier notes et relance `npm run build` à chaque modification.
# Conçu pour tourner en permanence via systemd (voir deploy/digital-garden.service).

set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
# Répertoire du projet (chemin absolu)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Dossier à surveiller — pointe vers src/content/notes/ (symlink ou réel)
WATCH_DIR="${PROJECT_DIR}/src/content/notes"

# Fichier de log
LOG_FILE="${PROJECT_DIR}/build.log"

# Délai de debounce en secondes : évite les builds en rafale quand
# Syncthing synchronise plusieurs fichiers d'un coup.
DEBOUNCE=3

# ── Fonctions ──────────────────────────────────────────────────────────────────
log() {
  local ts
  ts="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[${ts}] $*" | tee -a "${LOG_FILE}"
}

build() {
  log "BUILD START — déclencheur : $1"
  local start_ts
  start_ts=$(date +%s)

  if npm run build --prefix "${PROJECT_DIR}" >> "${LOG_FILE}" 2>&1; then
    local elapsed=$(( $(date +%s) - start_ts ))
    log "BUILD OK (${elapsed}s)"
  else
    log "BUILD FAILED — voir ${LOG_FILE} pour les détails"
  fi
}

# ── Vérifications préalables ───────────────────────────────────────────────────
if ! command -v inotifywait &>/dev/null; then
  echo "ERREUR : inotifywait introuvable. Installe inotify-tools :" >&2
  echo "  apt install inotify-tools" >&2
  exit 1
fi

if [[ ! -d "${WATCH_DIR}" ]]; then
  echo "ERREUR : dossier notes introuvable : ${WATCH_DIR}" >&2
  echo "  Vérifie que le symlink est créé (voir DEPLOY.md)." >&2
  exit 1
fi

# ── Démarrage ─────────────────────────────────────────────────────────────────
log "=== Watcher démarré ==="
log "  Projet  : ${PROJECT_DIR}"
log "  Notes   : ${WATCH_DIR}"
log "  Debounce: ${DEBOUNCE}s"

# Build initial au démarrage du service
build "démarrage"

# ── Boucle de surveillance ─────────────────────────────────────────────────────
# inotifywait bloque jusqu'à un événement, puis on attend DEBOUNCE secondes
# pour absorber les modifications groupées de Syncthing avant de builder.

while true; do
  # Attend le premier événement (bloquant)
  changed_file=$(
    inotifywait \
      --recursive \
      --quiet \
      --format '%w%f' \
      --event close_write \
      --event create \
      --event delete \
      --event moved_to \
      --event moved_from \
      "${WATCH_DIR}" 2>/dev/null
  )

  log "Changement détecté : ${changed_file} — debounce ${DEBOUNCE}s..."

  # Debounce : absorbe les événements suivants pendant DEBOUNCE secondes
  # en drainant inotifywait en mode timeout
  inotifywait \
    --recursive \
    --quiet \
    --timeout "${DEBOUNCE}" \
    --event close_write \
    --event create \
    --event delete \
    --event moved_to \
    --event moved_from \
    "${WATCH_DIR}" 2>/dev/null || true
  # (le `|| true` ignore le code de sortie 1 quand inotifywait timeout sans événement)

  build "${changed_file}"
done
