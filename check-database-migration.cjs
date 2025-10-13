// Database Migration Verification Script
const { sql } = require('./backend-deploy/config/database.cjs');

async function checkDatabaseSchema() {
    console.log('🔍 Checking database schema for services table...');
    
    try {
        // Check if location and price_range columns exist
        const columns = await sql`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'services' AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        
        console.log('📊 Current services table schema:');
        columns.forEach(col => {
            console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
        });
        
        // Check if we have the new columns
        const hasLocation = columns.some(col => col.column_name === 'location');
        const hasPriceRange = columns.some(col => col.column_name === 'price_range');
        
        console.log('\n✅ Migration Status:');
        console.log(`  - location column: ${hasLocation ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`  - price_range column: ${hasPriceRange ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (!hasLocation || !hasPriceRange) {
            console.log('\n🚨 Migration needed! Running migration...');
            
            // Add missing columns
            if (!hasLocation) {
                await sql`ALTER TABLE services ADD COLUMN location TEXT DEFAULT 'Philippines'`;
                console.log('✅ Added location column');
            }
            
            if (!hasPriceRange) {
                await sql`ALTER TABLE services ADD COLUMN price_range TEXT DEFAULT '₱'`;
                console.log('✅ Added price_range column');
            }
            
            // Create indexes
            if (!hasLocation) {
                await sql`CREATE INDEX IF NOT EXISTS idx_services_location ON services(location)`;
                console.log('✅ Created location index');
            }
            
            console.log('🎉 Migration completed successfully!');
        } else {
            console.log('🎉 All required columns exist!');
        }
        
        // Test a sample query
        const sampleService = await sql`
            SELECT id, title, category, location, price_range, images 
            FROM services 
            LIMIT 1
        `;
        
        if (sampleService.length > 0) {
            console.log('\n📋 Sample service data:');
            console.log(JSON.stringify(sampleService[0], null, 2));
        } else {
            console.log('\n📋 No services in database yet');
        }
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
    }
    
    process.exit(0);
}

// Run the check
checkDatabaseSchema();
