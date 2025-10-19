require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

async function checkTableStructure() {
  const result = await sql`
    SELECT column_name, data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'service_subcategories'
    ORDER BY ordinal_position;
  `;
  console.log('Table structure:');
  result.forEach(col => {
    console.log(`  ${col.column_name}: ${col.data_type} (default: ${col.column_default}, nullable: ${col.is_nullable})`);
  });
}

checkTableStructure();
