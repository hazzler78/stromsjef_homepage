-- contract_clicks was defined in repo SQL but missing in live Supabase (breaks /admin/funnel & /admin/contract-clicks).

CREATE TABLE IF NOT EXISTS public.contract_clicks (
  id SERIAL PRIMARY KEY,
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('rorligt', 'fastpris')),
  log_id INTEGER,
  savings_amount DECIMAL(10, 2),
  session_id VARCHAR(255),
  source VARCHAR(50) DEFAULT 'jamfor-elpriser',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contract_clicks_log_id ON public.contract_clicks (log_id);
CREATE INDEX IF NOT EXISTS idx_contract_clicks_contract_type ON public.contract_clicks (contract_type);
CREATE INDEX IF NOT EXISTS idx_contract_clicks_created_at ON public.contract_clicks (created_at);
CREATE INDEX IF NOT EXISTS idx_contract_clicks_source ON public.contract_clicks (source);

ALTER TABLE public.contract_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to read contract_clicks"
  ON public.contract_clicks
  FOR SELECT
  USING (true);

CREATE POLICY "Allow all to insert contract_clicks"
  ON public.contract_clicks
  FOR INSERT
  WITH CHECK (true);

COMMENT ON TABLE public.contract_clicks IS 'Spårar klick på kontraktsknappar från AI-användare';