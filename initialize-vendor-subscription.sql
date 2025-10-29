-- 🎯 Initialize Vendor Subscription for Upgrades
-- ✅ COMPLETED: Subscription created successfully!
-- Run this in Neon database SQL editor if needed for other vendors

-- Check if vendor has subscription
SELECT 
  vp.id AS vendor_id,
  vp.business_name AS business_name,
  vs.id AS subscription_id,
  vs.plan_name,
  vs.status,
  vs.created_at
FROM vendor_profiles vp
LEFT JOIN vendor_subscriptions vs ON vp.id::text = vs.vendor_id::text
WHERE vp.id::text = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- If subscription_id is NULL, vendor has NO subscription record!
-- Create initial subscription record using the correct columns:

INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_id,
  plan_name,
  billing_cycle,
  status,
  start_date,
  end_date,
  current_period_start,
  current_period_end,
  cancel_at_period_end
)
SELECT 
  'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1',
  'free',  -- Free tier plan_id
  'free',  -- Free tier plan_name
  'monthly',
  'active',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW() + INTERVAL '30 days',
  false
WHERE NOT EXISTS (
  SELECT 1 FROM vendor_subscriptions 
  WHERE vendor_id::text = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
);

-- Verify insertion
SELECT 
  vp.id AS vendor_id,
  vp.business_name AS business_name,
  vs.id AS subscription_id,
  vs.plan_name AS subscription_plan,
  vs.status,
  vs.start_date,
  vs.end_date
FROM vendor_profiles vp
LEFT JOIN vendor_subscriptions vs ON vp.id::text = vs.vendor_id::text
WHERE vp.id::text = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- Expected result:
-- vendor_id: eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1
-- business_name: nananananna
-- subscription_id: fe700889-4267-4381-8d1d-cb3b4ceade19
-- subscription_plan: free
-- status: active

-- ✅ COMPLETED: Subscription created successfully on Oct 28, 2025!
-- ✅ After this, the upgrade flow should work correctly!
