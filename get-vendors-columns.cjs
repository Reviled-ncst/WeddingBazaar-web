require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => { 
  const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'vendors' ORDER BY ordinal_position`;
  console.log('Vendors table columns:');
  cols.forEach(c => console.log('  -', c.column_name));
})();
