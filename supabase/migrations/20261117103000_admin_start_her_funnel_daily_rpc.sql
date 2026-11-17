-- Aggregated /start-her funnel by Stockholm calendar day (one round trip for admin visitors-per-sale).

CREATE OR REPLACE FUNCTION public.admin_start_her_funnel_daily(
  p_from timestamptz,
  p_to timestamptz
)
RETURNS TABLE (
  day date,
  start_her_sessions bigint,
  plan_clicks bigint,
  supplier_clicks jsonb
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH filtered AS (
    SELECT
      (created_at AT TIME ZONE 'Europe/Stockholm')::date AS day,
      id,
      session_id,
      clicked_plan,
      clicked_supplier
    FROM public.postal_code_searches
    WHERE created_at >= p_from
      AND created_at <= p_to
      AND (
        page_path IN ('/start-her', '/starta-har')
        OR page_path LIKE '/start-her?%'
        OR page_path LIKE '/starta-har?%'
      )
  ),
  day_stats AS (
    SELECT
      day,
      COUNT(DISTINCT COALESCE(NULLIF(session_id, ''), id::text))::bigint AS start_her_sessions,
      COUNT(*) FILTER (WHERE clicked_plan IS TRUE)::bigint AS plan_clicks
    FROM filtered
    GROUP BY day
  ),
  supplier_stats AS (
    SELECT
      day,
      jsonb_object_agg(lower(trim(clicked_supplier)), cnt) AS supplier_clicks
    FROM (
      SELECT
        day,
        clicked_supplier,
        COUNT(*)::bigint AS cnt
      FROM filtered
      WHERE clicked_supplier IS NOT NULL AND trim(clicked_supplier) <> ''
      GROUP BY day, clicked_supplier
    ) s
    GROUP BY day
  )
  SELECT
    d.day,
    d.start_her_sessions,
    d.plan_clicks,
    COALESCE(s.supplier_clicks, '{}'::jsonb)
  FROM day_stats d
  LEFT JOIN supplier_stats s ON s.day = d.day
  ORDER BY d.day;
$$;

REVOKE ALL ON FUNCTION public.admin_start_her_funnel_daily(timestamptz, timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_start_her_funnel_daily(timestamptz, timestamptz) TO service_role;

COMMENT ON FUNCTION public.admin_start_her_funnel_daily IS 'Daily /start-her funnel aggregates for admin visitors-per-sale';