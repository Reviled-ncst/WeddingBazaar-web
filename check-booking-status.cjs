const { db } = require('./backend/database/connection');

async function checkStatuses() {
  try {
    const result = await db.executeQuery`SELECT DISTINCT status FROM comprehensive_bookings LIMIT 10`;
    console.log('Existing status values:', result.map(r => r.status));
    
    // Also check what booking 55 looks like
    const booking55 = await db.executeQuery`SELECT * FROM comprehensive_bookings WHERE id = '55'`;
    console.log('Booking 55:', booking55[0]);
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkStatuses();
