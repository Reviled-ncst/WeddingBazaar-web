-- ========================================
-- FIX SCHEMA + VERIFY VENDOR 2-2025-003
-- ========================================
-- This script:
-- 1. Fixes vendor_documents schema (UUID → VARCHAR)
-- 2. Preserves existing UUID documents (from old vendors)
-- 3. Adds approved business license for vendor 2-2025-003
-- 
-- CONTEXT: Current vendor_documents has 5 rows with UUID vendor_ids
-- These are from old vendor records and are orphaned (no matching vendors.id)
-- New vendors use string IDs like '2-2025-003', which causes UUID type error
-- 
-- Run this in Neon SQL Editor
-- ========================================

-- Step 1: View existing documents (BEFORE migration)
SELECT 
  id,
  vendor_id,
  document_type,
  verification_status,
  uploaded_at
FROM vendor_documents
ORDER BY uploaded_at DESC;
-- Shows 5 existing documents with UUID vendor_ids (orphaned records)

-- Step 2: Check current schema
SELECT 
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vendor_documents' 
AND column_name = 'vendor_id';
-- Expected: data_type = 'uuid' (this is the problem!)

-- Step 3: Drop the foreign key constraint first (it references UUID type)
ALTER TABLE vendor_documents 
DROP CONSTRAINT IF EXISTS vendor_documents_vendor_id_fkey;

-- Step 4: FIX THE SCHEMA - Convert vendor_id from UUID to VARCHAR
-- This converts existing UUIDs to strings and allows new string IDs
-- ⚠️ This preserves existing data by converting UUIDs to text representation
ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(255) USING vendor_id::text;

-- Step 5: Recreate the foreign key constraint (optional - may not match existing data)
-- ⚠️ Commenting this out since old UUID vendor_ids don't match current vendor_profiles
-- ALTER TABLE vendor_documents 
-- ADD CONSTRAINT vendor_documents_vendor_id_fkey 
-- FOREIGN KEY (vendor_id) REFERENCES vendor_profiles(id) ON DELETE CASCADE;

-- Step 6: Verify the schema fix worked
SELECT 
  column_name, 
  data_type,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vendor_documents' 
AND column_name = 'vendor_id';
-- Expected: data_type = 'character varying', character_maximum_length = 255 ✅

-- Step 7: Verify existing documents are preserved
SELECT 
  id,
  vendor_id,  -- Should now be text representation of UUIDs
  document_type,
  verification_status
FROM vendor_documents
ORDER BY uploaded_at DESC;
-- Should show 5 existing documents with vendor_id as strings (e.g., '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6')

-- Step 6: Check if vendor already has documents
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';
-- Should show no rows yet

-- Step 7: Add approved business license document for vendor 2-2025-003
-- Now this will work because vendor_id is VARCHAR!
INSERT INTO vendor_documents (
  vendor_id,
  document_type,
  document_url,
  file_name,
  verification_status,
  verified_at,
  verified_by,
  uploaded_at,
  created_at,
  updated_at,
  file_size,
  mime_type
) VALUES (
  '2-2025-003',  -- ✅ Now accepts string IDs!
  'business_license',
  'https://example.com/documents/business_license_2025003.pdf',
  'vendor0qw_business_license.pdf',
  'approved',
  NOW(),
  'admin',
  NOW(),
  NOW(),
  NOW(),
  1024,
  'application/pdf'
) RETURNING *;

-- Step 8: Verify the document was added
SELECT 
  id,
  vendor_id,
  document_type,
  verification_status,
  verified_at,
  uploaded_at
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';
-- Should show 1 row with approved business_license

-- Step 9: Update vendor profile verification status
UPDATE vendors 
SET 
  verified = true,
  updated_at = NOW()
WHERE id = '2-2025-003';

-- Step 10: Verify vendor is now verified
SELECT 
  id,
  business_name,
  verified,
  updated_at
FROM vendors 
WHERE id = '2-2025-003';
-- Should show verified = true

-- Step 11: Verify the schema allows both old and new formats
SELECT 
  COUNT(*) as total_documents,
  COUNT(CASE WHEN vendor_id ~ '^[0-9]-[0-9]{4}-[0-9]{3}$' THEN 1 END) as new_format_count,
  COUNT(CASE WHEN vendor_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuid_format_count
FROM vendor_documents;
-- Should show: 6 total (5 old UUIDs + 1 new string ID)

-- ========================================
-- EXPECTED RESULTS AFTER RUNNING
-- ========================================
-- ✅ Schema Migration:
--    - vendor_id column changed from UUID to VARCHAR(255)
--    - 5 existing UUID documents preserved (as text)
--    - New string IDs like '2-2025-003' now accepted
--
-- ✅ Vendor 2-2025-003:
--    - Has 1 approved business_license document
--    - vendors.verified = true
--    - Can now create services successfully!
--
-- ✅ Total Documents: 6
--    - 5 orphaned UUID documents (from old vendors)
--    - 1 new document for vendor 2-2025-003
--
-- 🎉 DOCUMENT UPLOAD SHOULD NOW WORK IN FRONTEND!
-- ========================================
