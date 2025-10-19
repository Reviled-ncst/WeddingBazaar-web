-- Migration: Add Multi-Service Booking Support
-- Generated: October 19, 2025
-- Purpose: Enable bookings with multiple services from multiple vendors

-- Create booking_items table for multi-service bookings
CREATE TABLE IF NOT EXISTS booking_items (
  id VARCHAR(100) PRIMARY KEY,
  booking_id VARCHAR(100) NOT NULL,
  service_id VARCHAR(100),
  service_name VARCHAR(255) NOT NULL,
  service_category VARCHAR(100),
  vendor_id VARCHAR(100) NOT NULL,
  vendor_name VARCHAR(255),
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(10,2),
  total_price NUMERIC(10,2),
  dss_snapshot JSONB, -- Snapshot of DSS fields at booking time
  item_notes TEXT,
  item_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT fk_booking_item_booking FOREIGN KEY (booking_id) 
    REFERENCES bookings(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_item_service FOREIGN KEY (service_id) 
    REFERENCES services(id) ON DELETE SET NULL
);

-- Add booking_id column to conversations for context
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS booking_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS group_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS group_description TEXT;

-- Update conversation_type if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'conversation_type'
  ) THEN
    ALTER TABLE conversations ADD COLUMN conversation_type VARCHAR(50) DEFAULT 'direct';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_items_booking ON booking_items(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_service ON booking_items(service_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_vendor ON booking_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_booking_items_status ON booking_items(item_status);
CREATE INDEX IF NOT EXISTS idx_booking_items_category ON booking_items(service_category);
CREATE INDEX IF NOT EXISTS idx_conversations_booking ON conversations(booking_id);

-- Add comments
COMMENT ON TABLE booking_items IS 'Individual service items within a booking (enables multi-service bookings)';
COMMENT ON COLUMN booking_items.dss_snapshot IS 'Snapshot of service DSS fields at time of booking';
COMMENT ON COLUMN booking_items.item_status IS 'Status: pending, confirmed, cancelled, completed';
COMMENT ON COLUMN conversations.booking_id IS 'Link to booking for conversation context';
COMMENT ON COLUMN conversations.group_name IS 'Name for group conversations';

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'Multi-service booking migration completed successfully';
  RAISE NOTICE 'Created table: booking_items';
  RAISE NOTICE 'Updated table: conversations (added booking_id, group_name, group_description)';
  RAISE NOTICE 'Added indexes for performance optimization';
END $$;
