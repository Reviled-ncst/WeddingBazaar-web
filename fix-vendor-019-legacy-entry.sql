-- ============================================================================
-- FIX VENDOR 2-2025-019 - INSERT MISSING LEGACY VENDORS TABLE ENTRY
-- ============================================================================
-- Issue: User can login, profile exists in vendor_profiles, but missing 
--        legacy vendors table entry causing 500 errors
-- 
-- Execute this SQL in Neon SQL Console: https://console.neon.tech
-- ============================================================================

-- Step 1: Verify current state
SELECT 'STEP 1: Checking user existence' as step;
SELECT id, email, first_name, last_name, user_type, created_at 
FROM users 
WHERE id = '2-2025-019';

-- Step 2: Check vendor_profiles (should exist)
SELECT 'STEP 2: Checking vendor_profiles' as step;
SELECT id, user_id, business_name, business_type, vendor_type, created_at
FROM vendor_profiles
WHERE user_id = '2-2025-019';

-- Step 3: Check vendors table (should be missing)
SELECT 'STEP 3: Checking vendors table (should be empty)' as step;
SELECT * FROM vendors WHERE user_id = '2-2025-019';

-- Step 4: Get the next vendor ID
SELECT 'STEP 4: Getting next vendor ID' as step;
SELECT 
  'VEN-' || LPAD((COUNT(*) + 1)::text, 5, '0') as next_vendor_id,
  COUNT(*) as current_vendor_count
FROM vendors;

-- ============================================================================
-- STEP 5: INSERT MISSING VENDORS TABLE ENTRY
-- ============================================================================
-- This creates the legacy vendors table entry that's missing
-- ============================================================================

INSERT INTO vendors (
  id,
  user_id,
  business_name,
  business_type,
  description,
  location,
  phone,
  email,
  website,
  rating,
  review_count,
  years_experience,
  verified,
  featured,
  created_at,
  updated_at
)
SELECT 
  'VEN-' || LPAD((SELECT COUNT(*) + 1 FROM vendors)::text, 5, '0') as id,
  '2-2025-019' as user_id,
  COALESCE(vp.business_name, u.first_name || ' ' || COALESCE(u.last_name, '') || ' Business') as business_name,
  COALESCE(vp.business_type, 'Other Services') as business_type,
  COALESCE(vp.business_description, 'Professional service provider') as description,
  COALESCE(vp.business_address, 'Not specified') as location,
  vp.contact_phone as phone,
  vp.contact_email as email,
  vp.website_url as website,
  COALESCE(vp.average_rating, 0.0) as rating,
  COALESCE(vp.total_reviews, 0) as review_count,
  COALESCE(vp.years_in_business, 0) as years_experience,
  CASE 
    WHEN vp.verification_status = 'verified' THEN true 
    ELSE false 
  END as verified,
  COALESCE(vp.is_featured, false) as featured,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
WHERE u.id = '2-2025-019';

-- ============================================================================
-- STEP 6: VERIFY THE FIX
-- ============================================================================

SELECT 'STEP 6: Verifying the fix - vendors table entry' as step;
SELECT * FROM vendors WHERE user_id = '2-2025-019';

-- Check if backend endpoint will work now
SELECT 'STEP 7: Final verification - all data' as step;
SELECT 
  v.id as vendor_id,
  v.user_id,
  v.business_name,
  v.business_type,
  v.rating,
  v.review_count,
  v.verified,
  v.created_at,
  vp.id as profile_id,
  vp.business_name as profile_business_name
FROM vendors v
LEFT JOIN vendor_profiles vp ON vp.user_id = v.user_id
WHERE v.user_id = '2-2025-019';

-- ============================================================================
-- SUCCESS! 
-- ============================================================================
-- The vendors table entry should now exist for user 2-2025-019
-- Backend endpoint /api/vendors/user/2-2025-019 should return 200 OK
-- Vendor should be able to create services without 500 errors
-- ============================================================================
