require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const cats = await sql`SELECT id, name, display_name FROM service_categories WHERE is_active = true ORDER BY sort_order`;
  cats.forEach(c => console.log(`${c.name} | ${c.display_name}`));
})();
