/**
 * Database Migration Script - Add Location and Price Range Columns
 * Adds location and price_range columns to the services table
 */

const { sql } = require('../backend-deploy/config/database.cjs');

async function addLocationAndPriceRangeColumns() {
  console.log('🚀 Starting database migration: Add location and price_range columns');
  
  try {
    // Check if columns already exist
    console.log('🔍 Checking existing schema...');
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND column_name IN ('location', 'price_range')
    `;
    
    const hasLocation = existingColumns.some(col => col.column_name === 'location');
    const hasPriceRange = existingColumns.some(col => col.column_name === 'price_range');
    
    console.log(`📊 Current schema status:
    - location column exists: ${hasLocation}
    - price_range column exists: ${hasPriceRange}`);
    
    // Add location column if it doesn't exist
    if (!hasLocation) {
      console.log('➕ Adding location column...');
      await sql`ALTER TABLE services ADD COLUMN location VARCHAR(255)`;
      console.log('✅ Location column added successfully');
    } else {
      console.log('ℹ️ Location column already exists');
    }
    
    // Add price_range column if it doesn't exist
    if (!hasPriceRange) {
      console.log('➕ Adding price_range column...');
      await sql`ALTER TABLE services ADD COLUMN price_range VARCHAR(100)`;
      console.log('✅ Price range column added successfully');
    } else {
      console.log('ℹ️ Price range column already exists');
    }
    
    // Update existing services with default values
    console.log('🔄 Updating existing services with default values...');
    const updateResult = await sql`
      UPDATE services 
      SET 
        location = COALESCE(location, 'Philippines'),
        price_range = COALESCE(price_range, '₱')
      WHERE location IS NULL OR price_range IS NULL
    `;
    console.log(`✅ Updated ${updateResult.count} services with default values`);
    
    // Create indexes for better performance
    if (!hasLocation) {
      console.log('🔗 Creating location index...');
      try {
        await sql`CREATE INDEX idx_services_location ON services(location)`;
        console.log('✅ Location index created');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('ℹ️ Location index already exists');
        } else {
          throw err;
        }
      }
    }
    
    if (!hasPriceRange) {
      console.log('🔗 Creating price_range index...');
      try {
        await sql`CREATE INDEX idx_services_price_range ON services(price_range)`;
        console.log('✅ Price range index created');
      } catch (err) {
        if (err.message.includes('already exists')) {
          console.log('ℹ️ Price range index already exists');
        } else {
          throw err;
        }
      }
    }
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    const finalColumns = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      AND column_name IN ('location', 'price_range')
      ORDER BY column_name
    `;
    
    console.log('📋 Final column status:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
    // Test a sample query
    const sampleService = await sql`
      SELECT id, title, location, price_range 
      FROM services 
      LIMIT 1
    `;
    
    if (sampleService.length > 0) {
      console.log('✅ Sample service data:');
      console.log(JSON.stringify(sampleService[0], null, 2));
    }
    
    console.log('🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  addLocationAndPriceRangeColumns()
    .then(() => {
      console.log('✅ Database migration completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Database migration failed:', error);
      process.exit(1);
    });
}

module.exports = { addLocationAndPriceRangeColumns };
