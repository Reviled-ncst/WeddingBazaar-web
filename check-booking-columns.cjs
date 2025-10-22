const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkBookingColumns() {
  const booking = await sql`SELECT * FROM bookings WHERE id = '1761031420'`;
  
  console.log('📋 Booking columns:', Object.keys(booking[0]).join(', '));
  console.log('\n📊 Booking values:');
  console.log(JSON.stringify(booking[0], null, 2));
}

checkBookingColumns().catch(console.error);
