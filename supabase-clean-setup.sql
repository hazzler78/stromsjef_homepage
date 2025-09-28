-- Rensning och setup för ny Supabase-databas
-- Kör detta först för att rensa gamla tabeller

-- ============================================
-- 1. RENSA GAMLA TABELLER (om de finns)
-- ============================================

-- Drop all tables in correct order (foreign keys first)
DROP TABLE IF EXISTS bill_cost_items CASCADE;
DROP TABLE IF EXISTS bill_analysis CASCADE;
DROP TABLE IF EXISTS invoice_ocr_files CASCADE;
DROP TABLE IF EXISTS invoice_ocr CASCADE;
DROP TABLE IF EXISTS invoice_ocr_logs CASCADE;
DROP TABLE IF EXISTS contract_clicks CASCADE;
DROP TABLE IF EXISTS share_tracking CASCADE;
DROP TABLE IF EXISTS shared_cards CASCADE;
DROP TABLE IF EXISTS customer_reminders CASCADE;
DROP TABLE IF EXISTS contact_submissions CASCADE;
DROP TABLE IF EXISTS electricity_plans CASCADE;
DROP TABLE IF EXISTS ai_knowledge CASCADE;
DROP TABLE IF EXISTS ai_campaigns CASCADE;
DROP TABLE IF EXISTS ai_providers CASCADE;

-- ============================================
-- 2. SKAPA NYA TABELLER
-- ============================================

