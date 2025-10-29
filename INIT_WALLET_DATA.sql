-- ============================================
-- QUICK FIX: Initialize Wallet for Testing
-- Run this in Neon SQL Console to create wallet and test data
-- ============================================

-- Step 1: Create wallet entry for vendor 2-2025-001
INSERT INTO vendor_wallets (vendor_id)
VALUES ('2-2025-001')
ON CONFLICT (vendor_id) DO NOTHING;

-- Step 2: Check if wallet was created
SELECT 
  vendor_id,
  total_earnings,
  available_balance,
  pending_balance,
  withdrawn_balance,
  created_at
FROM vendor_wallets 
WHERE vendor_id = '2-2025-001';

-- Step 3: (Optional) Add test transaction data
INSERT INTO wallet_transactions (
  vendor_id,
  booking_id,
  transaction_type,
  amount,
  service_category,
  status,
  payment_method,
  description
) VALUES 
(
  '2-2025-001',
  'TEST-001',
  'earning',
  50000, -- ₱500.00
  'Photography',
  'completed',
  'card',
  'Test booking earnings'
),
(
  '2-2025-001',
  'TEST-002',
  'earning',
  75000, -- ₱750.00
  'Catering',
  'completed',
  'gcash',
  'Test catering earnings'
);

-- Step 4: Update wallet balance with test earnings
UPDATE vendor_wallets
SET 
  total_earnings = 125000, -- ₱1,250.00
  available_balance = 125000,
  last_transaction_at = NOW()
WHERE vendor_id = '2-2025-001';

-- Step 5: Verify everything
SELECT 'Wallet Data:' as info;
SELECT * FROM vendor_wallets WHERE vendor_id = '2-2025-001';

SELECT 'Transaction Data:' as info;
SELECT 
  id,
  transaction_type,
  amount,
  service_category,
  status,
  created_at
FROM wallet_transactions 
WHERE vendor_id = '2-2025-001'
ORDER BY created_at DESC;

-- Step 6: Check if vendor exists
SELECT 'Vendor Exists:' as info;
SELECT id, business_name, business_type FROM vendors WHERE id = '2-2025-001';
