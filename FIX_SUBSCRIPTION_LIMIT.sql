-- 🚀 INSTANT FIX: Grant Premium Plan to All Vendors
-- This removes the service limit issue immediately
-- Date: November 7, 2025

-- Step 1: Delete orphaned subscriptions (optional cleanup)
DELETE FROM vendor_subscriptions 
WHERE vendor_id NOT IN (SELECT id FROM vendors);

-- Step 2: Grant Premium plan (50 services) to all existing vendors
INSERT INTO vendor_subscriptions (vendor_id, plan_name, status, start_date, end_date)
SELECT 
  id, 
  'premium', 
  'active', 
  CURRENT_DATE, 
  CURRENT_DATE + INTERVAL '30 days'
FROM vendors
WHERE id LIKE 'VEN-%'
ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'premium',
  status = 'active',
  end_date = CURRENT_DATE + INTERVAL '30 days';

-- Step 3: Verify the fix
SELECT 
  v.id,
  v.business_name,
  vs.plan_name,
  vs.status,
  vs.end_date,
  (SELECT COUNT(*) FROM services WHERE vendor_id = v.id) as service_count
FROM vendors v
LEFT JOIN vendor_subscriptions vs ON v.id = vs.vendor_id
WHERE v.id LIKE 'VEN-%'
ORDER BY v.id;

-- Expected Result: All vendors should now have 'premium' plan with 50 service limit
