const { sql } = require('./backend-deploy/config/database.cjs');

async function checkTableSchema() {
  console.log('🔍 Checking vendor_documents table schema...');
  
  try {
    const schema = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'vendor_documents'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 vendor_documents table columns:');
    schema.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type} (${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  }
  
  process.exit(0);
}

checkTableSchema();
