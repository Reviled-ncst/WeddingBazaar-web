-- WEDDING BAZAAR BACKEND SCHEMA FIXES
-- This SQL script fixes the database schema issues identified in our tests

-- 1. ADD MISSING COLUMNS TO BOOKINGS TABLE
-- Fix: Add status_reason column that the backend code expects
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- Add quote-related columns for better quote management
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS quote_data JSONB,
ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS quote_total DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS quote_valid_until DATE;

-- 2. UPDATE STATUS ENUM TO INCLUDE ALL NEEDED VALUES
-- First, let's see what constraint exists on status
-- Note: This may need to be run separately depending on your PostgreSQL setup

-- Drop existing check constraint if it exists (adjust name as needed)
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
-- ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_booking_status;

-- Add comprehensive status constraint
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_status_constraint;
ALTER TABLE bookings 
ADD CONSTRAINT booking_status_constraint 
CHECK (status IN (
    'pending',
    'quote_requested', 
    'quote_sent',
    'quote_accepted',
    'quote_rejected',
    'confirmed',
    'cancelled',
    'completed',
    'refunded',
    'disputed'
));

-- 3. CREATE QUOTES TABLE FOR DETAILED QUOTE MANAGEMENT
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id),
    quote_number VARCHAR(50) UNIQUE NOT NULL,
    service_items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    downpayment_percentage INTEGER DEFAULT 30,
    downpayment_amount DECIMAL(10,2),
    valid_until DATE NOT NULL,
    message TEXT,
    terms TEXT,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster quote lookups
CREATE INDEX IF NOT EXISTS idx_quotes_booking_id ON quotes(booking_id);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- 4. CREATE BOOKING STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS booking_status_history (
    id SERIAL PRIMARY KEY,
    booking_id VARCHAR(50) REFERENCES bookings(id),
    old_status VARCHAR(20),
    new_status VARCHAR(20),
    reason TEXT,
    changed_by VARCHAR(50),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for status history
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking_id ON booking_status_history(booking_id);

-- 5. ADD HELPFUL FUNCTIONS

-- Function to update booking status with history tracking
CREATE OR REPLACE FUNCTION update_booking_status(
    p_booking_id VARCHAR(50),
    p_new_status VARCHAR(20),
    p_reason TEXT DEFAULT NULL,
    p_changed_by VARCHAR(50) DEFAULT 'system'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_old_status VARCHAR(20);
    v_updated_rows INTEGER;
BEGIN
    -- Get current status
    SELECT status INTO v_old_status FROM bookings WHERE id = p_booking_id;
    
    IF v_old_status IS NULL THEN
        RAISE EXCEPTION 'Booking not found: %', p_booking_id;
    END IF;
    
    -- Update the booking status
    UPDATE bookings 
    SET status = p_new_status, 
        status_reason = p_reason,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_booking_id;
    
    GET DIAGNOSTICS v_updated_rows = ROW_COUNT;
    
    IF v_updated_rows > 0 THEN
        -- Insert into history
        INSERT INTO booking_status_history (booking_id, old_status, new_status, reason, changed_by)
        VALUES (p_booking_id, v_old_status, p_new_status, p_reason, p_changed_by);
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 6. SAMPLE DATA FIXES
-- Update any existing bookings to have proper status values
UPDATE bookings 
SET status = 'pending' 
WHERE status NOT IN ('pending', 'quote_requested', 'quote_sent', 'quote_accepted', 'quote_rejected', 'confirmed', 'cancelled', 'completed', 'refunded', 'disputed');

-- 7. GRANT PERMISSIONS (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON quotes TO your_backend_user;
-- GRANT ALL PRIVILEGES ON booking_status_history TO your_backend_user;
-- GRANT EXECUTE ON FUNCTION update_booking_status TO your_backend_user;

-- 8. VIEW FOR BOOKINGS WITH QUOTE INFORMATION
CREATE OR REPLACE VIEW bookings_with_quotes AS
SELECT 
    b.*,
    q.quote_number,
    q.service_items as quote_items,
    q.subtotal as quote_subtotal,
    q.tax as quote_tax,
    q.total as quote_total,
    q.downpayment_amount,
    q.valid_until as quote_valid_until,
    q.message as quote_message,
    q.terms as quote_terms,
    q.status as quote_status,
    q.created_at as quote_created_at
FROM bookings b
LEFT JOIN quotes q ON b.id = q.booking_id;

-- Show the updated schema
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
