require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => { 
  const vendors = await sql`SELECT id FROM vendors LIMIT 1`; 
  console.log(vendors[0].id); 
})();
