-- Complete Supabase setup for electricity bill analysis system
-- Run this in your Supabase SQL Editor

-- 1. First create the basic invoice_ocr_logs table (if not exists)
CREATE TABLE IF NOT EXISTS invoice_ocr_logs (
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

-- 2. Create the invoice_ocr table that the API expects
CREATE TABLE IF NOT EXISTS invoice_ocr (
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

-- 3. Create invoice_ocr_files table for file storage references
CREATE TABLE IF NOT EXISTS invoice_ocr_files (
  id SERIAL PRIMARY KEY,
  invoice_ocr_id INTEGER REFERENCES invoice_ocr(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  image_sha256 VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the bill_analysis table
CREATE TABLE IF NOT EXISTS bill_analysis (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  invoice_ocr_id INTEGER REFERENCES invoice_ocr(id) ON DELETE CASCADE,
  
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

-- 5. Create bill_cost_items table
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

-- 6. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_logs_session_id ON invoice_ocr_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_logs_created_at ON invoice_ocr_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_invoice_ocr_session_id ON invoice_ocr(session_id);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_created_at ON invoice_ocr(created_at);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_image_sha256 ON invoice_ocr(image_sha256);

CREATE INDEX IF NOT EXISTS idx_invoice_ocr_files_ocr_id ON invoice_ocr_files(invoice_ocr_id);

CREATE INDEX IF NOT EXISTS idx_bill_analysis_session_id ON bill_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_bill_analysis_created_at ON bill_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bill_analysis_invoice_ocr_id ON bill_analysis(invoice_ocr_id);
CREATE INDEX IF NOT EXISTS idx_bill_analysis_potential_savings ON bill_analysis(potential_savings);

CREATE INDEX IF NOT EXISTS idx_bill_cost_items_analysis_id ON bill_cost_items(bill_analysis_id);
CREATE INDEX IF NOT EXISTS idx_bill_cost_items_section ON bill_cost_items(section);
CREATE INDEX IF NOT EXISTS idx_bill_cost_items_is_extra_fee ON bill_cost_items(is_extra_fee);

-- 7. Enable RLS (Row Level Security)
ALTER TABLE invoice_ocr_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_ocr ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_ocr_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_cost_items ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
CREATE POLICY "Allow all operations on invoice_ocr_logs" ON invoice_ocr_logs
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on invoice_ocr" ON invoice_ocr
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on invoice_ocr_files" ON invoice_ocr_files
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bill_analysis" ON bill_analysis
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on bill_cost_items" ON bill_cost_items
  FOR ALL USING (true) WITH CHECK (true);

-- 9. Create function for updating updated_at
CREATE OR REPLACE FUNCTION update_bill_analysis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for updating updated_at
DROP TRIGGER IF EXISTS trigger_update_bill_analysis_updated_at ON bill_analysis;
CREATE TRIGGER trigger_update_bill_analysis_updated_at
  BEFORE UPDATE ON bill_analysis
  FOR EACH ROW
  EXECUTE FUNCTION update_bill_analysis_updated_at();

-- 11. Add comments for documentation
COMMENT ON TABLE invoice_ocr IS 'Main table for invoice OCR processing';
COMMENT ON TABLE invoice_ocr_files IS 'File storage references for invoice images';
COMMENT ON TABLE bill_analysis IS 'Detailed electricity bill analysis results';
COMMENT ON TABLE bill_cost_items IS 'Individual cost items from bill analysis';
