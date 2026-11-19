-- Manual ops script (NOT applied by CI). Run in Supabase SQL Editor or psql.
-- Repo: stromsjef_homepage — 2026-11-19
--
-- Tables covered:
--   • electricity_plans — catalog read from browser (anon)
--   • banner_settings — campaign banner read + admin write from browser (anon)
--   • chatlog — server-only writes (service role via /api/grokchat, /api/admin/chatlog)
--
-- hero_settings: no table with this name exists in the repo. Hero markup is static
-- (src/components/Hero.tsx). Chat promo copy lives in chat_popup_settings
-- (supabase-chat-popup.sql); not altered here — add a follow-up if RLS is needed there too.

BEGIN;

-- ---------------------------------------------------------------------------
-- Normalize policies on target tables (avoid stacked / legacy rules)
-- ---------------------------------------------------------------------------
DO $drop$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = ANY (
        ARRAY[
          'electricity_plans',
          'banner_settings',
          'chatlog'
        ]::name[]
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname,
      r.schemaname,
      r.tablename
    );
  END LOOP;
END
$drop$;

-- ---------------------------------------------------------------------------
-- electricity_plans — public catalog (SELECT only for anon/authenticated)
-- ---------------------------------------------------------------------------
ALTER TABLE public.electricity_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY electricity_plans_public_read
  ON public.electricity_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Writes: /api/admin/electricity-plans/* uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).

-- ---------------------------------------------------------------------------
-- banner_settings — public read; browser admin uses anon key (see PR notes)
-- ---------------------------------------------------------------------------
ALTER TABLE public.banner_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY banner_settings_public_read
  ON public.banner_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Required for /admin/banner-settings (NEXT_PUBLIC_SUPABASE_ANON_KEY): insert + upsert.
CREATE POLICY banner_settings_anon_insert
  ON public.banner_settings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY banner_settings_anon_update
  ON public.banner_settings
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- chatlog — no anon/authenticated policies (deny all client access)
-- Inserts: src/app/api/grokchat/route.ts with service role only.
-- Admin CRUD: /api/admin/chatlog with service role only.
-- ---------------------------------------------------------------------------
ALTER TABLE public.chatlog ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies for anon / authenticated.

-- ---------------------------------------------------------------------------
-- Data fix: Bærum fast 1-år NO3 binding period (months)
-- Primary key column: id (text) — see supabase-electricity-plans.sql
-- ---------------------------------------------------------------------------
UPDATE public.electricity_plans
SET
  binding_time = 12,
  updated_at = NOW()
WHERE id = 'baerum-fast-NO3-1ar';

COMMIT;