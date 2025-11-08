// Migration script to add package/itemization columns to bookings table
// Run with: node add-package-columns-to-bookings.cjs

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  console.log('🚀 Starting migration: Add package columns to bookings table');
  console.log('📊 Database:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'Unknown');
  
  try {
    // Step 1: Check if columns already exist
    console.log('\n📋 Step 1: Checking existing columns...');
    const existingColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name IN ('package_id', 'package_name', 'package_price', 
                          'package_items', 'selected_addons', 'addon_total', 'subtotal')
    `;
    
    if (existingColumns.length > 0) {
      console.log('⚠️  Some columns already exist:');
      existingColumns.forEach(col => console.log(`   - ${col.column_name}`));
      console.log('\n❌ Migration aborted to prevent duplicates.');
      console.log('💡 If you want to re-run, drop these columns first:');
      console.log('   ALTER TABLE bookings DROP COLUMN IF EXISTS package_id, package_name, ...');
      return;
    }
    
    console.log('✅ No existing package columns found. Safe to proceed.\n');
    
    // Step 2: Add columns
    console.log('📋 Step 2: Adding new columns...');
    
    // Add package_id column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS package_id VARCHAR(255)
    `;
    console.log('   ✅ Added: package_id (VARCHAR)');
    
    // Add package_name column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS package_name VARCHAR(500)
    `;
    console.log('   ✅ Added: package_name (VARCHAR)');
    
    // Add package_price column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS package_price DECIMAL(12, 2)
    `;
    console.log('   ✅ Added: package_price (DECIMAL)');
    
    // Add package_items column (JSONB)
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS package_items JSONB
    `;
    console.log('   ✅ Added: package_items (JSONB)');
    
    // Add selected_addons column (JSONB)
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS selected_addons JSONB
    `;
    console.log('   ✅ Added: selected_addons (JSONB)');
    
    // Add addon_total column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS addon_total DECIMAL(12, 2)
    `;
    console.log('   ✅ Added: addon_total (DECIMAL)');
    
    // Add subtotal column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2)
    `;
    console.log('   ✅ Added: subtotal (DECIMAL)');
    
    // Step 3: Add comments for documentation
    console.log('\n📋 Step 3: Adding column comments...');
    await sql`
      COMMENT ON COLUMN bookings.package_id IS 'Reference ID for the selected service package'
    `;
    await sql`
      COMMENT ON COLUMN bookings.package_name IS 'Name of the selected package'
    `;
    await sql`
      COMMENT ON COLUMN bookings.package_price IS 'Base price of the package (before add-ons)'
    `;
    await sql`
      COMMENT ON COLUMN bookings.package_items IS 'JSONB array of items included in the package'
    `;
    await sql`
      COMMENT ON COLUMN bookings.selected_addons IS 'JSONB array of add-ons selected by the couple'
    `;
    await sql`
      COMMENT ON COLUMN bookings.addon_total IS 'Total cost of all selected add-ons'
    `;
    await sql`
      COMMENT ON COLUMN bookings.subtotal IS 'Subtotal (package price + add-ons) before taxes/fees'
    `;
    console.log('   ✅ Added column comments for documentation');
    
    // Step 4: Verify migration
    console.log('\n📋 Step 4: Verifying migration...');
    const newColumns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name IN ('package_id', 'package_name', 'package_price', 
                          'package_items', 'selected_addons', 'addon_total', 'subtotal')
      ORDER BY column_name
    `;
    
    console.log('\n✅ Migration complete! New columns:');
    console.log('┌─────────────────────┬─────────────┬─────────────┐');
    console.log('│ Column Name         │ Data Type   │ Nullable    │');
    console.log('├─────────────────────┼─────────────┼─────────────┤');
    newColumns.forEach(col => {
      const colName = col.column_name.padEnd(19);
      const dataType = col.data_type.padEnd(11);
      const nullable = col.is_nullable.padEnd(11);
      console.log(`│ ${colName} │ ${dataType} │ ${nullable} │`);
    });
    console.log('└─────────────────────┴─────────────┴─────────────┘');
    
    console.log('\n🎉 SUCCESS! Package itemization columns added to bookings table.');
    console.log('\n📝 Next steps:');
    console.log('   1. Deploy backend changes (routes/bookings.cjs)');
    console.log('   2. Test booking creation with package data');
    console.log('   3. Update frontend to display package breakdowns');
    console.log('   4. Update Smart Wedding Planner to use package prices\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   - Check DATABASE_URL in .env file');
    console.error('   - Ensure you have ALTER TABLE permissions');
    console.error('   - Verify Neon database is accessible');
    console.error('   - Check if columns already exist\n');
    throw error;
  }
}

// Run migration
runMigration()
  .then(() => {
    console.log('✅ Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
