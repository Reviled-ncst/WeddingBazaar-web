-- ========================================
-- COPY THIS ENTIRE SCRIPT AND RUN IN NEON
-- ========================================

-- Step 1: Drop foreign key constraint
ALTER TABLE vendor_documents 
DROP CONSTRAINT IF EXISTS vendor_documents_vendor_id_fkey;

-- Step 2: Convert vendor_id from UUID to VARCHAR
ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(255) USING vendor_id::text;

-- Step 3: Verify schema changed
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'vendor_documents' AND column_name = 'vendor_id';

-- Step 4: Add approved business license for vendor 2-2025-003
INSERT INTO vendor_documents (
  vendor_id, document_type, document_url, file_name,
  verification_status, verified_at, verified_by,
  uploaded_at, created_at, updated_at, file_size, mime_type
) VALUES (
  '2-2025-003', 'business_license',
  'https://example.com/documents/business_license_2025003.pdf',
  'vendor0qw_business_license.pdf',
  'approved', NOW(), 'admin', NOW(), NOW(), NOW(), 1024, 'application/pdf'
) RETURNING *;

-- Step 5: Update vendor verification status
UPDATE vendors SET verified = true, updated_at = NOW() WHERE id = '2-2025-003';

-- Step 6: Verify everything worked
SELECT * FROM vendor_documents WHERE vendor_id = '2-2025-003';
SELECT id, business_name, verified FROM vendors WHERE id = '2-2025-003';
SELECT COUNT(*) as total_documents FROM vendor_documents;
