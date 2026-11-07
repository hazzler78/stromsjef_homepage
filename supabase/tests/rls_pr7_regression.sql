-- Offline regression checks for PR #7 RLS migration.
-- Run via: npm run test:rls-pr7

\set ON_ERROR_STOP on

CREATE OR REPLACE FUNCTION public._test_fail(msg text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'RLS regression failed: %', msg;
END;
$$;

CREATE OR REPLACE FUNCTION public._test_eq(actual bigint, expected bigint, msg text) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF actual IS DISTINCT FROM expected THEN
    PERFORM public._test_fail(format('%s (got %s, want %s)', msg, actual, expected));
  END IF;
END;
$$;

-- ---------- BEFORE migration (audit / legacy state) ----------
DO $before$
DECLARE
  c bigint;
BEGIN
  SET LOCAL row_security = on;
  SET ROLE anon;

  SELECT count(*) INTO c FROM public.chatlog;
  PERFORM public._test_eq(c, 1, 'pre-migration: anon should read chatlog when RLS is disabled');

  SELECT count(*) INTO c FROM public.electricity_plans;
  PERFORM public._test_eq(c, 1, 'pre-migration: anon should read electricity_plans');

  INSERT INTO public.chatlog (session_id, messages, ai_response)
  VALUES ('anon-pre', '[]'::jsonb, 'leak-test');
  PERFORM public._test_eq(1, 1, 'pre-migration: anon insert chatlog should succeed without RLS');

  DELETE FROM public.chatlog WHERE session_id = 'anon-pre';
END
$before$;

DO $before_auth$
DECLARE
  c bigint;
BEGIN
  SET LOCAL row_security = on;
  SET ROLE authenticated;

  SELECT count(*) INTO c FROM public.chatlog;
  PERFORM public._test_eq(c, 1, 'pre-migration: authenticated should read chatlog when RLS is disabled');
END
$before_auth$;

RESET ROLE;

-- ---------- Apply migration ----------
\i supabase/migrations/20260307140000_enable_least_privilege_rls_pr7_tables.sql

-- ---------- AFTER migration ----------
DO $after_anon$
DECLARE
  c bigint;
  ok boolean;
BEGIN
  SET LOCAL row_security = on;
  SET ROLE anon;

  SELECT count(*) INTO c FROM public.chatlog;
  PERFORM public._test_eq(c, 0, 'post-migration: anon must not read chatlog');

  SELECT count(*) INTO c FROM public.banner_impressions;
  PERFORM public._test_eq(c, 0, 'post-migration: anon must not read banner_impressions');

  SELECT count(*) INTO c FROM public.electricity_plans;
  PERFORM public._test_eq(c, 1, 'post-migration: anon should read electricity_plans');

  SELECT count(*) INTO c FROM public.business_electricity_plans;
  PERFORM public._test_eq(c, 1, 'post-migration: anon should read business_electricity_plans');

  ok := false;
  BEGIN
    INSERT INTO public.electricity_plans (id, supplier_name, plan_name, price_per_kwh, price_zone)
    VALUES ('anon-write', 'x', 'y', 1, 'NO1');
    ok := true;
  EXCEPTION WHEN insufficient_privilege THEN
    ok := false;
  END;
  IF ok THEN
    PERFORM public._test_fail('post-migration: anon must not insert electricity_plans');
  END IF;

  ok := false;
  BEGIN
    INSERT INTO public.chatlog (session_id, messages) VALUES ('blocked', '[]'::jsonb);
    ok := true;
  EXCEPTION WHEN insufficient_privilege THEN
    ok := false;
  END;
  IF ok THEN
    PERFORM public._test_fail('post-migration: anon must not insert chatlog');
  END IF;
END
$after_anon$;

DO $after_auth$
DECLARE
  c bigint;
BEGIN
  SET LOCAL row_security = on;
  SET ROLE authenticated;

  SELECT count(*) INTO c FROM public.chatlog;
  PERFORM public._test_eq(c, 0, 'post-migration: authenticated must not read chatlog');

  SELECT count(*) INTO c FROM public.electricity_plans;
  PERFORM public._test_eq(c, 1, 'post-migration: authenticated should read catalog plans');
END
$after_auth$;

DO $after_service$
DECLARE
  c bigint;
BEGIN
  RESET ROLE;
  SET ROLE service_role;

  INSERT INTO public.chatlog (session_id, messages, ai_response)
  VALUES ('server-write', '[]'::jsonb, 'ok');

  INSERT INTO public.banner_impressions (variant, session_id)
  VALUES ('A', 'server-write');

  SELECT count(*) INTO c FROM public.chatlog WHERE session_id = 'server-write';
  PERFORM public._test_eq(c, 1, 'post-migration: service_role should insert/read chatlog');

  SELECT count(*) INTO c FROM public.banner_impressions WHERE session_id = 'server-write';
  PERFORM public._test_eq(c, 1, 'post-migration: service_role should insert analytics rows');
END
$after_service$;

RESET ROLE;

SELECT 'rls_pr7_regression: OK' AS result;
