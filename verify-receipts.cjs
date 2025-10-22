const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verify() {
  const receipts = await sql`
    SELECT 
      r.*,
      b.couple_name,
      b.service_type,
      b.status as booking_status
    FROM receipts r
    LEFT JOIN bookings b ON r.booking_id = b.id::text
    ORDER BY r.created_at DESC
  `;

  console.log(JSON.stringify(receipts, null, 2));
  process.exit(0);
}

verify().catch(console.error);
