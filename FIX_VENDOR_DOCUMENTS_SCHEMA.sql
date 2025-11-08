-- ========================================
-- FIX VENDOR_DOCUMENTS SCHEMA MISMATCH
-- ========================================
-- Problem: vendor_documents.vendor_id is UUID type
-- But vendors.id and vendors.user_id are VARCHAR (e.g., '2-2025-003')
-- This causes "invalid input syntax for type uuid" errors
-- 
-- Solution: Change vendor_id column to VARCHAR to match vendors table
-- ========================================

-- Step 1: Check current schema
SELECT 
  column_name, 
  data_type, 
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'vendor_documents'
ORDER BY ordinal_position;

-- Step 2: Check if there are any existing documents (backup check)
SELECT COUNT(*) as existing_document_count FROM vendor_documents;

-- Step 3: If there are existing documents, view them
SELECT 
  id,
  vendor_id,
  document_type,
  verification_status,
  uploaded_at
FROM vendor_documents
LIMIT 10;

-- Step 4: ALTER TABLE to change vendor_id from UUID to VARCHAR
-- ⚠️ This will fail if there's existing data that can't be converted
-- If there's data, you may need to drop and recreate the table
ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(50);

-- Step 5: Verify the change
SELECT 
  column_name, 
  data_type, 
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vendor_documents' 
AND column_name = 'vendor_id';

-- Step 6: Now test inserting a document with string vendor_id
INSERT INTO vendor_documents (
  vendor_id,
  document_type,
  file_name,
  document_url,
  verification_status,
  uploaded_at
) VALUES (
  '2-2025-003',  -- Now this should work!
  'business_license',
  'test_business_license.pdf',
  'https://example.com/test.pdf',
  'pending',
  NOW()
) RETURNING *;

-- Step 7: Verify the insert worked
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';

-- ========================================
-- ALTERNATIVE: If ALTER TABLE fails due to existing UUID data
-- ========================================
-- If Step 4 fails, use this approach instead:

-- Drop existing table (⚠️ CAUTION: This deletes all documents!)
-- DROP TABLE IF EXISTS vendor_documents CASCADE;

-- Recreate with correct schema
-- CREATE TABLE vendor_documents (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   vendor_id VARCHAR(50) NOT NULL,  -- ✅ Changed from UUID to VARCHAR
--   document_type VARCHAR(100) NOT NULL,
--   file_name VARCHAR(255),
--   document_url TEXT,
--   file_size INTEGER,
--   mime_type VARCHAR(100),
--   verification_status VARCHAR(20) DEFAULT 'pending',
--   verification_notes TEXT,
--   verified_by UUID,
--   verified_at TIMESTAMP,
--   uploaded_at TIMESTAMP DEFAULT NOW(),
--   updated_at TIMESTAMP DEFAULT NOW(),
--   CONSTRAINT fk_vendor FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
-- );

-- Create index for faster queries
-- CREATE INDEX idx_vendor_documents_vendor_id ON vendor_documents(vendor_id);
-- CREATE INDEX idx_vendor_documents_status ON vendor_documents(verification_status);

-- ========================================
-- EXPECTED RESULT
-- ========================================
-- After running this fix:
-- 1. vendor_documents.vendor_id should be VARCHAR(50) type
-- 2. Can insert documents with vendor_id = '2-2025-003'
-- 3. Document upload in frontend should work
-- 4. Service creation verification should work
-- ========================================
