-- ============================================
-- VENDOR SERVICES DIAGNOSIS SCRIPT
-- ============================================
-- Run this to understand WHY services aren't showing
-- ============================================

-- 1. CHECK VENDOR EXISTS
SELECT 
  id as vendor_uuid,
  user_id,
  legacy_vendor_id,
  business_name,
  email,
  is_verified,
  created_at
FROM vendors 
WHERE user_id = '2-2025-003' 
   OR id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
   OR legacy_vendor_id = '2-2025-003';
   
-- Expected: 1 row with vendor info

-- ============================================
-- 2. CHECK VENDOR SUBSCRIPTION
-- ============================================
SELECT 
  vs.vendor_id,
  vs.plan_name,
  vs.status,
  vs.max_services,
  vs.start_date,
  vs.end_date,
  vs.trial_end_date,
  vs.cancel_at_period_end
FROM vendor_subscriptions vs
WHERE vs.vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
   OR vs.vendor_id = '2-2025-003';

-- Expected: 1 row showing subscription plan (basic/premium/enterprise)
-- If NO ROWS: Vendor has no subscription (this might block service creation!)

-- ============================================
-- 3. CHECK VENDOR DOCUMENTS (for verification)
-- ============================================
-- Note: documents table might not exist yet
SELECT COUNT(*) as document_check FROM information_schema.tables 
WHERE table_name = 'vendor_documents' OR table_name = 'documents';

-- If 0: Document verification is not implemented yet
-- If 1+: Check actual documents below

-- ============================================
-- 4. CHECK USER EMAIL VERIFICATION
-- ============================================
SELECT 
  id,
  email,
  email_verified,
  is_verified,
  role,
  created_at
FROM users
WHERE id = '2-2025-003' OR email = 'vendor0qw@gmail.com';

-- Expected: 1 row
-- Check: email_verified should be TRUE

-- ============================================
-- 5. CHECK SERVICES - ALL POSSIBLE VENDOR IDs
-- ============================================
SELECT 
  s.id as service_id,
  s.vendor_id,
  s.title,
  s.category,
  s.is_active,
  s.created_at,
  'Direct match with UUID' as match_type
FROM services s
WHERE s.vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'

UNION ALL

SELECT 
  s.id as service_id,
  s.vendor_id,
  s.title,
  s.category,
  s.is_active,
  s.created_at,
  'Direct match with user_id' as match_type
FROM services s
WHERE s.vendor_id = '2-2025-003'

UNION ALL

SELECT 
  s.id as service_id,
  s.vendor_id,
  s.title,
  s.category,
  s.is_active,
  s.created_at,
  'Via vendor lookup' as match_type
FROM services s
INNER JOIN vendors v ON s.vendor_id = v.id
WHERE v.user_id = '2-2025-003';

-- Expected: Shows ALL services linked to this vendor via ANY method

-- ============================================
-- 6. COUNT SERVICES BY VENDOR_ID FORMAT
-- ============================================
SELECT 
  vendor_id,
  COUNT(*) as service_count,
  array_agg(title) as service_titles,
  array_agg(id) as service_ids
FROM services
WHERE vendor_id IN (
  '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6',
  '2-2025-003'
)
OR vendor_id IN (
  SELECT id FROM vendors WHERE user_id = '2-2025-003'
)
GROUP BY vendor_id;

-- This shows which vendor_id format your services are using

-- ============================================
-- 7. CHECK VENDOR_PROFILES (if exists)
-- ============================================
SELECT 
  vp.id,
  vp.user_id,
  vp.business_name,
  vp.business_type,
  vp.email_verified,
  vp.document_verified,
  vp.subscription_status,
  vp.created_at
FROM vendor_profiles vp
WHERE vp.user_id = '2-2025-003'
   OR vp.id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';

-- Check if document_verified or email_verified is blocking services

-- ============================================
-- DIAGNOSIS SUMMARY
-- ============================================
-- After running all queries above, check:
-- 
-- ❌ NO SERVICES SHOWING IF:
-- 1. Vendor has no active subscription (vendor_subscriptions missing)
-- 2. Email not verified (users.email_verified = FALSE)
-- 3. Documents not verified (vendor_profiles.document_verified = FALSE)
-- 4. Services use different vendor_id than what frontend sends
-- 5. Services have is_active = FALSE
-- 
-- ✅ SERVICES SHOULD SHOW IF:
-- 1. Vendor has active subscription (or basic default)
-- 2. Email is verified
-- 3. Documents verified OR verification not required
-- 4. Services exist with matching vendor_id
-- 5. Services have is_active = TRUE
