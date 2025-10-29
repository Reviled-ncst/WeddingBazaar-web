-- ============================================
-- QUICK CHECK: Does Wallet Data Exist?
-- Run this in Neon SQL Console
-- ============================================

-- 1. Check if tables exist
SELECT 
  'Tables that exist:' as info,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('vendor_wallets', 'wallet_transactions')
ORDER BY table_name;

-- 2. Check if wallet exists for vendor 2-2025-001
SELECT 
  '=== WALLET DATA ===' as section,
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_amount,
  created_at
FROM vendor_wallets 
WHERE vendor_id = '2-2025-001';

-- 3. Check if transactions exist
SELECT 
  '=== TRANSACTION DATA ===' as section,
  COUNT(*) as transaction_count,
  SUM(amount) as total_amount
FROM wallet_transactions 
WHERE vendor_id = '2-2025-001';

-- 4. Show actual transactions (if any)
SELECT 
  transaction_id,
  booking_id,
  transaction_type,
  amount,
  service_category,
  status,
  created_at
FROM wallet_transactions 
WHERE vendor_id = '2-2025-001'
ORDER BY created_at DESC
LIMIT 10;

-- 5. Check if vendor exists in vendors table
SELECT 
  '=== VENDOR EXISTS ===' as section,
  id,
  business_name,
  business_type
FROM vendors 
WHERE id = '2-2025-001';

-- 6. Check completed bookings for this vendor
SELECT 
  '=== COMPLETED BOOKINGS ===' as section,
  COUNT(*) as completed_bookings,
  SUM(amount) as total_booking_amounts
FROM bookings 
WHERE vendor_id = '2-2025-001' 
  AND status = 'completed'
  AND fully_completed = true;
