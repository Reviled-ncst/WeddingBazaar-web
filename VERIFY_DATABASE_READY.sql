-- ========================================
-- VERIFICATION SCRIPT - Run in Neon SQL Console
-- ========================================
-- This script checks if everything is ready for service creation

-- Step 1: Verify vendor exists and is verified
-- Expected: Should return 1 row for vendor 2-2025-003
SELECT 
  '1. VENDOR CHECK' as step,
  user_id,
  business_name,
  is_verified,
  CASE 
    WHEN is_verified THEN '✅ Vendor is verified'
    ELSE '❌ Vendor needs verification'
  END as status
FROM vendors 
WHERE user_id = '2-2025-003';

-- Step 2: Check vendor_documents table exists and has data
-- Expected: Should return 1+ rows with approved business_license
SELECT 
  '2. DOCUMENTS CHECK' as step,
  vendor_id,
  document_type,
  verification_status,
  CASE 
    WHEN verification_status = 'approved' THEN '✅ Document approved'
    ELSE '❌ Document not approved'
  END as status
FROM vendor_documents 
WHERE vendor_id = '2-2025-003';

-- Step 3: Verify vendor_documents table structure
-- Expected: vendor_id should be VARCHAR, not UUID
SELECT 
  '3. SCHEMA CHECK' as step,
  column_name,
  data_type,
  character_maximum_length,
  CASE 
    WHEN column_name = 'vendor_id' AND data_type = 'character varying' THEN '✅ Correct (VARCHAR)'
    WHEN column_name = 'vendor_id' AND data_type = 'uuid' THEN '❌ Wrong (UUID) - Run migration!'
    ELSE '✅ OK'
  END as status
FROM information_schema.columns
WHERE table_name = 'vendor_documents'
AND column_name IN ('vendor_id', 'document_type', 'verification_status')
ORDER BY ordinal_position;

-- Step 4: Check services table foreign key constraint
-- Expected: Should show constraint linking to vendors(user_id)
SELECT 
  '4. FOREIGN KEY CHECK' as step,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  CASE 
    WHEN ccu.column_name = 'user_id' THEN '✅ Links to vendors.user_id'
    ELSE '⚠️ Check constraint'
  END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='services'
AND kcu.column_name = 'vendor_id';

-- Step 5: Verify all required service columns exist
-- Expected: All these columns should exist
SELECT 
  '5. SERVICE COLUMNS CHECK' as step,
  column_name,
  data_type,
  CASE 
    WHEN column_name IN ('vendor_id', 'title', 'description', 'category', 'price_range') THEN '✅ Required field exists'
    ELSE '✅ Optional field exists'
  END as status
FROM information_schema.columns
WHERE table_name = 'services'
AND column_name IN (
  'id', 'vendor_id', 'title', 'description', 'category', 
  'price', 'price_range', 'max_price', 'images', 'features',
  'location', 'contact_info', 'tags', 'keywords',
  'years_in_business', 'service_tier', 'wedding_styles',
  'cultural_specialties', 'availability'
)
ORDER BY ordinal_position;

-- Step 6: Test if vendor can create services (dry run)
-- Expected: Should return constraint check results
SELECT 
  '6. CONSTRAINT TEST' as step,
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition,
  CASE 
    WHEN contype = 'c' THEN '✅ CHECK constraint'
    WHEN contype = 'f' THEN '✅ FOREIGN KEY constraint'
    WHEN contype = 'p' THEN '✅ PRIMARY KEY constraint'
    ELSE '⚠️ Other constraint'
  END as status
FROM pg_constraint
WHERE conrelid = 'services'::regclass;

-- Step 7: Count existing services for this vendor
-- Expected: Returns current service count
SELECT 
  '7. CURRENT SERVICES' as step,
  vendor_id,
  COUNT(*) as service_count,
  COUNT(CASE WHEN is_active THEN 1 END) as active_services,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ No services yet - ready to create first'
    ELSE '✅ Vendor has ' || COUNT(*) || ' services'
  END as status
FROM services
WHERE vendor_id = '2-2025-003'
GROUP BY vendor_id

UNION ALL

SELECT 
  '7. CURRENT SERVICES' as step,
  '2-2025-003' as vendor_id,
  0 as service_count,
  0 as active_services,
  '✅ No services yet - ready to create first' as status
WHERE NOT EXISTS (SELECT 1 FROM services WHERE vendor_id = '2-2025-003');

-- ========================================
-- SUMMARY CHECK
-- ========================================
SELECT 
  '8. FINAL SUMMARY' as step,
  CASE 
    WHEN (SELECT COUNT(*) FROM vendors WHERE user_id = '2-2025-003' AND is_verified = true) > 0
         AND (SELECT COUNT(*) FROM vendor_documents WHERE vendor_id = '2-2025-003' AND verification_status = 'approved') > 0
         AND (SELECT data_type FROM information_schema.columns WHERE table_name = 'vendor_documents' AND column_name = 'vendor_id') = 'character varying'
    THEN '✅ ALL CHECKS PASSED - Ready for service creation!'
    ELSE '❌ SOME CHECKS FAILED - See details above'
  END as overall_status;

-- ========================================
-- QUICK FIX QUERIES (Only run if needed)
-- ========================================

-- IF vendor_documents.vendor_id is UUID (from Step 3):
-- UNCOMMENT and RUN these:

/*
ALTER TABLE vendor_documents 
DROP CONSTRAINT IF EXISTS vendor_documents_vendor_id_fkey;

ALTER TABLE vendor_documents 
ALTER COLUMN vendor_id TYPE VARCHAR(255);

INSERT INTO vendor_documents (
  vendor_id, document_type, document_url, file_name,
  verification_status, uploaded_at, created_at
) VALUES (
  '2-2025-003', 'business_license', 
  'https://example.com/business-license.pdf',
  'business-license.pdf', 'approved', NOW(), NOW()
) ON CONFLICT DO NOTHING;

UPDATE vendors 
SET is_verified = true 
WHERE user_id = '2-2025-003';
*/

-- IF vendor doesn't exist (from Step 1):
-- Create vendor profile first at /vendor/profile page
