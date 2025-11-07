-- Fix for vendor ID mapping issue
-- Run this in your Neon SQL Console

-- Check if vendor exists for this user
SELECT * FROM vendors WHERE user_id = 'mNbGkqKfm8UWpkExc6AGxKHSFi92';

-- If no results, create vendor record
INSERT INTO vendors (
  user_id,
  business_name,
  business_type,
  email,
  phone,
  is_verified,
  created_at,
  updated_at
) VALUES (
  'mNbGkqKfm8UWpkExc6AGxKHSFi92',
  'My Vendor Business',
  'Other',
  'vendor0qw@gmail.com',
  '',
  true,
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO NOTHING;

-- Grant Premium subscription (50 service limit)
INSERT INTO vendor_subscriptions (
  vendor_id,
  plan_name,
  status,
  start_date,
  end_date,
  created_at
)
SELECT 
  id,
  'premium',
  'active',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  NOW()
FROM vendors
WHERE user_id = 'mNbGkqKfm8UWpkExc6AGxKHSFi92'
ON CONFLICT (vendor_id) DO UPDATE SET
  plan_name = 'premium',
  status = 'active',
  end_date = CURRENT_DATE + INTERVAL '30 days';

-- Verify the fix
SELECT 
  v.id as vendor_id,
  v.user_id,
  v.business_name,
  vs.plan_name,
  vs.status
FROM vendors v
LEFT JOIN vendor_subscriptions vs ON v.id = vs.vendor_id
WHERE v.user_id = 'mNbGkqKfm8UWpkExc6AGxKHSFi92';
