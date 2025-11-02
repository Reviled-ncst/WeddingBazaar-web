const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function checkVendorsSchema() {
  const cols = await sql`
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'vendors'
    ORDER BY ordinal_position
  `;
  console.log('\nVENDORS TABLE COLUMNS:');
  cols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  
  const sample = await sql`SELECT * FROM vendors LIMIT 1`;
  console.log('\nSAMPLE ROW KEYS:');
  if (sample.length > 0) {
    Object.keys(sample[0]).forEach(k => console.log(`  ${k}`));
  }
}

checkVendorsSchema();
