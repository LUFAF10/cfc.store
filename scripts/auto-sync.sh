#!/bin/bash
# ─── CFC Auto-Sync ────────────────────────────────────────────────────────────
# Watches the images folder every 30 seconds.
# If there are new or removed files, commits and pushes to GitHub automatically.
# Vercel picks up the push and redeploys the site.

REPO="/Users/lucasconsorte/Web CFC/sports-retro-store"
LOG="$HOME/.cfc-autosync.log"

echo "[$(date)] CFC Auto-Sync iniciado." >> "$LOG"

while true; do
  cd "$REPO" || exit 1

  # Check for any changes (new, modified or deleted) in the images folder
  CHANGES=$(git status --short public/images/ 2>/dev/null)

  if [ -n "$CHANGES" ]; then
    echo "[$(date)] Cambios detectados:" >> "$LOG"
    echo "$CHANGES" >> "$LOG"

    git add public/images/ >> "$LOG" 2>&1

    git commit -m "sync: actualización de imágenes $(date '+%Y-%m-%d %H:%M')" >> "$LOG" 2>&1

    git push >> "$LOG" 2>&1

    if [ $? -eq 0 ]; then
      echo "[$(date)] ✓ Subida exitosa. Vercel redesplegando..." >> "$LOG"
    else
      echo "[$(date)] ✗ Error al subir. Revisá ~/.cfc-autosync.log" >> "$LOG"
    fi
  fi

  sleep 30
done
