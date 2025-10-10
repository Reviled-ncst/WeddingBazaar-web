// Check vendors table schema
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorsTable() {
  try {
    console.log('🔍 Checking vendors table schema...');
    
    // Check if vendors table exists and its columns
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vendors' 
      ORDER BY ordinal_position
    `;
    
    if (tableInfo.length === 0) {
      console.log('❌ Vendors table does not exist');
      return;
    }
    
    console.log('\n📋 Vendors table columns:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Check if there are any vendors
    const vendorCount = await sql`SELECT COUNT(*) as count FROM vendors`;
    console.log(`\n👥 Total vendors in database: ${vendorCount[0].count}`);
    
    // Try to get first few vendors to see the actual data structure
    const sampleVendors = await sql`SELECT * FROM vendors LIMIT 3`;
    console.log('\n📋 Sample vendors:');
    sampleVendors.forEach((vendor, i) => {
      console.log(`  Vendor ${i + 1}:`, Object.keys(vendor));
    });
    
  } catch (error) {
    console.error('❌ Vendors table check failed:', error.message);
  }
}

checkVendorsTable().then(() => process.exit(0));
