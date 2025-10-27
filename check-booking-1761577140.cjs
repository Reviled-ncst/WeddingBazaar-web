/**
 * Check specific booking 1761577140 status
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkBooking() {
  try {
    const booking = await sql`
      SELECT 
        id,
        status,
        vendor_completed,
        couple_completed,
        fully_completed,
        vendor_completed_at,
        couple_completed_at,
        fully_completed_at,
        updated_at
      FROM bookings
      WHERE id = '1761577140'
    `;

    if (booking.length === 0) {
      console.log('❌ Booking not found');
      return;
    }

    console.log('📊 Booking 1761577140 Current State:\n');
    console.log(JSON.stringify(booking[0], null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkBooking();
