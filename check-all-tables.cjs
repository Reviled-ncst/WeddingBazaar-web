const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAllTables() {
  try {
    console.log('🔍 CHECKING ALL TABLES...');
    
    // Get all tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log(`📋 Found ${tables.length} tables:`);
    for (const table of tables) {
      console.log(`  - ${table.table_name}`);
      
      try {
        // Get count for each table
        const countQuery = `SELECT COUNT(*) as count FROM "${table.table_name}"`;
        const count = await sql.query(countQuery);
        console.log(`    Records: ${count[0]?.count || 0}`);
      } catch (err) {
        console.log(`    Error: ${err.message}`);
      }
    }
    
    // Specifically check if there might be a different vendors table
    console.log('\n🔍 LOOKING FOR VENDOR DATA...');
    
    // Check if there are any tables with "vendor" in the name
    const vendorTables = tables.filter(t => 
      t.table_name.toLowerCase().includes('vendor') || 
      t.table_name.toLowerCase().includes('business') ||
      t.table_name.toLowerCase().includes('service')
    );
    
    if (vendorTables.length > 0) {
      console.log('🏪 Found vendor-related tables:');
      vendorTables.forEach(t => console.log(`  - ${t.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAllTables();
