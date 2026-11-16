-- Cached daily gross sales from SaleSys public dashboards (server-fetched).

CREATE TABLE IF NOT EXISTS public.salesys_daily_sales (
  id BIGSERIAL PRIMARY KEY,
  sale_date DATE NOT NULL,
  supplier TEXT NOT NULL,
  product TEXT NOT NULL,
  orders INTEGER NOT NULL DEFAULT 0 CHECK (orders >= 0),
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT salesys_daily_sales_unique UNIQUE (sale_date, supplier, product)
);

CREATE INDEX IF NOT EXISTS idx_salesys_daily_sales_sale_date ON public.salesys_daily_sales (sale_date);
CREATE INDEX IF NOT EXISTS idx_salesys_daily_sales_supplier ON public.salesys_daily_sales (supplier);

ALTER TABLE public.salesys_daily_sales ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated policies: reads/writes go through service role on the server only.

COMMENT ON TABLE public.salesys_daily_sales IS 'Daily SaleSys Bruttosalg cache per supplier/product';
COMMENT ON COLUMN public.salesys_daily_sales.product IS 'Product name from dashboard breakdown, or __total__ for Bruttosalg';