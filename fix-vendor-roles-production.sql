-- ============================================================
-- FIX VENDOR USER ROLES - PRODUCTION DATABASE
-- ============================================================
-- 
-- PURPOSE: Update all vendor users to have role='vendor'
-- ISSUE: Vendor users had role='individual', preventing correct vendor ID resolution
-- RESULT: Enables correct vendor_id assignment during service creation
--
-- DATE: November 2, 2025
-- TESTED: ✅ Local database
-- SAFE: ✅ Only updates users who have vendor entries
--
-- ============================================================

-- Step 1: Check current state (before update)
SELECT 
  u.id as user_id,
  u.email,
  u.role as current_role,
  v.id as vendor_id,
  v.business_name
FROM users u
JOIN vendors v ON u.id = v.user_id
ORDER BY v.created_at;

-- Expected output: All users with role='individual' (WRONG)

-- Step 2: Update vendor users to have correct role
UPDATE users 
SET role = 'vendor', 
    updated_at = NOW()
WHERE id IN (
  SELECT user_id FROM vendors
);

-- Step 3: Verify the fix (after update)
SELECT 
  u.id as user_id,
  u.email,
  u.role as updated_role,
  v.id as vendor_id,
  v.business_name
FROM users u
JOIN vendors v ON u.id = v.user_id
ORDER BY v.created_at;

-- Expected output: All users with role='vendor' (CORRECT)

-- Step 4: Verify services have valid vendor IDs
SELECT 
  s.id as service_id,
  s.title,
  s.vendor_id,
  v.business_name,
  CASE 
    WHEN v.id IS NOT NULL THEN '✅ Valid'
    ELSE '❌ Invalid'
  END as status
FROM services s
LEFT JOIN vendors v ON s.vendor_id = v.id
ORDER BY s.created_at DESC
LIMIT 20;

-- Expected output: All services show '✅ Valid'

-- ============================================================
-- ROLLBACK (if needed)
-- ============================================================
-- If you need to undo this change, run:
-- 
-- UPDATE users 
-- SET role = 'individual', 
--     updated_at = NOW()
-- WHERE id IN (
--   SELECT user_id FROM vendors
-- );
--
-- However, this would break the system again, so only use in emergencies.
-- ============================================================
