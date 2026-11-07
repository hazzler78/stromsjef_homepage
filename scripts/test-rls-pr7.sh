#!/usr/bin/env bash
# Offline regression test for PR #7 least-privilege RLS migration.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="${RLS_TEST_DB_NAME:-stromsjef_rls_pr7_test}"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required (install PostgreSQL client/server)." >&2
  exit 1
fi

if ! sudo -u postgres psql -tAc "SELECT 1" >/dev/null 2>&1; then
  echo "PostgreSQL server is not reachable as user postgres." >&2
  exit 1
fi

sudo -u postgres psql -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS ${DB_NAME};"
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "CREATE DATABASE ${DB_NAME};"

RUN_PSQL() {
  sudo -u postgres psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" "$@"
}

(
  cd "${ROOT}"
  RUN_PSQL -f supabase/tests/fixtures/pr7_tables_schema.sql
  RUN_PSQL -f supabase/tests/fixtures/supabase_api_roles.sql
  RUN_PSQL -c "
    INSERT INTO public.chatlog (session_id, messages, ai_response)
    VALUES ('seed', '[{\"role\":\"user\",\"content\":\"hi\"}]'::jsonb, 'hello');
    INSERT INTO public.electricity_plans (id, supplier_name, plan_name, price_per_kwh, price_zone)
    VALUES ('plan-1', 'Supplier', 'Spot', 50, 'NO1');
    INSERT INTO public.business_electricity_plans (id, supplier_name, plan_name, price_per_kwh, price_zone)
    VALUES ('biz-1', 'Biz Supplier', 'Biz Spot', 55, 'NO1');
  "
  RUN_PSQL -f supabase/tests/fixtures/pre_migration_audit_state.sql
  RUN_PSQL -f supabase/tests/rls_pr7_regression.sql
)

echo "RLS PR7 regression tests passed."
