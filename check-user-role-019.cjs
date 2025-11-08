require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  const user = await sql`
    SELECT id, email, role, user_type 
    FROM users 
    WHERE id = '2-2025-019'
  `;
  console.log('User data:', JSON.stringify(user, null, 2));
  
  const vendor = await sql`
    SELECT id, user_id, business_name
    FROM vendors
    WHERE user_id = '2-2025-019'
  `;
  console.log('\nVendor data:', JSON.stringify(vendor, null, 2));
  
  process.exit(0);
})();
