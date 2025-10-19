-- =====================================
-- ADD MISSING BOOKING COLUMNS
-- Wedding Bazaar - Complete Booking Data Migration
-- =====================================

BEGIN;

-- Add missing columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_end_time TIME;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS venue_details TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS couple_name VARCHAR(255);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_vendor_name ON bookings(vendor_name);
CREATE INDEX IF NOT EXISTS idx_bookings_couple_name ON bookings(couple_name);
CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON bookings(contact_email);
CREATE INDEX IF NOT EXISTS idx_bookings_event_end_time ON bookings(event_end_time);

COMMIT;

-- Verify the changes
SELECT 'Missing columns added successfully!' as result;

-- Show all bookings columns
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
