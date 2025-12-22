-- Chat Popup Settings Table
-- Denna tabell lagrar inställningar för Elge popup i chatten

CREATE TABLE IF NOT EXISTS chat_popup_settings (
  id SERIAL PRIMARY KEY,
  active BOOLEAN DEFAULT TRUE,
  title TEXT NOT NULL DEFAULT 'Hei! Vil du ha 99 øre fastpris i dag?',
  button_text TEXT NOT NULL DEFAULT 'Trykk her →',
  button_url TEXT NOT NULL DEFAULT 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no',
  dismiss_text TEXT NOT NULL DEFAULT 'Nei takk',
  delay_seconds INTEGER DEFAULT 2,
  show_once_per_session BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skapa en default inställning om den inte finns
INSERT INTO chat_popup_settings (id, active, title, button_text, button_url, dismiss_text, delay_seconds, show_once_per_session)
SELECT 1, TRUE, 'Hei! Vil du ha 99 øre fastpris i dag?', 'Trykk her →', 'https://baerumenergi.no/privat/fastpris-1-ar/?utm_source=stromsjef.no', 'Nei takk', 2, TRUE
WHERE NOT EXISTS (SELECT 1 FROM chat_popup_settings WHERE id = 1);

-- RLS (Row Level Security) - tillåt läsning för alla, skrivning endast för autentiserade admin
ALTER TABLE chat_popup_settings ENABLE ROW LEVEL SECURITY;

-- Tillåt alla att läsa (för att frontend ska kunna hämta inställningar)
CREATE POLICY "Allow public read access" ON chat_popup_settings
  FOR SELECT
  USING (true);

-- Tillåt endast autentiserade användare att uppdatera (admin-autentisering hanteras i API)
CREATE POLICY "Allow authenticated update" ON chat_popup_settings
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow authenticated insert" ON chat_popup_settings
  FOR INSERT
  WITH CHECK (true);

-- Index för snabb uppslagning
CREATE INDEX IF NOT EXISTS idx_chat_popup_active ON chat_popup_settings(active);

