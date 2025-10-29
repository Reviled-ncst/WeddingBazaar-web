-- ============================================================================
-- Wedding Bazaar - Wallet System Tables
-- ============================================================================
-- Run this SQL in Neon Console to create wallet tables in production
-- ============================================================================

-- 1. Create vendor_wallets table
CREATE TABLE IF NOT EXISTS vendor_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id VARCHAR(50) UNIQUE NOT NULL,
  
  -- Balance tracking (all amounts in centavos/cents)
  total_earnings BIGINT DEFAULT 0,
  available_balance BIGINT DEFAULT 0,
  pending_balance BIGINT DEFAULT 0,
  withdrawn_amount BIGINT DEFAULT 0,
  
  -- Currency
  currency VARCHAR(3) DEFAULT 'PHP',
  currency_symbol VARCHAR(10) DEFAULT '₱',
  
  -- Statistics
  total_transactions INTEGER DEFAULT 0,
  total_deposits INTEGER DEFAULT 0,
  total_withdrawals INTEGER DEFAULT 0,
  
  -- Metadata
  last_transaction_date TIMESTAMP,
  last_withdrawal_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key
  CONSTRAINT fk_vendor
    FOREIGN KEY (vendor_id) 
    REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create index for vendor_id lookups
CREATE INDEX IF NOT EXISTS idx_vendor_wallets_vendor_id 
ON vendor_wallets(vendor_id);

-- 2. Create wallet_transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  wallet_id UUID,
  vendor_id VARCHAR(50) NOT NULL,
  booking_id UUID,
  
  -- Transaction details
  transaction_type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'refund', 'fee'
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  status VARCHAR(20) DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'cancelled'
  
  -- Payment details
  payment_method VARCHAR(50),
  payment_reference VARCHAR(255),
  
  -- Service details
  service_type VARCHAR(100),
  service_name TEXT,
  
  -- Customer details
  customer_id UUID,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  
  -- Event details
  event_date DATE,
  event_location TEXT,
  
  -- Balance tracking
  balance_before INTEGER DEFAULT 0,
  balance_after INTEGER DEFAULT 0,
  
  -- Additional info
  description TEXT,
  notes TEXT,
  metadata JSONB,
  
  -- Timestamps
  transaction_date TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_wallet_transaction
    FOREIGN KEY (wallet_id) 
    REFERENCES vendor_wallets(id) ON DELETE CASCADE,
  CONSTRAINT fk_vendor_transaction
    FOREIGN KEY (vendor_id) 
    REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_transaction
    FOREIGN KEY (booking_id) 
    REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Check constraints
  CONSTRAINT check_transaction_type 
    CHECK (transaction_type IN ('deposit', 'withdrawal', 'refund', 'fee', 'adjustment')),
  CONSTRAINT check_status 
    CHECK (status IN ('pending', 'completed', 'failed', 'cancelled'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id 
ON wallet_transactions(wallet_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_vendor_id 
ON wallet_transactions(vendor_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_booking_id 
ON wallet_transactions(booking_id);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type 
ON wallet_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_status 
ON wallet_transactions(status);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_date 
ON wallet_transactions(transaction_date DESC);

-- 3. Create reporting view
CREATE OR REPLACE VIEW wallet_transaction_view AS
SELECT 
  wt.id,
  wt.transaction_id,
  wt.vendor_id,
  v.name as vendor_name,
  v.business_name,
  wt.booking_id,
  wt.transaction_type,
  wt.amount,
  wt.currency,
  wt.status,
  wt.payment_method,
  wt.service_type,
  wt.service_name,
  wt.customer_name,
  wt.event_date,
  wt.balance_before,
  wt.balance_after,
  wt.description,
  wt.transaction_date,
  wt.created_at
FROM wallet_transactions wt
LEFT JOIN vendors v ON wt.vendor_id = v.id
ORDER BY wt.transaction_date DESC;

-- 4. Initialize wallets for existing vendors (optional - will auto-create on first transaction)
INSERT INTO vendor_wallets (vendor_id)
SELECT id FROM vendors
ON CONFLICT (vendor_id) DO NOTHING;

-- 5. Verify tables were created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('vendor_wallets', 'wallet_transactions')
ORDER BY table_name;

-- Success message
SELECT 'Wallet tables created successfully! ✅' as status;
