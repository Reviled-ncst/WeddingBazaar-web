-- ============================================================================
-- WALLET SYSTEM - PRODUCTION DATABASE SETUP
-- ============================================================================
-- Execute this SQL in Neon SQL Console to create wallet tables
-- URL: https://console.neon.tech/app/projects/[your-project]/sql-editor
-- ============================================================================

-- Step 1: Create vendor_wallets table
CREATE TABLE IF NOT EXISTS vendor_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) NOT NULL UNIQUE,
  total_earnings DECIMAL(12,2) DEFAULT 0.00,
  available_balance DECIMAL(12,2) DEFAULT 0.00,
  pending_balance DECIMAL(12,2) DEFAULT 0.00,
  withdrawn_amount DECIMAL(12,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'PHP',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 2: Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(50) UNIQUE NOT NULL,
  vendor_id VARCHAR(50) NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earning', 'withdrawal', 'refund', 'adjustment')),
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  description TEXT,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  service_name VARCHAR(255),
  service_category VARCHAR(100),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  event_date DATE,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Step 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_vendor ON wallet_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking ON wallet_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status ON wallet_transactions(status);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_date ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_wallets_vendor ON vendor_wallets(vendor_id);

-- Step 4: Migrate existing completed bookings to wallet
-- This finds all completed bookings and creates wallet entries + transactions

-- First, create wallets for vendors with completed bookings
INSERT INTO vendor_wallets (vendor_id, total_earnings, available_balance, created_at, updated_at)
SELECT DISTINCT
  b.vendor_id,
  0.00 as total_earnings,
  0.00 as available_balance,
  NOW() as created_at,
  NOW() as updated_at
FROM bookings b
WHERE b.status = 'completed'
  AND b.fully_completed = true
  AND b.vendor_id IS NOT NULL
ON CONFLICT (vendor_id) DO NOTHING;

-- Then, create transactions for all completed bookings
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
  service_name,
  service_category,
  customer_name,
  event_date,
  created_at,
  updated_at
)
SELECT
  'TXN-' || b.id as transaction_id,
  b.vendor_id,
  b.id,
  'earning' as transaction_type,
  COALESCE(b.amount, 0.00) as amount,
  'PHP' as currency,
  'completed' as status,
  'Booking payment for ' || COALESCE(b.service_type, 'service') as description,
  CASE 
    WHEN b.payment_method IS NOT NULL THEN b.payment_method
    ELSE 'card'
  END as payment_method,
  b.service_type as service_name,
  b.service_type as service_category,
  'Customer' as customer_name,
  b.event_date,
  b.completed_at as created_at,
  b.completed_at as updated_at
FROM bookings b
WHERE b.status = 'completed'
  AND b.fully_completed = true
  AND b.vendor_id IS NOT NULL
  AND b.amount IS NOT NULL
  AND b.amount > 0
ON CONFLICT (transaction_id) DO NOTHING;

-- Finally, update wallet balances based on transactions
UPDATE vendor_wallets vw
SET 
  total_earnings = (
    SELECT COALESCE(SUM(amount), 0)
    FROM wallet_transactions wt
    WHERE wt.vendor_id = vw.vendor_id
      AND wt.transaction_type = 'earning'
      AND wt.status = 'completed'
  ),
  available_balance = (
    SELECT COALESCE(SUM(amount), 0)
    FROM wallet_transactions wt
    WHERE wt.vendor_id = vw.vendor_id
      AND wt.transaction_type = 'earning'
      AND wt.status = 'completed'
  ),
  updated_at = NOW();

-- Step 5: Verify the setup
SELECT 
  'Vendor Wallets Created' as status,
  COUNT(*) as count
FROM vendor_wallets
UNION ALL
SELECT 
  'Transactions Created' as status,
  COUNT(*) as count
FROM wallet_transactions
UNION ALL
SELECT 
  'Total Earnings (PHP)' as status,
  ROUND(SUM(total_earnings), 2) as count
FROM vendor_wallets;

-- ============================================================================
-- EXPECTED OUTPUT:
-- ============================================================================
-- Vendor Wallets Created    | 2 (or however many vendors have completed bookings)
-- Transactions Created       | 2 (or however many completed bookings exist)
-- Total Earnings (PHP)       | Sum of all completed booking amounts
-- ============================================================================
