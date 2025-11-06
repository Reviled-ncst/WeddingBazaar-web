-- ============================================
-- VENDOR SERVICE ID FIX - RUN THIS NOW
-- ============================================
-- This SQL will fix your vendor services issue in 30 seconds
-- 
-- PROBLEM: Service uses legacy ID (2-2025-003)
--          Frontend queries with UUID (6fe3dc77-6774-4de8-ae2e-81a8ffb258f6)
--          Result: 0 services displayed
--
-- SOLUTION: Update service to use UUID
-- ============================================

-- Step 1: Verify vendor exists (should return 1 row)
-- Expected: Shows your vendor with both UUID and legacy_vendor_id
SELECT 
  id as uuid, 
  legacy_vendor_id, 
  business_name,
  email
FROM vendors 
WHERE legacy_vendor_id = '2-2025-003' 
   OR id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';

-- ============================================
-- Step 2: Show current service BEFORE update
-- ============================================
SELECT 
  id as service_id,
  vendor_id as current_vendor_id,
  title,
  category,
  'BEFORE UPDATE' as status
FROM services 
WHERE vendor_id = '2-2025-003';

-- Expected: 1 row with service SRV-00215, vendor_id='2-2025-003'

-- ============================================
-- Step 3: UPDATE SERVICE TO USE UUID
-- ============================================
UPDATE services 
SET vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
WHERE vendor_id = '2-2025-003';

-- Expected: "UPDATE 1" message

-- ============================================
-- Step 4: Verify the update worked
-- ============================================
SELECT 
  id as service_id,
  vendor_id as updated_vendor_id,
  title,
  category,
  'AFTER UPDATE - NOW USING UUID' as status
FROM services 
WHERE vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';

-- Expected: 1 row with service SRV-00215, vendor_id='6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'

-- ============================================
-- Step 5: Double-check no services left with legacy ID
-- ============================================
SELECT COUNT(*) as services_still_using_legacy_id
FROM services 
WHERE vendor_id = '2-2025-003';

-- Expected: 0 (all services should now use UUID)

-- ============================================
-- SUCCESS! 
-- Now refresh your browser and check vendor services page.
-- Your service should appear!
-- ============================================
