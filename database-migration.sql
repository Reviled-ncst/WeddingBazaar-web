-- WEDDING BAZAAR DATABASE SCHEMA FIX
-- Run this SQL on your Neon PostgreSQL database

BEGIN;

-- Add missing columns that backend expects
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_data JSONB;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP;

-- Update status constraint to allow all quote-related statuses
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_status_constraint;
ALTER TABLE bookings ADD CONSTRAINT booking_status_constraint 
CHECK (status IN (
  'pending', 'quote_requested', 'quote_sent', 'quote_accepted', 
  'quote_rejected', 'confirmed', 'cancelled', 'completed'
));

-- Create quotes table for detailed quote management
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    service_items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    valid_until DATE NOT NULL,
    message TEXT,
    terms TEXT,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_quotes_booking_id ON quotes(booking_id);

COMMIT;

-- Verify the changes
SELECT 'Schema update completed successfully' as result;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'bookings' AND column_name IN ('status_reason', 'quote_data');
