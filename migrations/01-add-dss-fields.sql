-- Migration: Add DSS (Dynamic Service System) Fields to Services Table
-- Generated: October 19, 2025
-- Purpose: Add years_in_business, service_tier, wedding_styles, cultural_specialties, availability, and locationData

-- Add DSS fields to services table
ALTER TABLE services 
  ADD COLUMN IF NOT EXISTS years_in_business INTEGER,
  ADD COLUMN IF NOT EXISTS service_tier VARCHAR(50) CHECK (service_tier IN ('Basic', 'Premium', 'Luxury')),
  ADD COLUMN IF NOT EXISTS wedding_styles TEXT[],
  ADD COLUMN IF NOT EXISTS cultural_specialties TEXT[],
  ADD COLUMN IF NOT EXISTS availability JSONB,
  ADD COLUMN IF NOT EXISTS location_data JSONB;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_years_in_business ON services(years_in_business);
CREATE INDEX IF NOT EXISTS idx_services_tier ON services(service_tier);
CREATE INDEX IF NOT EXISTS idx_services_wedding_styles ON services USING GIN(wedding_styles);
CREATE INDEX IF NOT EXISTS idx_services_cultural_specialties ON services USING GIN(cultural_specialties);
CREATE INDEX IF NOT EXISTS idx_services_availability ON services USING GIN(availability);
CREATE INDEX IF NOT EXISTS idx_services_location_data ON services USING GIN(location_data);

-- Add comments for documentation
COMMENT ON COLUMN services.years_in_business IS 'Number of years the vendor has been in business';
COMMENT ON COLUMN services.service_tier IS 'Service quality tier: Basic, Premium, or Luxury';
COMMENT ON COLUMN services.wedding_styles IS 'Array of wedding styles (Traditional, Modern, Beach, etc.)';
COMMENT ON COLUMN services.cultural_specialties IS 'Array of cultural wedding traditions (Filipino, Chinese, etc.)';
COMMENT ON COLUMN services.availability IS 'JSON object with weekdays, weekends, holidays boolean flags';
COMMENT ON COLUMN services.location_data IS 'JSON object with lat, lng, city, state, country, fullAddress';

-- Verify the migration
DO $$
BEGIN
  RAISE NOTICE 'DSS fields migration completed successfully';
  RAISE NOTICE 'Added columns: years_in_business, service_tier, wedding_styles, cultural_specialties, availability, location_data';
  RAISE NOTICE 'Added indexes for performance optimization';
END $$;
