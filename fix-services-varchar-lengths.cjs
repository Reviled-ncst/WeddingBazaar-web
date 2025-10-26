/**
 * Fix VARCHAR(20) length constraints in services table
 * 
 * This migration script updates the services table to support:
 * - vendor_id: VARCHAR(50) instead of VARCHAR(20) - supports "2-2025-XXX" format
 * - location: TEXT instead of VARCHAR(20) - allows full addresses
 * - availability: TEXT instead of VARCHAR(20) - allows JSON availability data
 * 
 * Run this script to fix the database schema before creating services.
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function fixServicesSchema() {
  console.log('🔧 Starting services table schema fix...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Alter vendor_id column to support longer IDs
    console.log('📝 Step 1: Updating vendor_id column...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN vendor_id TYPE VARCHAR(50)
    `;
    console.log('✅ vendor_id column updated to VARCHAR(50)\n');

    // 2. Alter location column to TEXT for full addresses
    console.log('📝 Step 2: Updating location column...');
    await sql`
      ALTER TABLE services 
      ALTER COLUMN location TYPE TEXT
    `;
    console.log('✅ location column updated to TEXT\n');

    // 3. Alter availability column to TEXT for JSON data
    console.log('📝 Step 3: Updating availability column...');
    
    // First, check if there's a GIN index on availability
    const indexCheck = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'services'
      AND indexdef LIKE '%availability%'
    `;
    
    if (indexCheck.length > 0) {
      console.log('🔍 Found indexes on availability column:');
      console.table(indexCheck);
      
      // Drop each index using raw SQL query
      for (const idx of indexCheck) {
        const indexName = idx.indexname;
        console.log(`  Dropping index: ${indexName}`);
        await sql.query(`DROP INDEX IF EXISTS ${indexName}`);
      }
      console.log('✅ Indexes dropped\n');
    }
    
    // Now alter the column type
    await sql`
      ALTER TABLE services 
      ALTER COLUMN availability TYPE TEXT
    `;
    console.log('✅ availability column updated to TEXT\n');

    // 4. Verify the changes
    console.log('🔍 Step 4: Verifying schema changes...');
    const schemaCheck = await sql`
      SELECT 
        column_name,
        data_type,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'services'
      AND column_name IN ('vendor_id', 'location', 'availability')
      ORDER BY column_name
    `;

    console.log('\n📊 Updated schema:');
    console.table(schemaCheck);

    // 5. Check foreign key constraints
    console.log('\n🔍 Step 5: Checking foreign key constraints...');
    const fkCheck = await sql`
      SELECT
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'services'
      AND kcu.column_name = 'vendor_id'
    `;

    if (fkCheck.length > 0) {
      console.log('\n📋 Foreign key constraints on vendor_id:');
      console.table(fkCheck);
    } else {
      console.log('\n⚠️  No foreign key constraints found on vendor_id');
      console.log('   This might be expected if the FK was removed or never created.');
    }

    console.log('\n✨ Schema fix completed successfully!');
    console.log('\n📝 Summary:');
    console.log('  ✅ vendor_id: VARCHAR(20) → VARCHAR(50)');
    console.log('  ✅ location: VARCHAR(20) → TEXT');
    console.log('  ✅ availability: VARCHAR(20) → TEXT');
    console.log('\n🎯 You can now create services with:');
    console.log('  - Vendor IDs in "2-2025-XXX" format');
    console.log('  - Full address locations');
    console.log('  - Complex JSON availability data\n');

  } catch (error) {
    console.error('\n❌ Error fixing schema:', error);
    console.error('\nError details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

// Run the migration
fixServicesSchema()
  .then(() => {
    console.log('✅ Migration completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
