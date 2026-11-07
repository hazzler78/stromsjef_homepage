# Row-level security rollout (PR #7 follow-up)

## Context

[PR #7](https://github.com/hazzler78/stromsjef_homepage/pull/7) moved admin Supabase access to server routes using the **service role**, so these tables can use least-privilege RLS without breaking the admin UI:

| Table | Sensitivity | Client access after RLS |
|-------|-------------|-------------------------|
| `electricity_plans` | Public catalog | **anon/authenticated: SELECT** |
| `business_electricity_plans` | Public catalog | **anon/authenticated: SELECT** |
| `chatlog` | Private (PII / chat content) | **No anon/authenticated policies** |
| `banner_impressions`, `banner_clicks`, `hero_impressions`, `hero_clicks` | Operational analytics | **No anon/authenticated policies** |

Verified callers (codebase audit):

- **Anon key (browser):** `electricity_plans` on `/start-her`, `/starta-har`; `business_electricity_plans` on `/bedrift`; `electricity_plans` read in `/api/grokchat`.
- **Service role (server):** admin ` /api/admin/*`, `/api/grokchat` chatlog inserts, `/api/events/*` analytics inserts.
- **Not in PR #7 scope:** other tables (e.g. `forbrukerradet_prices`, `ai_knowledge`, admin pages still using anon) — unchanged by this migration.

Migration file: `supabase/migrations/20260307140000_enable_least_privilege_rls_pr7_tables.sql`

## Assumptions / unknowns

- Production may match either **RLS disabled** (audit hypothesis) or **RLS enabled with `USING (true)` policies** from legacy SQL scripts. The migration drops **all** existing policies on the seven tables, then applies the model above.
- Supabase **service_role** bypasses RLS (standard platform behavior). Local tests emulate this with a `BYPASSRLS` role.
- No Supabase Auth end-user JWT flows were found for these tables; `authenticated` is covered in tests for defense in depth only.
- This repo does not ship a linked remote migration history yet; apply via Supabase SQL editor or `supabase db push` once the CLI project is wired.

## Preflight (production)

1. Confirm **PR #7** is deployed and `ADMIN_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY` are set on Cloudflare Pages.
2. Export current policies (backup):

   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
   FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename IN (
       'banner_impressions','banner_clicks','hero_impressions','hero_clicks',
       'chatlog','electricity_plans','business_electricity_plans'
     )
   ORDER BY tablename, policyname;
   ```

3. Smoke-test **before** migration (anon REST or SQL as `anon`):

   - `SELECT` on `chatlog` should **not** be required for the public site; note if it still returns rows (vulnerability).
   - `SELECT` on `electricity_plans` must return catalog rows.

4. Run offline regression locally: `npm run test:rls-pr7`.

## Apply

1. Run the migration in a **staging** Supabase project first (or maintenance window on prod).
2. Re-run smoke tests:

   - Public `/start-her` and `/bedrift` load plans.
   - AI chat still logs (service role).
   - Admin chatlog + analytics pages load via `/api/admin/*`.

## Rollback (safe)

**Do not** `DISABLE ROW LEVEL SECURITY` on `chatlog` or analytics tables without restoring restrictive policies — that would immediately restore public read/write for anyone with the anon key.

Preferred rollback:

1. Re-apply the **policy backup** from preflight step 2 if you need the previous behavior.
2. If you must unwind the migration SQL, run a targeted rollback that **keeps RLS enabled** and only restores policies you intentionally want (never blanket `USING (true)` on `chatlog`).

Example emergency lockdown (deny anon reads on chatlog while investigating):

```sql
ALTER TABLE public.chatlog ENABLE ROW LEVEL SECURITY;
-- Drop permissive policies, add none for anon/authenticated (default deny).
```

## Test evidence

CI/local: `scripts/test-rls-pr7.sh` provisions a throwaway Postgres database, simulates pre-migration audit state (RLS off + legacy permissive policies), applies the migration, and asserts:

- Pre: anon can read/insert `chatlog`.
- Post: anon/authenticated cannot read private tables; catalog `SELECT` works; service role writes work.

Limits: tests use a **minimal** schema and local roles, not the live Supabase project. Always validate on staging before production.
