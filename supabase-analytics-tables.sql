-- Create analytics tables for banner and hero tracking
-- Run this in your Supabase SQL Editor

-- Banner impressions table
CREATE TABLE IF NOT EXISTS banner_impressions (
  id SERIAL PRIMARY KEY,
  variant VARCHAR(10),
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banner clicks table
CREATE TABLE IF NOT EXISTS banner_clicks (
  id SERIAL PRIMARY KEY,
  variant VARCHAR(10),
  href TEXT,
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero impressions table
CREATE TABLE IF NOT EXISTS hero_impressions (
  id SERIAL PRIMARY KEY,
  variant VARCHAR(10),
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero clicks table
CREATE TABLE IF NOT EXISTS hero_clicks (
  id SERIAL PRIMARY KEY,
  variant VARCHAR(10),
  href TEXT,
  target TEXT,
  session_id VARCHAR(255),
  user_agent TEXT,
  referer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_banner_impressions_variant ON banner_impressions(variant);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_session ON banner_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_banner_impressions_created ON banner_impressions(created_at);

CREATE INDEX IF NOT EXISTS idx_banner_clicks_variant ON banner_clicks(variant);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_session ON banner_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_banner_clicks_created ON banner_clicks(created_at);

CREATE INDEX IF NOT EXISTS idx_hero_impressions_variant ON hero_impressions(variant);
CREATE INDEX IF NOT EXISTS idx_hero_impressions_session ON hero_impressions(session_id);
CREATE INDEX IF NOT EXISTS idx_hero_impressions_created ON hero_impressions(created_at);

CREATE INDEX IF NOT EXISTS idx_hero_clicks_variant ON hero_clicks(variant);
CREATE INDEX IF NOT EXISTS idx_hero_clicks_session ON hero_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_hero_clicks_created ON hero_clicks(created_at);
