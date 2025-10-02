-- Supabase Storage Setup for Invoice Images
-- Run this in your Supabase SQL Editor to create the storage bucket

-- Note: Storage buckets are created via the Supabase Dashboard or API, not SQL
-- This file contains instructions for manual setup

/*
MANUAL SETUP INSTRUCTIONS:

1. Go to your Supabase Dashboard
2. Navigate to Storage section
3. Create a new bucket with these settings:
   - Name: invoice-ocr
   - Public: false (private bucket)
   - File size limit: 20 MB
   - Allowed MIME types: image/png, image/jpeg, image/jpg

4. Set up RLS policies for the bucket:

-- Allow service role to upload files
CREATE POLICY "Service role can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'invoice-ocr' AND auth.role() = 'service_role');

-- Allow service role to read files  
CREATE POLICY "Service role can read files" ON storage.objects
  FOR SELECT WITH CHECK (bucket_id = 'invoice-ocr' AND auth.role() = 'service_role');

-- Allow service role to delete files
CREATE POLICY "Service role can delete files" ON storage.objects
  FOR DELETE WITH CHECK (bucket_id = 'invoice-ocr' AND auth.role() = 'service_role');

5. Test the bucket by uploading a test file through the dashboard
*/

-- Alternative: Create bucket via API (if you have the service role key)
-- This would be done in your application code, not SQL

SELECT 'Storage bucket setup instructions completed. Please follow the manual steps above.' as message;
