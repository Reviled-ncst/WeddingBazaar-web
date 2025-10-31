-- =====================================================
-- ADD COORDINATOR-SPECIFIC FIELDS TO VENDORS TABLE
-- Date: October 31, 2025
-- Purpose: Support coordinator registration with required fields
-- =====================================================

-- Add team_size column (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendors' AND column_name = 'team_size'
  ) THEN
    ALTER TABLE vendors ADD COLUMN team_size VARCHAR(50);
    COMMENT ON COLUMN vendors.team_size IS 'Team size range: Solo, 2-5, 6-10, 11-20, 20+';
  END IF;
END $$;

-- Add specialties column as TEXT[] array (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendors' AND column_name = 'specialties'
  ) THEN
    ALTER TABLE vendors ADD COLUMN specialties TEXT[];
    COMMENT ON COLUMN vendors.specialties IS 'Array of wedding specialties (Cultural Weddings, Destination Weddings, etc.)';
  END IF;
END $$;

-- Convert service_areas from TEXT to TEXT[] if needed
DO $$ 
BEGIN
  -- Check current data type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendors' 
    AND column_name = 'service_areas' 
    AND data_type = 'text'
  ) THEN
    -- First, convert existing comma-separated values to arrays
    UPDATE vendors 
    SET service_areas = CASE 
      WHEN service_areas IS NOT NULL AND service_areas != '' 
      THEN ARRAY[service_areas]::TEXT[]
      ELSE NULL 
    END
    WHERE service_areas IS NOT NULL;
    
    -- Now change the column type to TEXT[]
    ALTER TABLE vendors ALTER COLUMN service_areas TYPE TEXT[] USING 
      CASE 
        WHEN service_areas IS NULL THEN NULL
        ELSE ARRAY[service_areas]
      END;
      
    COMMENT ON COLUMN vendors.service_areas IS 'Array of service areas (Metro Manila, Luzon, Visayas, etc.)';
  END IF;
END $$;

-- Create indexes for array columns to improve query performance
CREATE INDEX IF NOT EXISTS idx_vendors_specialties ON vendors USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_vendors_service_areas ON vendors USING GIN(service_areas);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'vendors'
AND column_name IN ('years_experience', 'team_size', 'specialties', 'service_areas')
ORDER BY column_name;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Coordinator fields added successfully!';
  RAISE NOTICE '   - years_experience: integer (already existed)';
  RAISE NOTICE '   - team_size: VARCHAR(50) (NEW)';
  RAISE NOTICE '   - specialties: TEXT[] (NEW)';
  RAISE NOTICE '   - service_areas: TEXT[] (converted from TEXT)';
END $$;
