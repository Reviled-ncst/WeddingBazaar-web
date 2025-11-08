-- ========================================
-- VERIFY VENDOR 2-2025-003 FOR SERVICE CREATION
-- ========================================
-- This script adds the required approved business license
-- for vendor 2-2025-003 so they can create services
-- 
-- Run this in Neon SQL Editor
-- ========================================

-- Step 1: Verify the vendor_documents table exists
-- (Should show the table structure)
\d vendor_documents;

-- Step 2: Check current documents for this vendor
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';

-- Step 3: Add approved business license document
INSERT INTO vendor_documents (
  id,
  vendor_id,
  document_type,
  file_url,
  file_name,
  verification_status,
  verification_notes,
  verified_at,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '2-2025-003',
  'business_license',
  'https://example.com/documents/business_license_2025003.pdf',
  'vendor0qw_business_license.pdf',
  'approved',
  'Verified for testing purposes - commit e0d6707',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Step 4: Verify the document was added
SELECT 
  id,
  vendor_id,
  document_type,
  verification_status,
  verified_at,
  created_at
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';

-- Step 5: Also update the vendor profile verification status
UPDATE vendors 
SET 
  verified = true,
  updated_at = NOW()
WHERE id = '2-2025-003';

-- Step 6: Verify vendor is now verified
SELECT 
  id,
  business_name,
  verified,
  updated_at
FROM vendors 
WHERE id = '2-2025-003';

-- ========================================
-- EXPECTED RESULTS AFTER RUNNING
-- ========================================
-- 1. vendor_documents table should have 1 row for vendor 2-2025-003
-- 2. document_type should be 'business_license'
-- 3. verification_status should be 'approved'
-- 4. vendors.verified should be true
-- 
-- After this, the vendor can create services successfully!
-- ========================================
