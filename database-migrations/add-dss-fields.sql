-- ==========================================
-- ADD DSS FIELDS TO SERVICES TABLE
-- ==========================================
-- Migration: Add Dynamic Service System (DSS) fields
-- Date: October 19, 2025
-- Purpose: Enable full DSS functionality and fix service creation
-- ==========================================

-- Step 1: Add basic fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE services ADD COLUMN IF NOT EXISTS max_price NUMERIC;

-- Step 2: Add array fields for multi-select data
ALTER TABLE services ADD COLUMN IF NOT EXISTS features TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS wedding_styles TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS cultural_specialties TEXT[];

-- Step 3: Add JSONB fields for structured data
ALTER TABLE services ADD COLUMN IF NOT EXISTS locationData JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS availability JSONB;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_fields JSONB;

-- Step 4: Add DSS-specific fields
ALTER TABLE services ADD COLUMN IF NOT EXISTS years_in_business INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_tier VARCHAR(50);

-- Step 5: Set helpful defaults for new fields
ALTER TABLE services ALTER COLUMN years_in_business SET DEFAULT 0;
ALTER TABLE services ALTER COLUMN service_tier SET DEFAULT 'Basic';
ALTER TABLE services ALTER COLUMN features SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE services ALTER COLUMN tags SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE services ALTER COLUMN wedding_styles SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE services ALTER COLUMN cultural_specialties SET DEFAULT ARRAY[]::TEXT[];
ALTER TABLE services ALTER COLUMN availability SET DEFAULT '{"weekdays": false, "weekends": false, "holidays": false}'::JSONB;
ALTER TABLE services ALTER COLUMN category_fields SET DEFAULT '{}'::JSONB;

-- Step 6: Update existing services with default values
UPDATE services 
SET 
  years_in_business = COALESCE(years_in_business, 0),
  service_tier = COALESCE(service_tier, 'Basic'),
  features = COALESCE(features, ARRAY[]::TEXT[]),
  tags = COALESCE(tags, ARRAY[]::TEXT[]),
  wedding_styles = COALESCE(wedding_styles, ARRAY[]::TEXT[]),
  cultural_specialties = COALESCE(cultural_specialties, ARRAY[]::TEXT[]),
  availability = COALESCE(availability, '{"weekdays": false, "weekends": false, "holidays": false}'::JSONB),
  category_fields = COALESCE(category_fields, '{}'::JSONB)
WHERE 
  years_in_business IS NULL 
  OR service_tier IS NULL 
  OR features IS NULL 
  OR tags IS NULL 
  OR wedding_styles IS NULL 
  OR cultural_specialties IS NULL 
  OR availability IS NULL
  OR category_fields IS NULL;

-- Step 7: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_subcategory ON services(subcategory);
CREATE INDEX IF NOT EXISTS idx_services_service_tier ON services(service_tier);
CREATE INDEX IF NOT EXISTS idx_services_years_in_business ON services(years_in_business);
CREATE INDEX IF NOT EXISTS idx_services_max_price ON services(max_price);

-- Step 8: Add GIN indexes for array and JSONB columns (faster searches)
CREATE INDEX IF NOT EXISTS idx_services_features ON services USING GIN (features);
CREATE INDEX IF NOT EXISTS idx_services_tags ON services USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_services_wedding_styles ON services USING GIN (wedding_styles);
CREATE INDEX IF NOT EXISTS idx_services_cultural_specialties ON services USING GIN (cultural_specialties);
CREATE INDEX IF NOT EXISTS idx_services_locationData ON services USING GIN (locationData);
CREATE INDEX IF NOT EXISTS idx_services_availability ON services USING GIN (availability);
CREATE INDEX IF NOT EXISTS idx_services_category_fields ON services USING GIN (category_fields);

-- Step 9: Add check constraints for data validation
ALTER TABLE services ADD CONSTRAINT IF NOT EXISTS chk_years_in_business CHECK (years_in_business >= 0 AND years_in_business <= 100);
ALTER TABLE services ADD CONSTRAINT IF NOT EXISTS chk_service_tier CHECK (service_tier IN ('Basic', 'Premium', 'Luxury'));
ALTER TABLE services ADD CONSTRAINT IF NOT EXISTS chk_max_price_positive CHECK (max_price IS NULL OR max_price >= 0);

-- ==========================================
-- MIGRATION COMPLETE
-- ==========================================
-- New columns added: 11
-- Indexes added: 11
-- Constraints added: 3
-- ==========================================
