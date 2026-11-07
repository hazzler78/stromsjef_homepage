-- Minimal representative schema for offline RLS regression tests (not a full Supabase bootstrap).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.banner_impressions (
  id serial PRIMARY KEY,
  variant varchar(10),
  session_id varchar(255),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.banner_clicks (
  id serial PRIMARY KEY,
  variant varchar(10),
  href text,
  session_id varchar(255),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hero_impressions (
  id serial PRIMARY KEY,
  variant varchar(10),
  session_id varchar(255),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.hero_clicks (
  id serial PRIMARY KEY,
  variant varchar(10),
  href text,
  session_id varchar(255),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chatlog (
  id serial PRIMARY KEY,
  session_id varchar(255) NOT NULL,
  user_agent text,
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_response text,
  total_tokens integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.electricity_plans (
  id text PRIMARY KEY,
  supplier_name text NOT NULL,
  plan_name text NOT NULL,
  price_per_kwh numeric NOT NULL,
  monthly_fee numeric NOT NULL DEFAULT 0,
  binding_time integer NOT NULL DEFAULT 0,
  price_zone text NOT NULL,
  recommended boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.business_electricity_plans (
  id text PRIMARY KEY,
  supplier_name text NOT NULL,
  plan_name text NOT NULL,
  price_per_kwh numeric NOT NULL,
  monthly_fee numeric NOT NULL DEFAULT 0,
  binding_time integer NOT NULL DEFAULT 0,
  price_zone text NOT NULL,
  recommended boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
