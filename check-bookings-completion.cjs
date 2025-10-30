const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkBookingsTable() {
  try {
    console.log('📊 Checking bookings table...\n');
    
    // Get first few bookings to see ID format
    const bookings = await sql`
      SELECT 
        id,
        booking_reference,
        status,
        vendor_completed,
        couple_completed,
        fully_completed,
        vendor_completed_at,
        couple_completed_at,
        fully_completed_at
      FROM bookings
      WHERE status = 'completed' OR vendor_completed = TRUE OR couple_completed = TRUE
      ORDER BY updated_at DESC
      LIMIT 10
    `;
    
    console.log(`Found ${bookings.length} bookings with completion data:\n`);
    
    bookings.forEach((b, i) => {
      console.log(`${i + 1}. Booking ID: ${b.id} (${typeof b.id})`);
      console.log(`   Reference: ${b.booking_reference}`);
      console.log(`   Status: ${b.status}`);
      console.log(`   Vendor Complete: ${b.vendor_completed ? 'YES' : 'NO'}${b.vendor_completed_at ? ` (${b.vendor_completed_at})` : ''}`);
      console.log(`   Couple Complete: ${b.couple_completed ? 'YES' : 'NO'}${b.couple_completed_at ? ` (${b.couple_completed_at})` : ''}`);
      console.log(`   Fully Complete: ${b.fully_completed ? 'YES' : 'NO'}${b.fully_completed_at ? ` (${b.fully_completed_at})` : ''}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkBookingsTable();
