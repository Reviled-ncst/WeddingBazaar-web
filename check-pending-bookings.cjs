const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkPendingBookings() {
  try {
    console.log('Checking for bookings with invalid status...\n');
    
    // Check all bookings
    const allBookings = await sql`
      SELECT id, status, couple_name, created_at
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('Recent bookings:');
    console.log(JSON.stringify(allBookings, null, 2));
    
    // Try to check if there are any 'pending' status bookings
    console.log('\n\nChecking for pending status bookings:');
    const pendingBookings = await sql`
      SELECT id, status, couple_name
      FROM bookings
      WHERE status = 'pending'
    `;
    console.log(JSON.stringify(pendingBookings, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Full error:', error);
  }
}

checkPendingBookings();
