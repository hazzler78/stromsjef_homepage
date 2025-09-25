-- SQL schema för att spåra social delning av AI-kalkyler
-- Kör detta i din Supabase SQL editor

-- Tabell för att spåra delningar
CREATE TABLE IF NOT EXISTS share_clicks (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin', 'twitter')),
  log_id INTEGER REFERENCES invoice_ocr_logs(id) ON DELETE SET NULL,
  savings_amount DECIMAL(10,2),
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_share_clicks_platform ON share_clicks(platform);
CREATE INDEX IF NOT EXISTS idx_share_clicks_created_at ON share_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_share_clicks_log_id ON share_clicks(log_id);

-- Tabell för att spåra delade kalkyler (för framtida funktionalitet)
CREATE TABLE IF NOT EXISTS shared_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id INTEGER REFERENCES invoice_ocr_logs(id) ON DELETE CASCADE,
  savings_amount DECIMAL(10,2) NOT NULL,
  platform VARCHAR(20) NOT NULL,
  is_anonymous BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för delade kalkyler
CREATE INDEX IF NOT EXISTS idx_shared_calculations_log_id ON shared_calculations(log_id);
CREATE INDEX IF NOT EXISTS idx_shared_calculations_expires_at ON shared_calculations(expires_at);

-- RLS (Row Level Security) policies
ALTER TABLE share_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_calculations ENABLE ROW LEVEL SECURITY;

-- Policy för share_clicks - tillåt alla att läsa och skriva (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow all operations on share_clicks' 
      AND schemaname = 'public' 
      AND tablename = 'share_clicks'
  ) THEN
    CREATE POLICY "Allow all operations on share_clicks" ON share_clicks
      FOR ALL USING (true);
  END IF;
END $$;

-- Policy för shared_calculations - tillåt alla att läsa aktiva delningar (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow read active shared calculations' 
      AND schemaname = 'public' 
      AND tablename = 'shared_calculations'
  ) THEN
    CREATE POLICY "Allow read active shared calculations" ON shared_calculations
      FOR SELECT USING (expires_at > NOW());
  END IF;
END $$;

-- Policy för shared_calculations - tillåt skapande av delningar (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow insert shared calculations' 
      AND schemaname = 'public' 
      AND tablename = 'shared_calculations'
  ) THEN
    CREATE POLICY "Allow insert shared calculations" ON shared_calculations
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Funktion för att rensa gamla delningar
CREATE OR REPLACE FUNCTION cleanup_expired_shared_calculations()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_calculations WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Kommentarer för dokumentation
COMMENT ON TABLE share_clicks IS 'Spårar när användare delar sina AI-kalkyler på sociala medier';
COMMENT ON TABLE shared_calculations IS 'Lagrar delade kalkyler med begränsad livslängd för säkerhet';
COMMENT ON COLUMN share_clicks.platform IS 'Social media plattform där kalkylen delades';
COMMENT ON COLUMN share_clicks.savings_amount IS 'Besparingsbelopp från AI-analysen';
COMMENT ON COLUMN shared_calculations.expires_at IS 'När den delade kalkylen automatiskt tas bort';
