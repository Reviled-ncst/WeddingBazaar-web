/**
 * Check User ID for Booking 1761577140
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkBookingUserId() {
  try {
    const booking = await sql`
      SELECT 
        id,
        couple_id,
        status,
        vendor_completed,
        couple_completed,
        fully_completed
      FROM bookings 
      WHERE id = '1761577140'
    `;

    if (booking.length === 0) {
      console.log('❌ Booking not found!');
      return;
    }

    const b = booking[0];
    console.log('📊 Booking 1761577140:');
    console.log('========================');
    console.log(`ID: ${b.id}`);
    console.log(`Couple ID: ${b.couple_id}`);
    console.log(`Status: ${b.status}`);
    console.log(`Vendor Completed: ${b.vendor_completed}`);
    console.log(`Couple Completed: ${b.couple_completed}`);
    console.log(`Fully Completed: ${b.fully_completed}`);

    console.log('\n\n📝 Now checking if this user exists:');
    const user = await sql`
      SELECT * 
      FROM users 
      WHERE id = ${b.couple_id}
      LIMIT 1
    `;

    if (user.length > 0) {
      console.log('✅ User exists:');
      console.log(`   ID: ${user[0].id}`);
      console.log(`   Email: ${user[0].email}`);
      console.log(`   Name: ${user[0].full_name}`);
      console.log(`   Role: ${user[0].role}`);
    } else {
      console.log('❌ User NOT found!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBookingUserId();
