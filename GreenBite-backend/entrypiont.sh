#!/usr/bin/env bash
set -euo pipefail

# ---- Settings (override in docker-compose.yml) ----
: "${DB_HOST:=db}"
: "${DB_PORT:=5432}"
: "${DB_NAME:=greenbite}"
: "${DB_USER:=postgres}"
: "${DB_PASSWORD:=postgres}"

: "${RUN_MIGRATIONS:=1}"

# run-once guard to prevent repeating heavy bootstrap in both backend + celery containers
: "${BOOTSTRAP_ONCE:=1}"
BOOTSTRAP_FLAG="/app/.bootstrap_done"

# Optional bootstrap jobs (set to 1 in compose when you want them)
: "${IMPORT_MEALDB:=0}"
: "${TOKENIZE_INGREDIENTS:=0}"
: "${BUILD_EMBEDDINGS:=0}"

# Optional args
: "${MEALDB_LIMIT:=0}"
: "${MEALDB_SLEEP:=0.25}"
: "${TOKENS_BATCH_SIZE:=300}"
: "${TOKENS_LIMIT:=0}"

echo "[entrypoint] DB=${DB_HOST}:${DB_PORT} name=${DB_NAME} user=${DB_USER}"
echo "[entrypoint] RUN_MIGRATIONS=${RUN_MIGRATIONS} IMPORT_MEALDB=${IMPORT_MEALDB} TOKENIZE_INGREDIENTS=${TOKENIZE_INGREDIENTS} BUILD_EMBEDDINGS=${BUILD_EMBEDDINGS}"

# ---- Wait for Postgres ----
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

# ---- Bootstrap guard ----
do_bootstrap="1"
if [[ "${BOOTSTRAP_ONCE}" == "1" && -f "${BOOTSTRAP_FLAG}" ]]; then
  do_bootstrap="0"
  echo "[entrypoint] Bootstrap already done (${BOOTSTRAP_FLAG})"
fi

# ---- Migrations ----
if [[ "${RUN_MIGRATIONS}" == "1" ]]; then
  echo "[entrypoint] makemigrations --merge --noinput"
  python manage.py makemigrations --merge --noinput || true

  echo "[entrypoint] makemigrations"
  python manage.py makemigrations

  echo "[entrypoint] migrate --noinput"
  python manage.py migrate --noinput
fi

# ---- One-time heavy jobs ----
if [[ "${do_bootstrap}" == "1" ]]; then
  if [[ "${IMPORT_MEALDB}" == "1" ]]; then
    echo "[entrypoint] Importing MealDB..."
    # You must have this command; if different name, change it.
    python manage.py import_mealdb --limit "${MEALDB_LIMIT}" --sleep "${MEALDB_SLEEP}"
  fi

  if [[ "${TOKENIZE_INGREDIENTS}" == "1" ]]; then
    echo "[entrypoint] Tokenizing ingredients..."
    # You must have this command; if different name, change it.
    python manage.py tokenize_ingredients --batch-size "${TOKENS_BATCH_SIZE}" --limit "${TOKENS_LIMIT}"
  fi

  if [[ "${BUILD_EMBEDDINGS}" == "1" ]]; then
    echo "[entrypoint] Building embeddings..."
    # You must have this command; if different name, change it.
    python manage.py build_embeddings
  fi

  if [[ "${BOOTSTRAP_ONCE}" == "1" ]]; then
    echo "[entrypoint] Writing bootstrap flag ${BOOTSTRAP_FLAG}"
    touch "${BOOTSTRAP_FLAG}"
  fi
fi

echo "[entrypoint] Exec: $*"
exec "$@"