-- Migration för att fixa contract_clicks tabellen
-- Kör detta i Supabase SQL Editor för att uppdatera befintlig databas

-- 1. Ta bort den gamla foreign key constraint
ALTER TABLE contract_clicks DROP CONSTRAINT IF EXISTS contract_clicks_log_id_fkey;

-- 2. Lägg till den nya foreign key constraint som pekar på invoice_ocr
ALTER TABLE contract_clicks 
ADD CONSTRAINT contract_clicks_log_id_fkey 
FOREIGN KEY (log_id) REFERENCES invoice_ocr(id) ON DELETE SET NULL;

-- 3. Uppdatera kommentarer
COMMENT ON COLUMN contract_clicks.log_id IS 'Referens till invoice_ocr för att koppla till AI-analys';

-- 4. Verifiera att ändringen fungerar
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='contract_clicks'
  AND kcu.column_name='log_id';
