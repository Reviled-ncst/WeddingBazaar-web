-- Add two-sided completion tracking to bookings table
-- This allows both vendor and couple to mark a booking as complete
-- Booking is fully completed only when BOTH sides confirm

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS vendor_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vendor_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS couple_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS couple_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completion_notes TEXT;

-- Add comment explaining the completion flow
COMMENT ON COLUMN bookings.vendor_completed IS 'Vendor has marked booking as complete (requires fully_paid status)';
COMMENT ON COLUMN bookings.couple_completed IS 'Couple/client has confirmed completion';
COMMENT ON COLUMN bookings.completion_notes IS 'Optional notes from either party about completion';

-- Create index for completion queries
CREATE INDEX IF NOT EXISTS idx_bookings_completion 
ON bookings(vendor_completed, couple_completed) 
WHERE status IN ('paid_in_full', 'fully_paid', 'completed');

-- Update existing completed bookings to have both sides marked (for backward compatibility)
UPDATE bookings 
SET vendor_completed = TRUE,
    couple_completed = TRUE,
    vendor_completed_at = updated_at,
    couple_completed_at = updated_at
WHERE status = 'completed';

COMMENT ON TABLE bookings IS 'Wedding service bookings with two-sided completion system. Status changes to "completed" only when both vendor_completed AND couple_completed are TRUE.';
