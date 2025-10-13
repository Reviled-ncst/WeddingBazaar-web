-- Fix images column type from text[] to jsonb
-- This allows us to store JSON arrays properly

-- First, let's check current column type
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services' AND column_name = 'images';

-- Change images column from text[] to jsonb
ALTER TABLE services ALTER COLUMN images TYPE jsonb USING images::jsonb;

-- If the above fails, we might need to do it in steps:
-- Step 1: Add a new jsonb column
-- ALTER TABLE services ADD COLUMN images_new jsonb;

-- Step 2: Migrate existing data
-- UPDATE services SET images_new = images::jsonb WHERE images IS NOT NULL;

-- Step 3: Drop old column and rename new one
-- ALTER TABLE services DROP COLUMN images;
-- ALTER TABLE services RENAME COLUMN images_new TO images;
