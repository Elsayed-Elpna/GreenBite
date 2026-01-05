#!/usr/bin/env bash
set -euo pipefail

: "${DB_HOST:=db}"
: "${DB_PORT:=5432}"
: "${DB_NAME:=greenbite}"
: "${DB_USER:=postgres}"
: "${DB_PASSWORD:=postgres}"

# Production-safe default:
# - do NOT generate migrations in production
# - always run migrate
: "${RUN_MIGRATIONS:=1}"
: "${RUN_MAKEMIGRATIONS:=0}"
: "${RUN_MAKEMIGRATIONS_MERGE:=0}"

# one-time bootstrap guard
: "${BOOTSTRAP_ONCE:=1}"
BOOTSTRAP_FLAG="/app/.bootstrap_done"

# One-time jobs (set to 1 for first deploy)
: "${IMPORT_MEALDB:=0}"
: "${TOKENIZE_INGREDIENTS:=0}"   # maps to: python manage.py backfill_tokens
: "${EMBED_MEALS:=0}"            # maps to: python manage.py embed_meals

# args
: "${MEALDB_LIMIT:=0}"
: "${MEALDB_SLEEP:=0.25}"
: "${TOKENS_BATCH_SIZE:=300}"
: "${TOKENS_LIMIT:=0}"
: "${TOKENS_WITH_SYNONYMS:=1}"

echo "[entrypoint] DB=${DB_HOST}:${DB_PORT} name=${DB_NAME} user=${DB_USER}"

echo "[entrypoint] RUN_MIGRATIONS=${RUN_MIGRATIONS} RUN_MAKEMIGRATIONS=${RUN_MAKEMIGRATIONS} RUN_MAKEMIGRATIONS_MERGE=${RUN_MAKEMIGRATIONS_MERGE}"
echo "[entrypoint] IMPORT_MEALDB=${IMPORT_MEALDB} TOKENIZE_INGREDIENTS=${TOKENIZE_INGREDIENTS} EMBED_MEALS=${EMBED_MEALS}"
echo "[entrypoint] BOOTSTRAP_ONCE=${BOOTSTRAP_ONCE}"

# Wait for Postgres
echo "[entrypoint] Waiting for Postgres..."
python - <<PY
import os, time
import psycopg2

cfg = dict(
    host=os.environ["DB_HOST"],
    port=int(os.environ["DB_PORT"]),
    dbname=os.environ["DB_NAME"],
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
)

deadline = time.time() + 60
err = None
while time.time() < deadline:
    try:
        psycopg2.connect(**cfg).close()
        print("[entrypoint] Postgres is ready.")
        raise SystemExit(0)
    except Exception as e:
        err = e
        time.sleep(1)

print("[entrypoint] ERROR: Postgres not ready:", err)
raise SystemExit(1)
PY

# Decide bootstrap
do_bootstrap="1"
if [[ "${BOOTSTRAP_ONCE}" == "1" && -f "${BOOTSTRAP_FLAG}" ]]; then
  do_bootstrap="0"
  echo "[entrypoint] Bootstrap already done (${BOOTSTRAP_FLAG})"
fi

# Migrations
if [[ "${RUN_MIGRATIONS}" == "1" ]]; then
  if [[ "${RUN_MAKEMIGRATIONS_MERGE}" == "1" ]]; then
    echo "[entrypoint] makemigrations --merge --noinput"
    python manage.py makemigrations --merge --noinput || true
  fi

  if [[ "${RUN_MAKEMIGRATIONS}" == "1" ]]; then
    echo "[entrypoint] makemigrations"
    python manage.py makemigrations
  fi

  echo "[entrypoint] migrate --noinput"
  python manage.py migrate --noinput
fi

# One-time bootstrap tasks
if [[ "${do_bootstrap}" == "1" ]]; then
  if [[ "${IMPORT_MEALDB}" == "1" ]]; then
    echo "[entrypoint] import_mealdb"
    python manage.py import_mealdb --sleep "${MEALDB_SLEEP}" --limit "${MEALDB_LIMIT}"
  fi

  if [[ "${TOKENIZE_INGREDIENTS}" == "1" ]]; then
    echo "[entrypoint] backfill_tokens"
    if [[ "${TOKENS_WITH_SYNONYMS}" == "1" ]]; then
      python manage.py backfill_tokens --with-synonyms --batch-size "${TOKENS_BATCH_SIZE}" --limit "${TOKENS_LIMIT}"
    else
      python manage.py backfill_tokens --batch-size "${TOKENS_BATCH_SIZE}" --limit "${TOKENS_LIMIT}"
    fi
  fi

  if [[ "${EMBED_MEALS}" == "1" ]]; then
    echo "[entrypoint] embed_meals"
    python manage.py embed_meals
  fi

  if [[ "${BOOTSTRAP_ONCE}" == "1" ]]; then
    echo "[entrypoint] Writing bootstrap flag ${BOOTSTRAP_FLAG}"
    touch "${BOOTSTRAP_FLAG}"
  fi
fi

echo "[entrypoint] Exec: $*"
exec "$@"