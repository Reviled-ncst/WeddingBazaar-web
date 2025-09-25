const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkCoupleBookings() {
  try {
    console.log('🔍 Checking couple bookings in comprehensive_bookings...');
    
    // Get unique couple IDs
    const couples = await sql`
      SELECT DISTINCT couple_id, COUNT(*) as booking_count
      FROM comprehensive_bookings 
      GROUP BY couple_id 
      ORDER BY booking_count DESC
    `;
    
    console.log('Couples with bookings:');
    couples.forEach(couple => {
      console.log(`  - ${couple.couple_id}: ${couple.booking_count} bookings`);
    });
    
    // Check the first couple's bookings
    if (couples.length > 0) {
      const topCoupleId = couples[0].couple_id;
      console.log(`\n📋 Sample bookings for couple ${topCoupleId}:`);
      
      const sampleBookings = await sql`
        SELECT id, vendor_id, service_type, status, event_date
        FROM comprehensive_bookings 
        WHERE couple_id = ${topCoupleId}
        LIMIT 3
      `;
      
      console.table(sampleBookings);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCoupleBookings();
