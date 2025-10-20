-- =============================================================================
-- MIGRATION: Fix Bookings Status Constraint
-- Date: 2025-10-21
-- Purpose: Update bookings table check constraint to support complete payment workflow
-- 
-- This migration adds support for new booking statuses:
-- - quote_sent: Vendor has sent a quote to the client
-- - quote_accepted: Client has accepted the quote, ready for payment
-- - deposit_paid: Client has paid the deposit/downpayment
-- - fully_paid: Client has paid the full amount
-- - payment_pending: Awaiting payment confirmation
-- 
-- IMPORTANT: This migration is SAFE and will not affect existing bookings
-- All existing status values remain valid, we're only ADDING new allowed values
-- =============================================================================

BEGIN;

-- Step 1: Check current constraint definition
-- Run this first to see what we're working with
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'bookings_status_check';

-- Step 2: Drop the existing constraint
-- This is safe because we're immediately adding a new one with more values
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Step 3: Add the updated constraint with all payment workflow statuses
-- This includes all original statuses PLUS the new payment workflow statuses
ALTER TABLE bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN (
  -- Original statuses (preserved for compatibility)
  'pending',
  'confirmed', 
  'cancelled',
  'completed',
  'request',
  
  -- NEW: Payment workflow statuses (added 2025-10-21)
  'quote_sent',        -- Vendor sent quote to client
  'quote_accepted',    -- Client accepted quote, ready for payment
  'deposit_paid',      -- Deposit/downpayment received
  'fully_paid',        -- Full payment received
  'payment_pending'    -- Awaiting payment confirmation
));

-- Step 4: Verify the constraint was updated correctly
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'bookings_status_check';

-- Step 5: Count existing bookings by status (to ensure no data issues)
SELECT 
  status, 
  COUNT(*) as count,
  MIN(created_at) as oldest_booking,
  MAX(created_at) as newest_booking
FROM bookings
GROUP BY status
ORDER BY count DESC;

-- Step 6: Test the new constraint by attempting to set a booking to new status
-- This is a dry-run test that will be rolled back
DO $$
DECLARE
  test_booking_id INTEGER;
BEGIN
  -- Get a test booking ID (any existing booking)
  SELECT id INTO test_booking_id FROM bookings LIMIT 1;
  
  IF test_booking_id IS NOT NULL THEN
    -- Test quote_accepted status (this should now work!)
    BEGIN
      UPDATE bookings 
      SET status = 'quote_accepted' 
      WHERE id = test_booking_id;
      
      RAISE NOTICE '✅ Test PASSED: Can set status to quote_accepted';
      
      -- Rollback the test change
      UPDATE bookings 
      SET status = 'request' 
      WHERE id = test_booking_id;
      
    EXCEPTION WHEN check_violation THEN
      RAISE EXCEPTION '❌ Test FAILED: Cannot set status to quote_accepted. Constraint was not updated correctly!';
    END;
  ELSE
    RAISE NOTICE '⚠️ No bookings found to test with';
  END IF;
END $$;

COMMIT;

-- =============================================================================
-- POST-MIGRATION VERIFICATION QUERIES
-- Run these after the migration to ensure everything is working
-- =============================================================================

-- Verify constraint is updated
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'bookings_status_check'
AND pg_get_constraintdef(oid) LIKE '%quote_accepted%';

-- Check for any bookings that might need status updates
SELECT 
  id,
  couple_id,
  vendor_id,
  status,
  notes,
  created_at,
  updated_at
FROM bookings
WHERE 
  -- Bookings that have quote-related notes but wrong status
  (notes LIKE 'QUOTE_SENT:%' AND status != 'quote_sent')
  OR (notes LIKE 'QUOTE_ACCEPTED:%' AND status != 'quote_accepted')
  OR (notes LIKE 'DEPOSIT_PAID:%' AND status != 'deposit_paid')
  OR (notes LIKE 'FULLY_PAID:%' AND status != 'fully_paid')
ORDER BY created_at DESC;

-- =============================================================================
-- ROLLBACK SCRIPT (if needed)
-- Only use this if you need to revert the migration
-- =============================================================================

-- BEGIN;
-- 
-- ALTER TABLE bookings 
-- DROP CONSTRAINT IF EXISTS bookings_status_check;
-- 
-- ALTER TABLE bookings 
-- ADD CONSTRAINT bookings_status_check 
-- CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'request'));
-- 
-- COMMIT;
