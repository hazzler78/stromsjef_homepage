-- SQL schema för shared_cards tabell (Telegram bot media funktionalitet)
-- Kör detta i din nya Supabase SQL editor

-- Tabell för att lagra delade länkar från Telegram bot
CREATE TABLE IF NOT EXISTS shared_cards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  source_host TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_shared_cards_created_at ON shared_cards(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_cards_source_host ON shared_cards(source_host);
CREATE INDEX IF NOT EXISTS idx_shared_cards_url ON shared_cards(url);

-- RLS (Row Level Security) policies
ALTER TABLE shared_cards ENABLE ROW LEVEL SECURITY;

-- Policy för shared_cards - tillåt alla att läsa och skriva (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Allow all operations on shared_cards' 
      AND schemaname = 'public' 
      AND tablename = 'shared_cards'
  ) THEN
    CREATE POLICY "Allow all operations on shared_cards" ON shared_cards
      FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Funktion för att uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION update_shared_cards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger för att automatiskt uppdatera updated_at
DROP TRIGGER IF EXISTS trigger_update_shared_cards_updated_at ON shared_cards;
CREATE TRIGGER trigger_update_shared_cards_updated_at
  BEFORE UPDATE ON shared_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_shared_cards_updated_at();

-- Kommentarer för dokumentation
COMMENT ON TABLE shared_cards IS 'Lagrar delade länkar från Telegram bot som visas på /media sidan';
COMMENT ON COLUMN shared_cards.title IS 'Titel på den delade länken';
COMMENT ON COLUMN shared_cards.summary IS 'AI-genererad sammanfattning av innehållet';
COMMENT ON COLUMN shared_cards.url IS 'Original URL som delades';
COMMENT ON COLUMN shared_cards.source_host IS 'Värdnamn för källan (t.ex. example.com)';
