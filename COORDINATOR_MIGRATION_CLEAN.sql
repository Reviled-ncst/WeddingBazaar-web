-- Coordinator Registration Fields Migration
-- Add team_size column
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS team_size VARCHAR(50);

-- Add specialties column (array type)
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Check current service_areas type
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name = 'service_areas';

-- Convert service_areas from TEXT to TEXT[] (only if it's currently TEXT)
ALTER TABLE vendors 
ALTER COLUMN service_areas TYPE TEXT[] 
USING CASE 
  WHEN service_areas IS NULL OR service_areas = '' THEN NULL
  ELSE ARRAY[service_areas]
END;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vendors_team_size ON vendors(team_size);
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
