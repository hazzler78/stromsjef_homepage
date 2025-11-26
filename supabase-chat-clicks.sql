-- Create chat_clicks table for tracking clicks from GrokChat component
-- Run this in your Supabase SQL Editor

-- Chat clicks table
CREATE TABLE IF NOT EXISTS chat_clicks (
  id SERIAL PRIMARY KEY,
  button_type VARCHAR(50),
  href TEXT,
  session_id VARCHAR(255),
  source VARCHAR(50) DEFAULT 'grokchat',
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_clicks_button_type ON chat_clicks(button_type);
CREATE INDEX IF NOT EXISTS idx_chat_clicks_session ON chat_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_clicks_created ON chat_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_clicks_source ON chat_clicks(source);

-- Enable RLS (Row Level Security)
ALTER TABLE chat_clicks ENABLE ROW LEVEL SECURITY;

-- Policy to allow all reads (for admin dashboard)
CREATE POLICY "Allow all to read chat_clicks" ON chat_clicks
  FOR SELECT USING (true);

-- Policy to allow all inserts (for tracking)
CREATE POLICY "Allow all to insert chat_clicks" ON chat_clicks
  FOR INSERT WITH CHECK (true);

