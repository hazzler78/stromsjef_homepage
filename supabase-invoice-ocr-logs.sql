-- Skapa invoice_ocr_logs tabellen om den inte finns
-- Kör detta FÖRST om du får fel om att tabellen inte finns

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

-- Index för bättre prestanda
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_logs_session_id ON invoice_ocr_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_invoice_ocr_logs_created_at ON invoice_ocr_logs(created_at);

-- RLS (Row Level Security)
ALTER TABLE invoice_ocr_logs ENABLE ROW LEVEL SECURITY;

-- Policy för invoice_ocr_logs
CREATE POLICY "Allow all operations on invoice_ocr_logs" ON invoice_ocr_logs
  FOR ALL USING (true);
