-- SQL schema för att lagra detaljerade elräkning analyser
-- Kör detta i din Supabase SQL editor

-- Tabell för att lagra detaljerade analyser av elräkningar
CREATE TABLE IF NOT EXISTS bill_analysis (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  invoice_ocr_id INTEGER REFERENCES invoice_ocr_logs(id) ON DELETE CASCADE,
  
  -- Grundläggande information
  file_name VARCHAR(255),
  file_size INTEGER,
  file_mime_type VARCHAR(100),
  image_sha256 VARCHAR(64),
  
  -- Analysresultat
  total_electricity_cost DECIMAL(10,2),
  total_extra_fees DECIMAL(10,2),
  potential_savings DECIMAL(10,2),
  analysis_summary TEXT,
  detailed_breakdown JSONB,
  
  -- AI-modell information
  model_used VARCHAR(50) DEFAULT 'gpt-4o',
  system_prompt_version VARCHAR(50) DEFAULT '2025-01-vision-v1',
  processing_time_ms INTEGER,
  
  -- Användarinställningar
  consent_to_store BOOLEAN DEFAULT FALSE,
  analysis_confirmed BOOLEAN DEFAULT FALSE,
  
  -- Feedback och korrigeringar
  is_correct BOOLEAN,
  correction_notes TEXT,
  corrected_total_extra DECIMAL(10,2),
  corrected_savings DECIMAL(10,2),
  
  -- Metadata
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabell för att lagra individuella kostnader från analysen
CREATE TABLE IF NOT EXISTS bill_cost_items (
  id SERIAL PRIMARY KEY,
  bill_analysis_id INTEGER REFERENCES bill_analysis(id) ON DELETE CASCADE,
  
  -- Kostnadsinformation
  cost_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  section VARCHAR(50) NOT NULL, -- 'electricity', 'network', 'extra_fees'
  description TEXT,
  
  -- Kategorisering
  is_necessary BOOLEAN DEFAULT TRUE,
  is_extra_fee BOOLEAN DEFAULT FALSE,
  can_be_optimized BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_bill_analysis_session_id ON bill_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_bill_analysis_created_at ON bill_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_analysis_invoice_ocr_id ON bill_analysis(invoice_ocr_id);
CREATE INDEX IF NOT EXISTS idx_bill_analysis_potential_savings ON bill_analysis(potential_savings);

CREATE INDEX IF NOT EXISTS idx_bill_cost_items_analysis_id ON bill_cost_items(bill_analysis_id);
CREATE INDEX IF NOT EXISTS idx_bill_cost_items_section ON bill_cost_items(section);
CREATE INDEX IF NOT EXISTS idx_bill_cost_items_is_extra_fee ON bill_cost_items(is_extra_fee);

-- RLS (Row Level Security) policies
ALTER TABLE bill_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_cost_items ENABLE ROW LEVEL SECURITY;

-- Policy för bill_analysis - tillåt alla att läsa och skriva
CREATE POLICY "Allow all operations on bill_analysis" ON bill_analysis
  FOR ALL USING (true) WITH CHECK (true);

-- Policy för bill_cost_items - tillåt alla att läsa och skriva
CREATE POLICY "Allow all operations on bill_cost_items" ON bill_cost_items
  FOR ALL USING (true) WITH CHECK (true);

-- Funktion för att automatiskt uppdatera updated_at
CREATE OR REPLACE FUNCTION update_bill_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger för att automatiskt uppdatera updated_at
DROP TRIGGER IF EXISTS trigger_update_bill_analysis_updated_at ON bill_analysis;
CREATE TRIGGER trigger_update_bill_analysis_updated_at
  BEFORE UPDATE ON bill_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_analysis_updated_at();

-- Kommentarer för dokumentation
COMMENT ON TABLE bill_analysis IS 'Lagrar detaljerade analyser av elräkningar med AI';
COMMENT ON TABLE bill_cost_items IS 'Lagrar individuella kostnader från elräkning analyser';
COMMENT ON COLUMN bill_analysis.total_electricity_cost IS 'Total kostnad för elförbrukning';
COMMENT ON COLUMN bill_analysis.total_extra_fees IS 'Total kostnad för extraavgifter';
COMMENT ON COLUMN bill_analysis.potential_savings IS 'Potentiell besparing i kr/år';
COMMENT ON COLUMN bill_analysis.detailed_breakdown IS 'JSON med detaljerad kostnadsfördelning';
COMMENT ON COLUMN bill_cost_items.section IS 'Kategori: electricity, network, extra_fees';
COMMENT ON COLUMN bill_cost_items.is_extra_fee IS 'Om kostnaden är en extraavgift som kan undvikas';
