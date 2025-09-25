const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorsTable() {
  try {
    console.log('🔍 Checking vendors table structure...\n');
    
    // Check table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 Vendors table structure:');
    console.table(tableInfo);
    
    // Check a few vendors
    console.log('\n🏪 Sample vendors:');
    const sampleVendors = await sql`
      SELECT * FROM vendors LIMIT 3
    `;
    
    console.table(sampleVendors);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkVendorsTable();
