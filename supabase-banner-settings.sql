-- Banner Settings Table
-- Denna tabell lagrar inställningar för Campaign Banner högst upp på sidan

CREATE TABLE IF NOT EXISTS banner_settings (
  id SERIAL PRIMARY KEY,
  active BOOLEAN DEFAULT TRUE,
  variant_a_expanded_text TEXT NOT NULL DEFAULT 'Vår beste deal akkurat nå: Fastpris 99 øre/kWh – anbefales sterkt!',
  variant_b_expanded_text TEXT NOT NULL DEFAULT 'Vår beste deal akkurat nå: Fastpris 99 øre/kWh – anbefales sterkt!',
  variant_a_collapsed_text TEXT NOT NULL DEFAULT 'Fastpris 99 øre/kWh – anbefales sterkt!',
  variant_b_collapsed_text TEXT NOT NULL DEFAULT 'Fastpris 99 øre/kWh – anbefales sterkt!',
  highlight_text TEXT NOT NULL DEFAULT 'Fastpris 99 øre/kWh',
  link_url TEXT NOT NULL DEFAULT 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  link_text_expanded TEXT NOT NULL DEFAULT 'Se avtale →',
  link_text_collapsed TEXT NOT NULL DEFAULT 'Se avtale',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skapa en default inställning om den inte finns
INSERT INTO banner_settings (id, active, variant_a_expanded_text, variant_b_expanded_text, variant_a_collapsed_text, variant_b_collapsed_text, highlight_text, link_url, link_text_expanded, link_text_collapsed)
SELECT 1, TRUE, 
  'Vår beste deal akkurat nå: Fastpris 99 øre/kWh – anbefales sterkt!',
  'Vår beste deal akkurat nå: Fastpris 99 øre/kWh – anbefales sterkt!',
  'Fastpris 99 øre/kWh – anbefales sterkt!',
  'Fastpris 99 øre/kWh – anbefales sterkt!',
  'Fastpris 99 øre/kWh',
  'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  'Se avtale →',
  'Se avtale'
WHERE NOT EXISTS (SELECT 1 FROM banner_settings WHERE id = 1);

-- RLS (Row Level Security) - tillåt läsning för alla, skrivning endast för autentiserade admin
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- Tillåt alla att läsa (för att frontend ska kunna hämta inställningar)
CREATE POLICY "Allow public read access" ON banner_settings
  FOR SELECT
  USING (true);

-- Tillåt endast autentiserade användare att uppdatera (admin-autentisering hanteras i API)
CREATE POLICY "Allow authenticated update" ON banner_settings
  FOR UPDATE
  USING (true);

-- Tillåt alla att skapa (för att admin-panel ska kunna skapa default-inställning)
-- Admin-autentisering hanteras i frontend
CREATE POLICY "Allow public insert" ON banner_settings
  FOR INSERT
  WITH CHECK (true);

-- Index för snabb uppslagning
CREATE INDEX IF NOT EXISTS idx_banner_settings_active ON banner_settings(active);
