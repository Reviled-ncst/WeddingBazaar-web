-- CRITICAL FIX: Align booking_status_history constraints with bookings table
-- The booking_status_history table had mismatched status values

-- 1. Fix the new_status constraint to match bookings table allowed statuses
ALTER TABLE booking_status_history 
DROP CONSTRAINT IF EXISTS booking_status_history_new_status_check;

ALTER TABLE booking_status_history
ADD CONSTRAINT booking_status_history_new_status_check 
CHECK (new_status IN (
  'request',      -- Initial booking request
  'approved',     -- Quote approved/accepted
  'downpayment',  -- Down payment received
  'fully_paid',   -- Full payment received
  'completed',    -- Service completed
  'declined',     -- Booking declined
  'cancelled'     -- Booking cancelled
));

-- 2. Fix the changed_by_user_type constraint to allow 'system'
ALTER TABLE booking_status_history
DROP CONSTRAINT IF EXISTS booking_status_history_changed_by_user_type_check;

ALTER TABLE booking_status_history
ADD CONSTRAINT booking_status_history_changed_by_user_type_check
CHECK (changed_by_user_type IN (
  'vendor',
  'couple',
  'admin',
  'system'  -- Allow system for automated changes
));

-- 3. Verify the changes
SELECT 
  conname, 
  pg_get_constraintdef(oid) as definition 
FROM pg_constraint 
WHERE conrelid = 'booking_status_history'::regclass 
AND contype = 'c';
