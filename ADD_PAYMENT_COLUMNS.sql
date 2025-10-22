-- ================================================================
-- PAYMENT TRACKING COLUMNS MIGRATION
-- Run these commands in Neon SQL Editor
-- ================================================================

-- Add total_paid column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10,2) DEFAULT 0.00;

-- Add payment_amount column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10,2);

-- Add payment_type column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50);

-- Add payment_status column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add payment_date column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP;

-- Add payment_method column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);

-- Add payment_intent_id column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);

-- Add receipt_number column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50);

-- ================================================================
-- VERIFICATION QUERY
-- Run this after the ALTER TABLE commands to verify
-- ================================================================

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN (
  'total_paid', 'payment_amount', 'payment_type', 
  'payment_status', 'payment_date', 'payment_method',
  'payment_intent_id', 'receipt_number'
)
ORDER BY column_name;

-- You should see 8 rows returned
-- ================================================================
