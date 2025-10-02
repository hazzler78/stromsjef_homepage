-- Script för att fixa gamla fakturor som saknar filer
-- Kör detta i Supabase SQL Editor

-- 1. Hitta alla bill_analysis poster som har consent men saknar filer
SELECT 
    ba.id,
    ba.invoice_ocr_id,
    ba.consent_to_store,
    ba.created_at,
    iof.id as file_exists
FROM bill_analysis ba
LEFT JOIN invoice_ocr_files iof ON ba.invoice_ocr_id = iof.invoice_ocr_id
WHERE ba.consent_to_store = true 
  AND iof.id IS NULL
ORDER BY ba.created_at DESC;

-- 2. Hitta motsvarande invoice_ocr poster
SELECT 
    io.id,
    io.image_sha256,
    io.created_at
FROM invoice_ocr io
WHERE io.id IN (
    SELECT ba.invoice_ocr_id 
    FROM bill_analysis ba
    LEFT JOIN invoice_ocr_files iof ON ba.invoice_ocr_id = iof.invoice_ocr_id
    WHERE ba.consent_to_store = true 
      AND iof.id IS NULL
);

-- 3. Kontrollera om filer finns i storage (manuellt i Supabase Dashboard)
-- Gå till Storage > invoice-ocr bucket och leta efter filer med pattern: {invoice_ocr_id}/{sha256}.{ext}

-- 4. Om filer finns i storage men saknas i invoice_ocr_files, skapa referenser:
-- (Kör detta för varje saknad fil - ersätt värdena)
/*
INSERT INTO invoice_ocr_files (invoice_ocr_id, storage_key, image_sha256)
VALUES (
    62,  -- invoice_ocr_id
    '62/abc123def456.jpg',  -- storage_key (hitta i storage bucket)
    'abc123def456'  -- image_sha256 från invoice_ocr tabellen
);
*/
