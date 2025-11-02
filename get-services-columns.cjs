require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => { 
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services' ORDER BY ordinal_position`;
  console.log('Services table columns:');
  cols.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));
})();
