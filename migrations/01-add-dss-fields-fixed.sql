-- Migration: Add DSS (Dynamic Service System) Fields to Services Table
-- Generated: October 19, 2025 (Fixed Version)
-- Purpose: Add years_in_business, service_tier, wedding_styles, cultural_specialties, availability, and locationData

DO $$ 
BEGIN
    -- Add years_in_business
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='services' AND column_name='years_in_business') THEN
        ALTER TABLE services ADD COLUMN years_in_business INTEGER;
        RAISE NOTICE 'Added column years_in_business';
    ELSE
        RAISE NOTICE 'Column years_in_business already exists';
    END IF;

    -- Add service_tier
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='services' AND column_name='service_tier') THEN
        ALTER TABLE services ADD COLUMN service_tier VARCHAR(50) CHECK (service_tier IN ('Basic', 'Premium', 'Luxury'));
        RAISE NOTICE 'Added column service_tier';
    ELSE
        RAISE NOTICE 'Column service_tier already exists';
    END IF;

    -- Add wedding_styles
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='services' AND column_name='wedding_styles') THEN
        ALTER TABLE services ADD COLUMN wedding_styles TEXT[];
        RAISE NOTICE 'Added column wedding_styles';
    ELSE
        RAISE NOTICE 'Column wedding_styles already exists';
    END IF;

    -- Add cultural_specialties
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='services' AND column_name='cultural_specialties') THEN
        ALTER TABLE services ADD COLUMN cultural_specialties TEXT[];
        RAISE NOTICE 'Added column cultural_specialties';
    ELSE
        RAISE NOTICE 'Column cultural_specialties already exists';
    END IF;

    -- Add availability
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='services' AND column_name='availability') THEN
        ALTER TABLE services ADD COLUMN availability JSONB;
        RAISE NOTICE 'Added column availability';
    ELSE
        RAISE NOTICE 'Column availability already exists';
    END IF;

    -- Add location_data
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='services' AND column_name='location_data') THEN
        ALTER TABLE services ADD COLUMN location_data JSONB;
        RAISE NOTICE 'Added column location_data';
    ELSE
        RAISE NOTICE 'Column location_data already exists';
    END IF;
END $$;

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
