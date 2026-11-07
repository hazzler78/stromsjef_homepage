-- Simulates the audit finding: RLS disabled on PR #7 tables (open API grants still apply).

ALTER TABLE public.banner_impressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banner_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_impressions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_clicks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatlog DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricity_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_electricity_plans DISABLE ROW LEVEL SECURITY;

-- Legacy permissive policy sometimes shipped in supabase-chatlog.sql / supabase-clean-setup.sql
DROP POLICY IF EXISTS "Allow all operations on chatlog" ON public.chatlog;
CREATE POLICY "Allow all operations on chatlog" ON public.chatlog
  FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all operations on electricity_plans" ON public.electricity_plans;
CREATE POLICY "Allow all operations on electricity_plans" ON public.electricity_plans
  FOR ALL USING (true) WITH CHECK (true);
