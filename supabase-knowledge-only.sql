-- Lägg bara till kunskapsbas för Stromsjef (behåller befintliga tabeller)
-- Kör detta för att lägga till AI-kunskapsbasen utan att röra electricity_plans

-- ============================================
-- 1. AI KUNSKAPSBAS TABELLER (nytt)
-- ============================================

CREATE TABLE IF NOT EXISTS ai_knowledge (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  validFrom DATE NOT NULL,
  validTo DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rorligt', 'fastpris', 'foretag')),
  features TEXT[] NOT NULL DEFAULT '{}',
  url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. INDEX FÖR KUNSKAPSBAS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON ai_knowledge(category, active);
CREATE INDEX IF NOT EXISTS idx_knowledge_keywords ON ai_knowledge USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_campaigns_dates ON ai_campaigns(validFrom, validTo, active);
CREATE INDEX IF NOT EXISTS idx_providers_type ON ai_providers(type, active);

-- ============================================
-- 3. RLS (ROW LEVEL SECURITY)
-- ============================================

ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on ai_knowledge" ON ai_knowledge FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_campaigns" ON ai_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_providers" ON ai_providers FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 4. NORSKA EXEMPELDATA
-- ============================================

-- Lägg till exempel kunskapsartiklar (på norska)
INSERT INTO ai_knowledge (category, question, answer, keywords, active) VALUES
('strømavtaler', 'Hvordan finner jeg gode strømavtaler?', 'Registrer din e-post i skjemaet i foten av siden for å få tidlige tilbud før de blir fullbooket.', ARRAY['finne', 'gode', 'tilbud', 'registrere', 'e-post'], true),
('strømområder', 'Hvilket strømområde tilhører jeg?', 'Norge er delt inn i fem strømområder: **NO1** - Øst-Norge, **NO2** - Sør-Norge, **NO3** - Midt-Norge, **NO4** - Nord-Norge, **NO5** - Vest-Norge. Hvilket strømområde du tilhører avhenger av hvor du bor og påvirker strømprisen i din region.', ARRAY['strømområde', 'NO1', 'NO2', 'NO3', 'NO4', 'NO5', 'region'], true),
('angrerett', 'Kan jeg angre mitt strømavtale?', 'Ja, i henhold til distansavtaleloven har du angrerett i 14 dager når du inngår et avtale på distanse. Det betyr at du kan angre avtalet uten kostnad innenfor denne perioden. Unntak: betalt forbrukt strøm under angreperioden.', ARRAY['angre', 'avtale', '14 dager', 'distansavtaleloven', 'kostnad'], true)
ON CONFLICT DO NOTHING;

-- Lägg till exempel kampanjer (på norska)
INSERT INTO ai_campaigns (title, description, validFrom, validTo, active) VALUES
('Spotpris avtale - 0 kr i avgifter', '0 kr i avgifter første året – uten bindingsperiode', '2025-01-01', '2025-12-31', true),
('Fastprisavtale med prisgaranti', 'Prisgaranti med valgfri bindingsperiode (1-3 år)', '2025-01-01', '2025-12-31', true),
('Bedriftsavtaler via Energi2.se', 'Spesielle bedriftsavtaler for bedrifter', '2025-01-01', '2025-12-31', true)
ON CONFLICT DO NOTHING;

-- Lägg till exempel leverantörer (på norska)
INSERT INTO ai_providers (name, type, features, url, active) VALUES
('Cheap Energy', 'rorligt', ARRAY['0 kr månadsavgift', '0 øre påslag', 'Ingen bindingsperiode'], 'https://www.cheapenergy.se/elchef-rorligt/', true),
('Svealands Elbolag', 'fastpris', ARRAY['Prisgaranti', 'Valgfri bindingsperiode', 'Ingen skjulte avgifter'], 'https://www.svealandselbolag.se/elchef-fastpris/', true),
('Energi2.se', 'foretag', ARRAY['Bedriftsavtaler', 'Tilpassede løsninger', 'Volumrabatter'], 'https://energi2.se/elchef/', true)
ON CONFLICT DO NOTHING;
