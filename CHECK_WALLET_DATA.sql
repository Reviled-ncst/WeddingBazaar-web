-- ============================================
-- CHECK WALLET DATA FOR VENDOR 2-2025-001
-- Run this in Neon SQL Console
-- ============================================

-- 1. Check if vendor exists
SELECT 
  id,
  business_name,
  business_type,
  created_at
FROM vendors 
WHERE id = '2-2025-001';

-- 2. Check if vendor wallet exists
SELECT * FROM vendor_wallets 
WHERE vendor_id = '2-2025-001';

-- 3. Check wallet transactions
SELECT 
  id,
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  service_category,
  created_at
FROM wallet_transactions 
WHERE vendor_id = '2-2025-001'
ORDER BY created_at DESC;

-- 4. Check bookings for this vendor
SELECT 
  id,
  booking_reference,
  service_type,
  status,
  amount,
  fully_completed,
  couple_completed,
  vendor_completed
FROM bookings 
WHERE vendor_id = '2-2025-001'
ORDER BY created_at DESC;

-- 5. Check if there are any completed bookings that should create earnings
SELECT 
  b.id,
  b.booking_reference,
  b.service_type,
  b.status,
  b.amount,
  b.fully_completed,
  b.couple_completed_at,
  b.vendor_completed_at
FROM bookings b
WHERE b.vendor_id = '2-2025-001'
  AND b.fully_completed = true
  AND b.status = 'completed';

-- 6. Check all wallet tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('vendor_wallets', 'wallet_transactions');
