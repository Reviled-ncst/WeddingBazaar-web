const { sql } = require('./backend-deploy/config/database.cjs');

async function checkReviewsSchema() {
  try {
    console.log('🔍 Checking reviews table schema...');
    
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'reviews' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Reviews table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    console.log('\n✅ Schema check complete');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
    process.exit(1);
  }
}

checkReviewsSchema();
