const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

sql`SELECT id, user_id, business_name FROM vendors WHERE user_id = '2-2025-003' ORDER BY created_at`
  .then(r => {
    console.log(`\nVendors for user 2-2025-003: (${r.length} found)`);
    r.forEach((v, i) => {
      console.log(`${i+1}. id="${v.id}", user_id="${v.user_id}", name="${v.business_name}"`);
      if (v.id === v.user_id) {
        console.log(`   ✅ NEW FORMAT (id matches user_id)`);
      } else {
        console.log(`   ⚠️  OLD FORMAT (VEN-XXXXX)`);
      }
    });
  })
  .catch(e => console.error(e));
