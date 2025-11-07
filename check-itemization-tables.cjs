const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkTables() {
  try {
    console.log('🔍 Checking for itemization tables...\n');
    
    // Check if tables exist
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('service_packages', 'package_items', 'service_addons', 'service_pricing_rules')
      ORDER BY table_name
    `;
    
    console.log(`📊 Tables found: ${tables.length}`);
    
    if (tables.length === 0) {
      console.log('\n❌ NO ITEMIZATION TABLES FOUND!');
      console.log('This is the ROOT CAUSE - packages cannot be saved without these tables.\n');
      console.log('✅ SOLUTION: Create the missing tables using the SQL schema.\n');
      return;
    }
    
    tables.forEach(t => console.log('  ✓', t.table_name));
    
    console.log('\n🔍 Checking schemas...\n');
    
    // Get schema for each table
    for (const table of tables) {
      const columns = await sql`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = ${table.table_name}
        ORDER BY ordinal_position
      `;
      
      console.log(`\n📋 Table: ${table.table_name}`);
      console.log(`Columns: ${columns.length}`);
      columns.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
      });
    }
    
    console.log('\n✅ Schema check complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
