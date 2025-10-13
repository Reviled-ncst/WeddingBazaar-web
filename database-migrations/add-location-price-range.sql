-- Add location and price_range columns to services table
-- Migration: Add missing service fields

-- Add location column for service location/area
ALTER TABLE services 
ADD COLUMN location VARCHAR(255);

-- Add price_range column for price range display (e.g., "₱10,000 - ₱15,000")
ALTER TABLE services 
ADD COLUMN price_range VARCHAR(100);

-- Update existing services to have default values
UPDATE services 
SET location = 'Philippines', price_range = '₱' 
WHERE location IS NULL OR price_range IS NULL;

-- Add indexes for better query performance
CREATE INDEX idx_services_location ON services(location);
CREATE INDEX idx_services_price_range ON services(price_range);
