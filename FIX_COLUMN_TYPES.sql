-- ================================================================
-- FIX COLUMN DATA TYPES - Run in Neon SQL Editor
-- ================================================================

-- Fix total_paid: Change from INTEGER to DECIMAL
ALTER TABLE bookings 
ALTER COLUMN total_paid TYPE DECIMAL(10,2);

-- Fix remaining_balance: Change from INTEGER to DECIMAL  
ALTER TABLE bookings 
ALTER COLUMN remaining_balance TYPE DECIMAL(10,2);

-- Fix downpayment_amount: Change from INTEGER to DECIMAL
ALTER TABLE bookings 
ALTER COLUMN downpayment_amount TYPE DECIMAL(10,2);

-- Fix payment_progress: Change from INTEGER to DECIMAL
ALTER TABLE bookings 
ALTER COLUMN payment_progress TYPE DECIMAL(5,2);

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name IN (
  'total_paid', 'remaining_balance', 'downpayment_amount', 'payment_progress'
)
ORDER BY column_name;

-- Should show all as "numeric" (DECIMAL) type
-- ================================================================
