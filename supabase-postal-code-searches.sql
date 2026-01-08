-- Postnummer-sökningar tabell för marknadsföringsanalys
-- Denna tabell lagrar information om när kunder söker på postnummer

CREATE TABLE IF NOT EXISTS postal_code_searches (
  id SERIAL PRIMARY KEY,
  postal_code VARCHAR(10) NOT NULL,
  price_zone VARCHAR(10), -- NO1, NO2, NO3, NO4, NO5, ALL
  zone_source VARCHAR(20), -- 'postal_code', 'manual', 'inferred'
  page_path VARCHAR(255), -- Vilken sida sökningen gjordes från (t.ex. /starta-har, /start-her)
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  utm_source VARCHAR(255), -- UTM tracking
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  plans_shown INTEGER DEFAULT 0, -- Antal avtaler som visades
  clicked_plan BOOLEAN DEFAULT FALSE, -- Om användaren klickade på ett avtal
  clicked_supplier VARCHAR(255), -- Vilken leverantör de klickade på
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för snabb uppslagning
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_postal_code ON postal_code_searches(postal_code);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_price_zone ON postal_code_searches(price_zone);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_created_at ON postal_code_searches(created_at);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_session ON postal_code_searches(session_id);
CREATE INDEX IF NOT EXISTS idx_postal_code_searches_page_path ON postal_code_searches(page_path);

-- RLS (Row Level Security) - tillåt läsning för alla, skrivning endast via API
ALTER TABLE postal_code_searches ENABLE ROW LEVEL SECURITY;

-- Tillåt alla att läsa (för admin-panel)
CREATE POLICY "Allow public read access" ON postal_code_searches
  FOR SELECT
  USING (true);

-- Tillåt alla att skapa (för att spara sökningar)
CREATE POLICY "Allow public insert" ON postal_code_searches
  FOR INSERT
  WITH CHECK (true);
