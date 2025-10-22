const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  console.log('📋 Checking receipts table schema...\n');
  
  const columns = await sql`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'receipts' 
    ORDER BY ordinal_position
  `;
  
  console.log('Receipts table columns:');
  columns.forEach(col => {
    console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
  });
  
  console.log('\n✅ Schema check complete');
}

checkSchema().catch(console.error);
