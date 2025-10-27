const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkCompletion() {
  const result = await sql`
    SELECT 
      id,
      status,
      vendor_completed,
      vendor_completed_at,
      couple_completed,
      couple_completed_at
    FROM bookings 
    WHERE id = 1761577140
  `;
  
  console.log('🎉 COMPLETION SYSTEM STATUS:');
  console.log(JSON.stringify(result[0], null, 2));
}

checkCompletion();