-- Invoice OCR tables
CREATE TABLE invoice_ocr_logs (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  file_name VARCHAR(255),
  file_size INTEGER,
  gpt_answer TEXT,
  processing_time_ms INTEGER,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_ocr (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  user_agent TEXT,
  file_mime VARCHAR(100),
  file_size INTEGER,
  image_sha256 VARCHAR(64),
  model VARCHAR(50),
  system_prompt_version VARCHAR(50),
  gpt_answer TEXT,
  consent BOOLEAN DEFAULT FALSE,
  is_correct BOOLEAN,
  correction_notes TEXT,
  corrected_total_extra DECIMAL(10,2),
  corrected_savings DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invoice_ocr_files (
  id SERIAL PRIMARY KEY,
  invoice_ocr_id INTEGER,
  storage_key TEXT NOT NULL,
  image_sha256 VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bill_analysis (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  invoice_ocr_id INTEGER,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_mime_type VARCHAR(100),
  image_sha256 VARCHAR(64),
  total_electricity_cost DECIMAL(10,2),
  total_extra_fees DECIMAL(10,2),
  potential_savings DECIMAL(10,2),
  analysis_summary TEXT,
  detailed_breakdown JSONB,
  model_used VARCHAR(50) DEFAULT 'gpt-4o',
  system_prompt_version VARCHAR(50) DEFAULT '2025-01-vision-v1',
  processing_time_ms INTEGER,
  consent_to_store BOOLEAN DEFAULT FALSE,
  analysis_confirmed BOOLEAN DEFAULT FALSE,
  is_correct BOOLEAN,
  correction_notes TEXT,
  corrected_total_extra DECIMAL(10,2),
  corrected_savings DECIMAL(10,2),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bill_cost_items (
  id SERIAL PRIMARY KEY,
  bill_analysis_id INTEGER,
  cost_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  section VARCHAR(50) NOT NULL,
  description TEXT,
  is_necessary BOOLEAN DEFAULT TRUE,
  is_extra_fee BOOLEAN DEFAULT FALSE,
  can_be_optimized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Knowledge tables
CREATE TABLE ai_knowledge (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  validFrom DATE NOT NULL,
  validTo DATE NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ai_providers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rorligt', 'fastpris', 'foretag')),
  features TEXT[] NOT NULL DEFAULT '{}',
  url TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Electricity plans
CREATE TABLE electricity_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('rorligt', 'fastpris', 'foretag')),
  price_per_kwh DECIMAL(10,4),
  monthly_fee DECIMAL(10,2),
  contract_length INTEGER,
  features TEXT[],
  url TEXT,
  active BOOLEAN DEFAULT TRUE,
  recommended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tracking tables
CREATE TABLE contract_clicks (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER,
  plan_name VARCHAR(255),
  provider VARCHAR(255),
  click_count INTEGER DEFAULT 1,
  last_clicked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE share_tracking (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  platform VARCHAR(50),
  url TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE shared_cards (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  source_host TEXT,
  archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reminders and contact
CREATE TABLE customer_reminders (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  reminder_type VARCHAR(50) NOT NULL,
  reminder_date DATE NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. INDEX FÖR PRESTANDA
-- ============================================

-- Invoice OCR indexes
CREATE INDEX idx_invoice_ocr_logs_session_id ON invoice_ocr_logs(session_id);
CREATE INDEX idx_invoice_ocr_logs_created_at ON invoice_ocr_logs(created_at);
CREATE INDEX idx_invoice_ocr_session_id ON invoice_ocr(session_id);
CREATE INDEX idx_invoice_ocr_created_at ON invoice_ocr(created_at);
CREATE INDEX idx_invoice_ocr_image_sha256 ON invoice_ocr(image_sha256);
CREATE INDEX idx_invoice_ocr_files_ocr_id ON invoice_ocr_files(invoice_ocr_id);
CREATE INDEX idx_bill_analysis_session_id ON bill_analysis(session_id);
CREATE INDEX idx_bill_analysis_created_at ON bill_analysis(created_at DESC);
CREATE INDEX idx_bill_analysis_invoice_ocr_id ON bill_analysis(invoice_ocr_id);
CREATE INDEX idx_bill_analysis_potential_savings ON bill_analysis(potential_savings);
CREATE INDEX idx_bill_cost_items_analysis_id ON bill_cost_items(bill_analysis_id);
CREATE INDEX idx_bill_cost_items_section ON bill_cost_items(section);
CREATE INDEX idx_bill_cost_items_is_extra_fee ON bill_cost_items(is_extra_fee);

-- AI Knowledge indexes
CREATE INDEX idx_knowledge_category ON ai_knowledge(category, active);
CREATE INDEX idx_knowledge_keywords ON ai_knowledge USING GIN(keywords);
CREATE INDEX idx_campaigns_dates ON ai_campaigns(validFrom, validTo, active);
CREATE INDEX idx_providers_type ON ai_providers(type, active);

-- Electricity plans indexes
CREATE INDEX idx_electricity_plans_type ON electricity_plans(type, active);
CREATE INDEX idx_electricity_plans_provider ON electricity_plans(provider);
CREATE INDEX idx_electricity_plans_recommended ON electricity_plans(recommended, active);

-- Tracking indexes
CREATE INDEX idx_contract_clicks_plan_id ON contract_clicks(plan_id);
CREATE INDEX idx_contract_clicks_created_at ON contract_clicks(created_at);
CREATE INDEX idx_share_tracking_session_id ON share_tracking(session_id);
CREATE INDEX idx_share_tracking_created_at ON share_tracking(created_at);
CREATE INDEX idx_shared_cards_created_at ON shared_cards(created_at DESC);
CREATE INDEX idx_shared_cards_source_host ON shared_cards(source_host);
CREATE INDEX idx_shared_cards_url ON shared_cards(url);
CREATE UNIQUE INDEX uniq_shared_cards_url ON shared_cards(url);

-- Reminders indexes
CREATE INDEX idx_customer_reminders_email ON customer_reminders(email);
CREATE INDEX idx_customer_reminders_date ON customer_reminders(reminder_date);
CREATE INDEX idx_customer_reminders_sent ON customer_reminders(sent);
CREATE INDEX idx_contact_submissions_created_at ON contact_submissions(created_at);

-- ============================================
-- 4. RLS (ROW LEVEL SECURITY)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE invoice_ocr_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_ocr ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_ocr_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE electricity_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on invoice_ocr_logs" ON invoice_ocr_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoice_ocr" ON invoice_ocr FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoice_ocr_files" ON invoice_ocr_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bill_analysis" ON bill_analysis FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on bill_cost_items" ON bill_cost_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_knowledge" ON ai_knowledge FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_campaigns" ON ai_campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ai_providers" ON ai_providers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on electricity_plans" ON electricity_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contract_clicks" ON contract_clicks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on share_tracking" ON share_tracking FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on shared_cards" ON shared_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on customer_reminders" ON customer_reminders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on contact_submissions" ON contact_submissions FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- 5. FUNKTIONER OCH TRIGGERS
-- ============================================

-- Function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_update_bill_analysis_updated_at
  BEFORE UPDATE ON bill_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_electricity_plans_updated_at
  BEFORE UPDATE ON electricity_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_update_shared_cards_updated_at
  BEFORE UPDATE ON shared_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. EXEMPELDATA (PÅ NORSKA)
-- ============================================

-- Lägg till exempel kunskapsartiklar (på norska)
INSERT INTO ai_knowledge (category, question, answer, keywords, active) VALUES
('strømavtaler', 'Hvordan finner jeg gode strømavtaler?', 'Registrer din e-post i skjemaet i foten av siden for å få tidlige tilbud før de blir fullbooket.', ARRAY['finne', 'gode', 'tilbud', 'registrere', 'e-post'], true),
('strømområder', 'Hvilket strømområde tilhører jeg?', 'Norge er delt inn i fem strømområder: **NO1** - Øst-Norge, **NO2** - Sør-Norge, **NO3** - Midt-Norge, **NO4** - Nord-Norge, **NO5** - Vest-Norge. Hvilket strømområde du tilhører avhenger av hvor du bor og påvirker strømprisen i din region.', ARRAY['strømområde', 'NO1', 'NO2', 'NO3', 'NO4', 'NO5', 'region'], true),
('angrerett', 'Kan jeg angre mitt strømavtale?', 'Ja, i henhold til distansavtaleloven har du angrerett i 14 dager når du inngår et avtale på distanse. Det betyr at du kan angre avtalet uten kostnad innenfor denne perioden. Unntak: betalt forbrukt strøm under angreperioden.', ARRAY['angre', 'avtale', '14 dager', 'distansavtaleloven', 'kostnad'], true);

-- Lägg till exempel kampanjer (på norska)
INSERT INTO ai_campaigns (title, description, validFrom, validTo, active) VALUES
('Spotpris avtale - 0 kr i avgifter', '0 kr i avgifter første året – uten bindingsperiode', '2025-01-01', '2025-12-31', true),
('Fastprisavtale med prisgaranti', 'Prisgaranti med valgfri bindingsperiode (1-3 år)', '2025-01-01', '2025-12-31', true),
('Bedriftsavtaler via Energi2.se', 'Spesielle bedriftsavtaler for bedrifter', '2025-01-01', '2025-12-31', true);

-- Lägg till exempel leverantörer (på norska)
INSERT INTO ai_providers (name, type, features, url, active) VALUES
('Cheap Energy', 'rorligt', ARRAY['0 kr månadsavgift', '0 øre påslag', 'Ingen bindingsperiode'], 'https://www.cheapenergy.se/elchef-rorligt/', true),
('Svealands Elbolag', 'fastpris', ARRAY['Prisgaranti', 'Valgfri bindingsperiode', 'Ingen skjulte avgifter'], 'https://www.svealandselbolag.se/elchef-fastpris/', true),
('Energi2.se', 'foretag', ARRAY['Bedriftsavtaler', 'Tilpassede løsninger', 'Volumrabatter'], 'https://energi2.se/elchef/', true);
