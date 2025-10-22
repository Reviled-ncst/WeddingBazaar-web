-- ================================================================
-- CREATE RECEIPTS TABLE - Full Schema
-- Run this in Neon SQL Editor
-- ================================================================

-- Drop existing receipts table if it exists (to recreate with correct schema)
DROP TABLE IF EXISTS receipts CASCADE;

-- Create receipts table with correct schema
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

-- Create index for faster lookups
CREATE INDEX idx_receipts_booking_id ON receipts(booking_id);
CREATE INDEX idx_receipts_receipt_number ON receipts(receipt_number);

-- Verify the table was created
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'receipts'
ORDER BY ordinal_position;

-- ================================================================
