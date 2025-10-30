-- ============================================================================
-- Check Wallet System Status and Create Test Data
-- ============================================================================
-- Run this in Neon SQL Console to diagnose and fix empty wallet issue
-- ============================================================================

-- Step 1: Check if wallet tables exist
SELECT 'Checking wallet tables...' as step;

SELECT 
  'vendor_wallets' as table_name,
  COUNT(*) as record_count
FROM vendor_wallets
UNION ALL
SELECT 
  'wallet_transactions' as table_name,
  COUNT(*) as record_count
FROM wallet_transactions;

-- Step 2: Check for completed bookings
SELECT 'Checking completed bookings...' as step;

SELECT 
  COUNT(*) as total_completed_bookings,
  COUNT(CASE WHEN fully_completed = true THEN 1 END) as fully_completed_count,
  COUNT(CASE WHEN vendor_completed = true AND couple_completed = true THEN 1 END) as both_confirmed_count
FROM bookings
WHERE status = 'completed';

-- Step 3: Check specific vendor
SELECT 'Checking vendor wallet...' as step;

SELECT 
  v.id as vendor_id,
  v.business_name,
  vw.total_earnings,
  vw.available_balance,
  vw.pending_balance,
  (SELECT COUNT(*) FROM wallet_transactions WHERE vendor_id = v.id::text) as transaction_count
FROM vendors v
LEFT JOIN vendor_wallets vw ON v.id::text = vw.vendor_id
WHERE v.id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- Step 4: Create test wallet transaction for the current vendor
-- This simulates a completed booking payment

-- First, ensure vendor wallet exists
INSERT INTO vendor_wallets (vendor_id)
VALUES ('eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1')
ON CONFLICT (vendor_id) DO NOTHING;

-- Create a test transaction (₱42,000.00 wedding photography booking)
INSERT INTO wallet_transactions (
  transaction_id,
  vendor_id,
  transaction_type,
  amount,
  currency,
  status,
  description,
  payment_method,
  service_name,
  service_category,
  customer_name,
  customer_email,
  event_date,
  created_at,
  updated_at
)
VALUES (
  'TXN-TEST-' || gen_random_uuid(),
  'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1',
  'earning',
  42000.00,  -- ₱42,000.00
  'PHP',
  'completed',
  'Wedding Photography Package - Test Booking',
  'card',
  'Wedding Photography',
  'Photography',
  'Juan & Maria Dela Cruz',
  'couple@example.com',
  CURRENT_DATE + INTERVAL '30 days',
  NOW(),
  NOW()
)
ON CONFLICT (transaction_id) DO NOTHING;

-- Create another test transaction (₱25,000.00 catering booking)
INSERT INTO wallet_transactions (
  transaction_id,
  vendor_id,
  transaction_type,
  amount,
  currency,
  status,
  description,
  payment_method,
  service_name,
  service_category,
  customer_name,
  customer_email,
  event_date,
  created_at,
  updated_at
)
VALUES (
  'TXN-TEST-' || gen_random_uuid(),
  'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1',
  'earning',
  25000.00,  -- ₱25,000.00
  'PHP',
  'completed',
  'Wedding Catering Service - Test Booking',
  'gcash',
  'Wedding Catering',
  'Catering',
  'Carlos & Ana Santos',
  'couple2@example.com',
  CURRENT_DATE + INTERVAL '45 days',
  NOW() - INTERVAL '15 days',  -- 15 days ago
  NOW() - INTERVAL '15 days'
)
ON CONFLICT (transaction_id) DO NOTHING;

-- Create a third transaction (₱18,928.00 videography booking)
INSERT INTO wallet_transactions (
  transaction_id,
  vendor_id,
  transaction_type,
  amount,
  currency,
  status,
  description,
  payment_method,
  service_name,
  service_category,
  customer_name,
  customer_email,
  event_date,
  created_at,
  updated_at
)
VALUES (
  'TXN-TEST-' || gen_random_uuid(),
  'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1',
  'earning',
  18928.00,  -- ₱18,928.00
  'PHP',
  'completed',
  'Wedding Videography Package - Test Booking',
  'paymaya',
  'Wedding Videography',
  'Videography',
  'Pedro & Rosa Martinez',
  'couple3@example.com',
  CURRENT_DATE + INTERVAL '60 days',
  NOW() - INTERVAL '30 days',  -- 30 days ago
  NOW() - INTERVAL '30 days'
)
ON CONFLICT (transaction_id) DO NOTHING;

-- Step 5: Update vendor wallet balance
UPDATE vendor_wallets
SET 
  total_earnings = (
    SELECT COALESCE(SUM(amount), 0)
    FROM wallet_transactions
    WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
      AND transaction_type = 'earning'
      AND status = 'completed'
  ),
  available_balance = (
    SELECT COALESCE(SUM(amount), 0)
    FROM wallet_transactions
    WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
      AND transaction_type = 'earning'
      AND status = 'completed'
  ),
  updated_at = NOW()
WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- Step 6: Verify the data was created
SELECT 'Verification after creating test data...' as step;

-- Check wallet balance
SELECT 
  'Wallet Balance' as check_type,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount
FROM vendor_wallets
WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- Check transactions
SELECT 
  'Transactions' as check_type,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount,
  ARRAY_AGG(service_category) as categories
FROM wallet_transactions
WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

-- List all transactions
SELECT 
  transaction_id,
  transaction_type,
  amount,
  service_name,
  customer_name,
  created_at::date as transaction_date,
  status
FROM wallet_transactions
WHERE vendor_id = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1'
ORDER BY created_at DESC;

SELECT '✅ Test data created! Refresh the page to see transactions.' as result;
