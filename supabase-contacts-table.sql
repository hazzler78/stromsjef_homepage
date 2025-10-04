-- Create contacts table for form submissions
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT,
  ref VARCHAR(255),
  campaign_code VARCHAR(255),
  subscribe_newsletter BOOLEAN DEFAULT false,
  form_type VARCHAR(100)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_ref ON contacts(ref);
CREATE INDEX IF NOT EXISTS idx_contacts_campaign_code ON contacts(campaign_code);
CREATE INDEX IF NOT EXISTS idx_contacts_form_type ON contacts(form_type);

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for your security requirements)
CREATE POLICY "Allow all operations on contacts" ON contacts
  FOR ALL USING (true) WITH CHECK (true);

-- Add comment for documentation
COMMENT ON TABLE contacts IS 'Stores contact form submissions and newsletter signups';

-- Sample data (optional - remove if not needed)
-- INSERT INTO contacts (name, email, phone, message, ref, campaign_code, subscribe_newsletter, form_type)
-- VALUES 
--   ('Test User', 'test@example.com', '+47 123 45 678', 'Test message', 'homepage', 'summer2024', true, 'contact'),
--   ('Another User', 'user2@example.com', NULL, 'Another test message', 'blog', 'winter2024', false, 'newsletter');
