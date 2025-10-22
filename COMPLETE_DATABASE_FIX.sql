-- ================================================================
-- COMPLETE DATABASE FIX - Run ALL commands in order
-- ================================================================

-- ============================================================
-- PART 1: Fix bookings table column types
-- ============================================================
ALTER TABLE bookings ALTER COLUMN payment_progress TYPE DECIMAL(10,2);

-- ============================================================
-- PART 2: Create receipts table with correct schema
-- ============================================================

-- Drop existing receipts table if it has wrong schema
DROP TABLE IF EXISTS receipts CASCADE;

-- Create receipts table with ALL required columns
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id VARCHAR(50) NOT NULL,
  receipt_number VARCHAR(50) UNIQUE NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'PHP',
  payment_method VARCHAR(50),
  payment_intent_id VARCHAR(255),
  paid_by VARCHAR(50),
  paid_by_name VARCHAR(255),
  paid_by_email VARCHAR(255),
  total_paid INTEGER,
  remaining_balance INTEGER,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_receipts_booking_id ON receipts(booking_id);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);
CREATE INDEX idx_receipts_created_at ON receipts(created_at DESC);

-- ============================================================
-- PART 3: Verification queries
-- ============================================================

-- Verify bookings table columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN ('total_paid', 'remaining_balance', 'downpayment_amount', 'payment_progress')
ORDER BY column_name;
-- Should show all 4 as 'numeric'

-- Verify receipts table structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;
-- Should show 16 columns including payment_type, amount, etc.

-- ============================================================
-- SUCCESS INDICATORS:
-- ============================================================
-- ✅ payment_progress should be 'numeric' type
-- ✅ receipts table should have 16 columns
-- ✅ payment_type column should exist in receipts
-- ============================================================
