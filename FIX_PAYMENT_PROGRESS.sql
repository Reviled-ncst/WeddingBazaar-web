-- ================================================================
-- FIX payment_progress - Final Data Type Fix
-- ================================================================

-- Fix payment_progress: Change from INTEGER to DECIMAL
ALTER TABLE bookings 
ALTER COLUMN payment_progress TYPE DECIMAL(5,2);

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
AND column_name = 'payment_progress';

-- Should show: payment_progress | numeric
-- ================================================================
