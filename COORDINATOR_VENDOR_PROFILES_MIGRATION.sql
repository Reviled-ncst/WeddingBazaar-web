-- Coordinator Registration Fields Migration (vendor_profiles table)
-- Execute this in Neon SQL Console

-- Add years_experience column
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;

-- Add team_size column
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS team_size VARCHAR(50);

-- Add specialties column (array type)
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Check current service_areas type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendor_profiles' 
AND column_name = 'service_areas';

-- Convert service_areas from TEXT to TEXT[] (only if needed)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'vendor_profiles'
    AND column_name = 'service_areas'
    AND data_type != 'ARRAY'
  ) THEN
    ALTER TABLE vendor_profiles 
    ALTER COLUMN service_areas TYPE TEXT[] 
    USING CASE 
      WHEN service_areas IS NULL OR service_areas = '' OR service_areas = '[]' THEN NULL
      ELSE ARRAY[service_areas]::TEXT[]
    END;
  END IF;
END
$$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_years_exp ON vendor_profiles(years_experience);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_team_size ON vendor_profiles(team_size);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_specialties ON vendor_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_service_areas ON vendor_profiles USING GIN(service_areas);

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'vendor_profiles'
AND column_name IN ('years_experience', 'team_size', 'specialties', 'service_areas')
ORDER BY column_name;

-- Sample query to test
SELECT 
  user_id,
  business_name,
  business_type,
  years_experience,
  team_size,
  specialties,
  service_areas
FROM vendor_profiles
LIMIT 5;
