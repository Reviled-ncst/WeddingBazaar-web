-- Add tier column to service_packages table
-- This allows packages to have their own service tier (basic, standard, premium)

ALTER TABLE service_packages 
ADD COLUMN IF NOT EXISTS tier VARCHAR(20) CHECK (tier IN ('basic', 'standard', 'premium'));

-- Add index for filtering by tier
CREATE INDEX IF NOT EXISTS idx_service_packages_tier ON service_packages(tier);

-- Add comment
COMMENT ON COLUMN service_packages.tier IS 'Service tier for this package (basic, standard, premium)';

-- Verify the change
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'service_packages' 
ORDER BY ordinal_position;
