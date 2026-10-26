-- Run manually in Supabase SQL Editor (production) before/after deploy.
-- Adds columns used by the solar (Otovo) lead form.

ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS address text;
