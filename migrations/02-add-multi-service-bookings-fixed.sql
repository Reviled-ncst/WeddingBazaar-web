-- Migration: Add Multi-Service Booking Support (Fixed)
-- Generated: October 19, 2025
-- Purpose: Enable bookings with multiple services from multiple vendors
-- Fixed: Changed booking_id to INTEGER to match bookings table

-- Create booking_items table for multi-service bookings
CREATE TABLE IF NOT EXISTS booking_items (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER NOT NULL,
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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'booking_id'
  ) THEN
    ALTER TABLE conversations ADD COLUMN booking_id INTEGER;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'group_name'
  ) THEN
    ALTER TABLE conversations ADD COLUMN group_name VARCHAR(255);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conversations' AND column_name = 'group_description'
  ) THEN
    ALTER TABLE conversations ADD COLUMN group_description TEXT;
  END IF;
  
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
CREATE INDEX IF NOT EXISTS idx_conversations_booking ON conversations(booking_id);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(conversation_type);

-- Add comments for documentation
COMMENT ON TABLE booking_items IS 'Individual items/services within a multi-service booking';
COMMENT ON COLUMN booking_items.dss_snapshot IS 'JSON snapshot of DSS fields (years_in_business, service_tier, etc.) at time of booking';
COMMENT ON COLUMN conversations.booking_id IS 'Link conversation to a specific booking for context';
COMMENT ON COLUMN conversations.conversation_type IS 'Type: direct (1-on-1) or group (multi-participant)';
COMMENT ON COLUMN conversations.group_name IS 'Name for group conversations (e.g., "Wedding Planning Team")';
