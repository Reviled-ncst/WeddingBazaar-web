/**
 * Add location and price_range columns to production database
 * Run this script to add the missing columns
 */

// Direct SQL commands to run on your Neon database
const migrationSQL = `
-- Add location column
ALTER TABLE services ADD COLUMN IF NOT EXISTS location VARCHAR(255);

-- Add price_range column  
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_range VARCHAR(100);

-- Update existing services with default values
UPDATE services 
SET 
  location = COALESCE(location, 'Philippines'),
  price_range = COALESCE(price_range, '₱')
WHERE location IS NULL OR price_range IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_services_location ON services(location);
CREATE INDEX IF NOT EXISTS idx_services_price_range ON services(price_range);
`;

console.log('📋 SQL Migration Commands to run on Neon Database:');
console.log('='.repeat(60));
console.log(migrationSQL);
console.log('='.repeat(60));
console.log('');
console.log('🚀 Steps to apply:');
console.log('1. Go to your Neon Database Console');
console.log('2. Open the SQL Editor');
console.log('3. Copy and paste the SQL commands above');
console.log('4. Execute the commands');
console.log('5. Verify the columns were added successfully');
console.log('');
console.log('✅ After adding columns, the backend will work with location and price_range!');
