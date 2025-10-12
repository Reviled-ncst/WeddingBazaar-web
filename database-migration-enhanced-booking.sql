-- =====================================
-- DATABASE MIGRATION SCRIPT
-- For Wedding Bazaar Enhanced Booking System
-- =====================================

-- Add missing columns to comprehensive_bookings table
ALTER TABLE comprehensive_bookings 
ADD COLUMN IF NOT EXISTS status_reason TEXT,
ADD COLUMN IF NOT EXISTS quote_data JSONB,
ADD COLUMN IF NOT EXISTS quote_sent_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_accepted_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_rejected_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_viewed_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS quote_expired_date TIMESTAMP;

-- Add payment-related columns
ALTER TABLE comprehensive_bookings 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255),
ADD COLUMN IF NOT EXISTS downpayment_paid_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_payment_date TIMESTAMP;

-- Update any existing bookings to use new status values if needed
UPDATE comprehensive_bookings 
SET status = 'quote_requested' 
WHERE status IS NULL OR status = '';

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_status ON comprehensive_bookings(status);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_quote_sent_date ON comprehensive_bookings(quote_sent_date);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_vendor_id ON comprehensive_bookings(vendor_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_couple_id ON comprehensive_bookings(couple_id);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_event_date ON comprehensive_bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_comprehensive_bookings_created_at ON comprehensive_bookings(created_at);

-- Ensure booking_timeline table exists for tracking booking history
CREATE TABLE IF NOT EXISTS booking_timeline (
  id VARCHAR PRIMARY KEY,
  booking_id VARCHAR NOT NULL,
  actor_id VARCHAR,
  actor_type VARCHAR DEFAULT 'system',
  action VARCHAR NOT NULL,
  old_status VARCHAR,
  new_status VARCHAR,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint if not exists (with error handling)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_booking_timeline_booking_id' 
        AND table_name = 'booking_timeline'
    ) THEN
        ALTER TABLE booking_timeline 
        ADD CONSTRAINT fk_booking_timeline_booking_id 
        FOREIGN KEY (booking_id) REFERENCES comprehensive_bookings(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for timeline performance
CREATE INDEX IF NOT EXISTS idx_booking_timeline_booking_id ON booking_timeline(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_timeline_created_at ON booking_timeline(created_at);
CREATE INDEX IF NOT EXISTS idx_booking_timeline_action ON booking_timeline(action);

-- Create or update booking status enum (optional - PostgreSQL will handle this gracefully)
DO $$ 
BEGIN
    -- Check if the enum type exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status_enum') THEN
        CREATE TYPE booking_status_enum AS ENUM (
            'pending',
            'confirmed', 
            'cancelled',
            'completed',
            'quote_requested',
            'quote_sent',
            'quote_viewed',
            'quote_accepted',
            'quote_rejected',
            'quote_expired',
            'payment_pending',
            'payment_partial',
            'payment_completed',
            'in_progress',
            'service_completed', 
            'review_pending',
            'disputed',
            'refunded',
            'on_hold'
        );
    ELSE
        -- Add new enum values if they don't exist
        BEGIN
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'quote_requested';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'quote_sent';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'quote_viewed';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'quote_accepted';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'quote_rejected';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'quote_expired';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'payment_pending';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'payment_partial';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'payment_completed';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'in_progress';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'service_completed';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'review_pending';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'disputed';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'refunded';
            ALTER TYPE booking_status_enum ADD VALUE IF NOT EXISTS 'on_hold';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Enum values already exist, continue
                NULL;
        END;
    END IF;
END $$;

-- Add sample data for testing (optional)
-- This creates a test booking if none exist
INSERT INTO comprehensive_bookings (
    id, 
    booking_reference, 
    couple_id, 
    vendor_id, 
    service_type,
    service_name,
    event_date,
    status,
    total_paid,
    contract_signed,
    metadata,
    created_at,
    updated_at
) 
SELECT 
    gen_random_uuid()::text,
    'WB-TEST-' || EXTRACT(EPOCH FROM NOW())::text,
    'test-couple-001',
    '2', -- Use existing vendor ID
    'Photography',
    'Wedding Photography Package',
    CURRENT_DATE + INTERVAL '30 days',
    'quote_requested',
    0,
    false,
    '{"test": true, "migration": "enhanced_booking_system"}',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM comprehensive_bookings 
    WHERE couple_id = 'test-couple-001' 
    AND vendor_id = '2'
);

-- Verify the migration
SELECT 
    'comprehensive_bookings' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status_reason IS NOT NULL THEN 1 END) as records_with_status_reason,
    COUNT(CASE WHEN quote_data IS NOT NULL THEN 1 END) as records_with_quote_data,
    COUNT(DISTINCT status) as unique_statuses
FROM comprehensive_bookings

UNION ALL

SELECT 
    'booking_timeline' as table_name,
    COUNT(*) as total_records,
    0 as records_with_status_reason,
    0 as records_with_quote_data,
    COUNT(DISTINCT action) as unique_actions
FROM booking_timeline;

-- Show current booking statuses
SELECT status, COUNT(*) as count 
FROM comprehensive_bookings 
GROUP BY status 
ORDER BY count DESC;
