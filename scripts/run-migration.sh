#!/usr/bin/env bash
# 以 Supabase Management API 執行 migration SQL 並寫入 schema_migrations 歷史。
# 用法: SUPABASE_ACCESS_TOKEN=... ./scripts/run-migration.sh supabase/migrations/<version>_<name>.sql
set -euo pipefail

PROJECT_REF="cnsgjxqdyuondthmoqwf"
FILE="$1"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN is required" >&2
  exit 1
fi

BASENAME="$(basename "$FILE" .sql)"
VERSION="${BASENAME%%_*}"
NAME="${BASENAME#*_}"

run_sql() {
  local payload_file
  payload_file="$(mktemp)"
  python3 -c 'import json,sys; print(json.dumps({"query": open(sys.argv[1]).read()}))' "$1" > "$payload_file"
  local http_code
  http_code="$(curl -sS -o /tmp/run-migration-resp.json -w '%{http_code}' \
    -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    -H "Content-Type: application/json" \
    --data-binary "@${payload_file}")"
  rm -f "$payload_file"
  if [[ "$http_code" -ge 300 ]]; then
    echo "SQL FAILED (${http_code}): $(cat /tmp/run-migration-resp.json)" >&2
    return 1
  fi
}

run_sql "$FILE"

RECORD_FILE="$(mktemp)"
cat > "$RECORD_FILE" <<EOF
create schema if not exists supabase_migrations;
create table if not exists supabase_migrations.schema_migrations (
  version text primary key,
  statements text[],
  name text
);
insert into supabase_migrations.schema_migrations (version, name, statements)
values ('${VERSION}', '${NAME}', array[\$sqlbody\$$(cat "$FILE")\$sqlbody\$])
on conflict (version) do nothing;
EOF
run_sql "$RECORD_FILE"
rm -f "$RECORD_FILE"

echo "OK: ${VERSION}_${NAME}"
