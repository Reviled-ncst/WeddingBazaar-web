-- 🔍 WALLET TRANSACTION DIAGNOSTIC QUERIES
-- Copy and paste these queries one by one into Neon SQL Console
-- URL: https://console.neon.tech

-- ================================================================
-- STEP 1: Find your completed bookings
-- ================================================================
SELECT 
  id,
  vendor_id,
  couple_name,
  service_type,
  status,
  amount,
  couple_completed,
  vendor_completed,
  fully_completed,
  fully_completed_at,
  created_at
FROM bookings
WHERE status = 'completed'
ORDER BY fully_completed_at DESC
LIMIT 5;

-- ❓ QUESTION: Do you see your completed booking?
-- ✅ YES → Copy the booking ID and use it in the next queries
-- ❌ NO → Your booking might not be marked as completed yet


-- ================================================================
-- STEP 2: Check receipts for your booking
-- ================================================================
-- 🔧 REPLACE 'YOUR_BOOKING_ID' with actual booking ID from Step 1

SELECT 
  id,
  booking_id,
  receipt_number,
  payment_type,
  amount,
  payment_method,
  payment_intent_id,
  created_at
FROM receipts
WHERE booking_id = 'YOUR_BOOKING_ID'
ORDER BY created_at;

-- ❓ QUESTION: Do you see receipts?
-- ✅ YES → Note the total amount (sum of all receipt amounts)
-- ❌ NO → This is the problem! Wallet transaction won't be created without receipts


-- ================================================================
-- STEP 3: Check if wallet transaction was created
-- ================================================================
-- 🔧 REPLACE 'YOUR_BOOKING_ID' with actual booking ID

SELECT 
  transaction_id,
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  payment_method,
  payment_reference,
  description,
  created_at
FROM wallet_transactions
WHERE booking_id = 'YOUR_BOOKING_ID';

-- ❓ QUESTION: Do you see a wallet transaction?
-- ✅ YES → Great! The system is working correctly
-- ❌ NO → Transaction is missing! Continue to Step 4


-- ================================================================
-- STEP 4: Completion to Wallet Transaction Mapping
-- ================================================================
-- This query shows which completed bookings have wallet transactions

SELECT 
  b.id as booking_id,
  b.vendor_id,
  b.couple_name,
  b.service_type,
  b.status,
  b.amount as booking_amount,
  b.fully_completed_at,
  (SELECT COUNT(*) FROM receipts WHERE booking_id = b.id) as receipts_count,
  (SELECT SUM(amount) FROM receipts WHERE booking_id = b.id) as total_paid_centavos,
  wt.transaction_id,
  wt.amount as wallet_amount,
  wt.created_at as transaction_created_at,
  CASE 
    WHEN wt.id IS NULL THEN '❌ MISSING'
    ELSE '✅ EXISTS'
  END as wallet_status
FROM bookings b
LEFT JOIN wallet_transactions wt ON wt.booking_id = b.id
WHERE b.status = 'completed'
ORDER BY b.fully_completed_at DESC;

-- ❓ QUESTION: What is the wallet_status for your booking?
-- ✅ EXISTS → Everything is working!
-- ❌ MISSING → Transaction was not created. See Step 5 for manual fix


-- ================================================================
-- STEP 5: Manual Wallet Transaction Creation
-- ================================================================
-- ⚠️ ONLY USE THIS IF STEP 4 SHOWS "MISSING"
-- 🔧 REPLACE the following values:
--    - YOUR_VENDOR_ID
--    - YOUR_BOOKING_ID
--    - TOTAL_PAID_CENTAVOS (from Step 2)
--    - COUPLE_NAME
--    - SERVICE_TYPE
--    - PAYMENT_METHOD (e.g., 'card', 'gcash')
--    - PAYMENT_INTENT_ID (from Step 2)

INSERT INTO wallet_transactions (
  transaction_id,
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  currency,
  status,
  description,
  payment_method,
  payment_reference,
  service_name,
  service_category,
  customer_name,
  metadata
) VALUES (
  'TXN-' || upper(substr(md5(random()::text), 1, 12)),  -- Auto-generate transaction ID
  'YOUR_VENDOR_ID',
  'YOUR_BOOKING_ID',
  'earning',
  TOTAL_PAID_CENTAVOS / 100.0,  -- Convert centavos to decimal (e.g., 10000 → 100.00)
  'PHP',
  'completed',
  'Booking completed - Payment from COUPLE_NAME',
  'PAYMENT_METHOD',
  'PAYMENT_INTENT_ID',
  'SERVICE_TYPE',
  'SERVICE_TYPE',
  'COUPLE_NAME',
  jsonb_build_object(
    'booking_id', 'YOUR_BOOKING_ID',
    'completion_type', 'manual_creation',
    'note', 'Created manually via SQL'
  )
);

-- ✅ After running this, the transaction should appear in the vendor's wallet


-- ================================================================
-- STEP 6: Update Vendor Wallet Balance
-- ================================================================
-- ⚠️ ONLY RUN AFTER STEP 5
-- 🔧 REPLACE YOUR_VENDOR_ID and AMOUNT (in decimal, e.g., 100.00)

UPDATE vendor_wallets
SET 
  total_earnings = total_earnings + AMOUNT,
  available_balance = available_balance + AMOUNT,
  updated_at = NOW()
WHERE vendor_id = 'YOUR_VENDOR_ID';

-- ✅ Vendor should now see the updated balance


-- ================================================================
-- STEP 7: Verify Everything
-- ================================================================
-- Check vendor wallet balance

SELECT 
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount,
  updated_at
FROM vendor_wallets
WHERE vendor_id = 'YOUR_VENDOR_ID';

-- Check all transactions for this vendor

SELECT 
  transaction_id,
  booking_id,
  transaction_type,
  amount,
  payment_method,
  description,
  created_at
FROM wallet_transactions
WHERE vendor_id = 'YOUR_VENDOR_ID'
ORDER BY created_at DESC;

-- ================================================================
-- 🎉 DONE!
-- ================================================================
-- If you see your transaction and the wallet balance is correct,
-- everything is working now!
