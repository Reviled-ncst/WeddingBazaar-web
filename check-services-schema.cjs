/**
 * Check Services Table Schema
 */
const { sql } = require('./backend-deploy/config/database.cjs');

async function checkServicesSchema() {
  console.log('🔍 CHECKING SERVICES TABLE SCHEMA');
  console.log('=================================');
  
  try {
    const result = await sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Services table columns:');
    result.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    console.log(`\n✅ Total columns: ${result.length}`);
    
    // Check if specific columns exist
    const columnNames = result.map(col => col.column_name);
    const checkColumns = ['features', 'contact_info', 'tags', 'keywords', 'max_price'];
    
    console.log('\n🔍 Checking for specific columns:');
    checkColumns.forEach(colName => {
      const exists = columnNames.includes(colName);
      console.log(`   ${exists ? '✅' : '❌'} ${colName}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkServicesSchema();
