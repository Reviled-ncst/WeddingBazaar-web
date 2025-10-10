const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorSchema() {
  try {
    console.log('🔍 Checking vendor table schema...\n');
    
    // Get table structure
    const schema = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Vendor table columns:');
    schema.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    console.log('\n🎯 Sample vendor data:');
    const vendors = await sql`SELECT * FROM vendors LIMIT 1`;
    if (vendors.length > 0) {
      console.log('   Sample record keys:', Object.keys(vendors[0]));
      console.log('   Sample record:', vendors[0]);
    } else {
      console.log('   No vendors found in database');
    }
    
  } catch (error) {
    console.error('❌ Schema check error:', error.message);
  }
}

checkVendorSchema();
