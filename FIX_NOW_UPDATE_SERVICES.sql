-- IMMEDIATE FIX: Update services table to use UUID instead of legacy ID
-- Run this in Neon SQL Console RIGHT NOW

-- Step 1: Check current state
SELECT 
  id,
  service_name,
  vendor_id,
  service_category,
  created_at
FROM services
WHERE vendor_id = '2-2025-003'
ORDER BY created_at DESC;

-- Step 2: Update all services from legacy ID to UUID
UPDATE services
SET vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
WHERE vendor_id = '2-2025-003';

-- Step 3: Verify the update
SELECT 
  id,
  service_name,
  vendor_id,
  service_category,
  created_at
FROM services
WHERE vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
ORDER BY created_at DESC;

-- Step 4: Confirm count
SELECT COUNT(*) as total_services
FROM services
WHERE vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';
