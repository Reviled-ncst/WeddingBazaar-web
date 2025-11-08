const { sql } = require('./backend-deploy/config/database.cjs');

async function checkDocumentTables() {
  try {
    console.log('🔍 Checking document-related tables...');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%document%'
    `;
    
    console.log('📄 Document tables found:', tables);
    
    if (tables.length > 0) {
      for (const table of tables) {
        console.log(`\n📋 Columns in ${table.table_name}:`);
        const columns = await sql`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = ${table.table_name}
          ORDER BY ordinal_position
        `;
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
      }
    }
    
    // Try to query vendor_documents
    console.log('\n📊 Attempting to query vendor_documents...');
    const docs = await sql`SELECT COUNT(*) as count FROM vendor_documents`;
    console.log(`✅ Found ${docs[0].count} documents in vendor_documents table`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit();
  }
}

checkDocumentTables();
