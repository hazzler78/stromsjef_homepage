-- Server-side cache writes for SaleSys daily sales (bypasses RLS when JWT is mis-scoped).

GRANT ALL ON TABLE public.salesys_daily_sales TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.salesys_daily_sales_id_seq TO service_role;

DROP POLICY IF EXISTS salesys_daily_sales_service_role_all ON public.salesys_daily_sales;

CREATE POLICY salesys_daily_sales_service_role_all
  ON public.salesys_daily_sales
  AS PERMISSIVE
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.admin_upsert_salesys_daily_sales(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted integer := 0;
BEGIN
  IF p_rows IS NULL OR jsonb_typeof(p_rows) <> 'array' THEN
    RETURN 0;
  END IF;

  INSERT INTO public.salesys_daily_sales AS t (
    sale_date,
    supplier,
    product,
    orders,
    fetched_at
  )
  SELECT
    (r->>'sale_date')::date,
    r->>'supplier',
    r->>'product',
    COALESCE((r->>'orders')::integer, 0),
    COALESCE((r->>'fetched_at')::timestamptz, NOW())
  FROM jsonb_array_elements(p_rows) AS r
  ON CONFLICT (sale_date, supplier, product)
  DO UPDATE SET
    orders = EXCLUDED.orders,
    fetched_at = EXCLUDED.fetched_at;

  GET DIAGNOSTICS inserted = ROW_COUNT;
  RETURN inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_upsert_salesys_daily_sales(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_upsert_salesys_daily_sales(jsonb) TO service_role;

COMMENT ON FUNCTION public.admin_upsert_salesys_daily_sales IS 'Upsert SaleSys cache rows from admin visitors-per-sale worker';