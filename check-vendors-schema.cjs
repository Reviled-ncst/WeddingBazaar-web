const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorsSchema() {
  console.log('🔍 Checking vendors table schema...\n');
  
  try {
    // Check what columns exist in the vendors table
    const schemaResult = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Vendors table columns:');
    schemaResult.forEach(column => {
      console.log(`  - ${column.column_name}: ${column.data_type} (${column.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Also get a sample vendor record to see the actual structure
    const sampleVendors = await sql`
      SELECT * FROM vendors LIMIT 3
    `;
    
    console.log('\n📋 Sample vendor records:');
    sampleVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${JSON.stringify(vendor, null, 2)}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkVendorsSchema().catch(console.error);
