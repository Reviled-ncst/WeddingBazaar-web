-- QUICK FIX: Add approved document for vendor 2-2025-003
-- Run this in Neon SQL Console AFTER running FIX_DOCUMENTS_TABLE.sql

-- First, ensure the vendor_documents table exists
-- (Run FIX_DOCUMENTS_TABLE.sql first if you haven't)

-- NOTE: vendor_documents.vendor_id stores USER_ID (from users table)
-- NOT the vendors.id column. This matches backend query logic.

-- Add an approved document for your test vendor (2-2025-003)
INSERT INTO vendor_documents (
  id,
  vendor_id,
  document_type,
  document_url,
  file_name,
  verification_status,
  uploaded_at,
  verified_at,
  verified_by,
  created_at,
  updated_at,
  file_size,
  mime_type
) VALUES (
  gen_random_uuid(),
  '2-2025-003'::TEXT,  -- Your vendor ID (string format, not UUID)
  'business_license',
  'https://res.cloudinary.com/dht64xt1g/image/upload/v1762571000/test-approved-license.jpg',
  'Boutique Business License - Approved',
  'approved',  -- Pre-approved for testing
  NOW(),
  NOW(),
  'admin',
  NOW(),
  NOW(),
  100000,
  'image/jpeg'
)
ON CONFLICT (id) DO NOTHING;

-- Verify the document was added
SELECT 
  id,
  vendor_id,
  document_type,
  verification_status,
  file_name,
  created_at
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';

-- Expected result: Should show 1 row with vendor_id = '2-2025-003'

-- Additional verification: Check if backend can find it
-- This simulates what the backend query will do
SELECT 
  COUNT(*) as doc_count,
  COUNT(CASE WHEN verification_status = 'approved' THEN 1 END) as approved_count
FROM vendor_documents 
WHERE vendor_id = '2-2025-003'
  AND verification_status = 'approved';

-- Expected result: doc_count = 1, approved_count = 1
