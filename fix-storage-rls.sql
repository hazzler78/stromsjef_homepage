-- Fix Storage RLS policies för invoice-ocr bucket
-- Kör detta i Supabase SQL Editor

-- 1. Kontrollera om bucket finns
SELECT * FROM storage.buckets WHERE name = 'invoice-ocr';

-- 2. Om bucket inte finns, skapa den manuellt i Supabase Dashboard
-- Gå till Storage > Create bucket > invoice-ocr

-- 3. Skapa RLS policies för bucket
CREATE POLICY "Allow service role to manage invoice-ocr bucket" ON storage.buckets
  FOR ALL USING (name = 'invoice-ocr') WITH CHECK (name = 'invoice-ocr');

-- 4. Skapa RLS policies för filer i bucket
CREATE POLICY "Allow service role to manage invoice-ocr files" ON storage.objects
  FOR ALL USING (bucket_id = 'invoice-ocr') WITH CHECK (bucket_id = 'invoice-ocr');

-- 5. Alternativt, tillfälligt inaktivera RLS för storage (EJ rekommenderat för produktion)
-- ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 6. Kontrollera policies
SELECT * FROM pg_policies WHERE tablename IN ('buckets', 'objects') AND schemaname = 'storage';
