==========================================================
EXECUTE THIS IN NEON SQL CONSOLE
Coordinator Registration Fields Migration
Date: October 31, 2025
==========================================================

-- Step 1: Add team_size column
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS team_size VARCHAR(50);

-- Step 2: Add specialties column (array type)
ALTER TABLE vendors 
ADD COLUMN IF NOT EXISTS specialties TEXT[];

-- Step 3: Convert service_areas from TEXT to TEXT[] (if needed)
-- First check the current type:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
AND column_name = 'service_areas';

-- If it shows 'text', run this:
ALTER TABLE vendors 
ALTER COLUMN service_areas TYPE TEXT[] 
USING CASE 
  WHEN service_areas IS NULL OR service_areas = '' THEN NULL
  ELSE ARRAY[service_areas]
END;

-- Step 4: Create indexes for array fields (improves query performance)
CREATE INDEX IF NOT EXISTS idx_vendors_team_size ON vendors(team_size);
CREATE INDEX IF NOT EXISTS idx_vendors_specialties ON vendors USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_vendors_service_areas ON vendors USING GIN(service_areas);

-- Step 5: Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'vendors'
AND column_name IN ('years_experience', 'team_size', 'specialties', 'service_areas')
ORDER BY column_name;

==========================================================
EXPECTED RESULT:
---------------------------------------------------------
column_name       | data_type | is_nullable
---------------------------------------------------------
service_areas     | ARRAY     | YES
specialties       | ARRAY     | YES
team_size         | character varying | YES
years_experience  | integer   | YES
==========================================================

-- To test with sample data:
UPDATE vendors 
SET 
  team_size = '2-5',
  specialties = ARRAY['Cultural Weddings', 'Garden Weddings'],
  service_areas = ARRAY['Metro Manila', 'Luzon']
WHERE id = '2-2025-001';

-- Verify the test data:
SELECT 
  id, 
  business_name,
  years_experience,
  team_size,
  specialties,
  service_areas
FROM vendors 
WHERE id = '2-2025-001';

==========================================================
