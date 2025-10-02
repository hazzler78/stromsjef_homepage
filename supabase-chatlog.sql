-- Chat log table for AI conversations
-- Run this in your Supabase SQL Editor

-- Create the chatlog table
CREATE TABLE IF NOT EXISTS chatlog (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_agent TEXT,
  messages JSONB NOT NULL,
  ai_response TEXT,
  total_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatlog_session_id ON chatlog(session_id);
CREATE INDEX IF NOT EXISTS idx_chatlog_created_at ON chatlog(created_at);
CREATE INDEX IF NOT EXISTS idx_chatlog_session_created ON chatlog(session_id, created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE chatlog ENABLE ROW LEVEL SECURITY;

-- Create policy for chatlog (allow all operations for now)
CREATE POLICY "Allow all operations on chatlog" ON chatlog
  FOR ALL USING (true);

-- Add comments for documentation
COMMENT ON TABLE chatlog IS 'Stores AI chat conversations and responses';
COMMENT ON COLUMN chatlog.session_id IS 'Unique session identifier for grouping related messages';
COMMENT ON COLUMN chatlog.messages IS 'JSON array of conversation messages (user and assistant)';
COMMENT ON COLUMN chatlog.ai_response IS 'The AI response text';
COMMENT ON COLUMN chatlog.total_tokens IS 'Total tokens used in the conversation';
