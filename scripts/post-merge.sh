#!/usr/bin/env bash
set -Eeuo pipefail

export CI=1

echo "==> Installing project dependencies"
npm ci --no-audit --no-fund

if [[ -n "${DATABASE_URL:-}" || -n "${REPLIT_DB_URL:-}" || -n "${PGHOST:-}" ]]; then
  echo "==> Applying database migrations"
  if ! npm run db:migrate; then
    echo "WARNING: database migrations could not be applied during post-merge setup; continuing with build" >&2
  fi
else
  echo "==> Skipping database migrations: no database connection is configured"
fi

echo "==> Building application"
npm run build