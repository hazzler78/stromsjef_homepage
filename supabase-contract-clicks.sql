-- Tabell för att spåra klick på kontraktsknappar från AI-användare
CREATE TABLE IF NOT EXISTS contract_clicks (
  id SERIAL PRIMARY KEY,
  contract_type VARCHAR(20) NOT NULL CHECK (contract_type IN ('rorligt', 'fastpris')),
  log_id INTEGER REFERENCES invoice_ocr(id) ON DELETE SET NULL,
  savings_amount DECIMAL(10,2),
  session_id VARCHAR(255),
  source VARCHAR(50) DEFAULT 'jamfor-elpriser',
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabell för page views
CREATE TABLE IF NOT EXISTS page_views (
  id SERIAL PRIMARY KEY,
  path TEXT,
  session_id VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all to read page_views" ON page_views FOR SELECT USING (true);
CREATE POLICY "Allow all to insert page_views" ON page_views FOR INSERT WITH CHECK (true);


-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_contract_clicks_log_id ON contract_clicks(log_id);
CREATE INDEX IF NOT EXISTS idx_contract_clicks_contract_type ON contract_clicks(contract_type);
CREATE INDEX IF NOT EXISTS idx_contract_clicks_created_at ON contract_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_contract_clicks_source ON contract_clicks(source);

-- RLS (Row Level Security) - tillåt alla att läsa och skriva för tracking
ALTER TABLE contract_clicks ENABLE ROW LEVEL SECURITY;

-- Policy för att tillåta alla att läsa (för admin-sidan)
CREATE POLICY "Allow all to read contract_clicks" ON contract_clicks
  FOR SELECT USING (true);

-- Policy för att tillåta alla att skriva (för tracking)
CREATE POLICY "Allow all to insert contract_clicks" ON contract_clicks
  FOR INSERT WITH CHECK (true);

-- Funktion för att rensa gamla poster (äldre än 1 år)
CREATE OR REPLACE FUNCTION cleanup_old_contract_clicks()
RETURNS void AS $$
BEGIN
  DELETE FROM contract_clicks 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;

-- Kommentarer för dokumentation
COMMENT ON TABLE contract_clicks IS 'Spårar klick på kontraktsknappar från användare som har fått AI-analys';
COMMENT ON COLUMN contract_clicks.contract_type IS 'Typ av kontrakt som klickades på (rorligt/fastpris)';
COMMENT ON COLUMN contract_clicks.log_id IS 'Referens till invoice_ocr för att koppla till AI-analys';
COMMENT ON COLUMN contract_clicks.savings_amount IS 'Besparingsbelopp från AI-analysen';
COMMENT ON COLUMN contract_clicks.source IS 'Varifrån klicket kom (jamfor-elpriser, hero, etc.)';
