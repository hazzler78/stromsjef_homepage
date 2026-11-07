-- Least-privilege RLS for tables prepared in PR #7 (admin via service role).
-- Tables: banner_impressions, banner_clicks, hero_impressions, hero_clicks,
--         chatlog, electricity_plans, business_electricity_plans
--
-- Intentional access model after this migration:
--   • anon / authenticated: SELECT only on electricity_plans and business_electricity_plans
--   • anon / authenticated: no access to chatlog or analytics tables (no policies => deny)
--   • service_role: unchanged (bypasses RLS in Supabase; used by server routes)

BEGIN;

-- Remove any permissive or legacy policies so we do not stack contradictory rules.
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
          'banner_impressions',
          'banner_clicks',
          'hero_impressions',
          'hero_clicks',
          'chatlog',
          'electricity_plans',
          'business_electricity_plans'
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

ALTER TABLE public.banner_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatlog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_electricity_plans ENABLE ROW LEVEL SECURITY;

-- Public electricity catalog (browser anon client on /start-her, /starta-har, /bedrift, grokchat read).
CREATE POLICY electricity_plans_public_read
  ON public.electricity_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY business_electricity_plans_public_read
  ON public.business_electricity_plans
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Private / operational tables: RLS enabled with no anon/authenticated policies.

COMMIT;
