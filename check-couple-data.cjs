const { neon } = require('@neondatabase/serverless');
const sql = neon('postgresql://neondb_owner:wO11Eg0XmYHa@ep-dry-butterfly-a5e5d51g.us-east-2.aws.neon.tech/neondb?sslmode=require');

async function checkCoupleBookings() {
  try {
    console.log('🔍 Checking couple bookings in comprehensive_bookings...');

    // Get unique couple IDs
    const couples = await sql`
      SELECT DISTINCT couple_id, COUNT(*) as booking_count
      FROM comprehensive_bookings 
      GROUP BY couple_id 
      ORDER BY booking_count DESC
      LIMIT 10
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
        SELECT id, couple_id, vendor_id, service_type, status, event_date, 
               amount, created_at, vendor_name, couple_name
        WHERE couple_id = ${topCoupleId}
        LIMIT 3
      `;
      
      sampleBookings.forEach(booking => {
        console.log(`   📄 Booking ${booking.id}: ${booking.service_type} - ${booking.status}`);
        console.log(`      Vendor: ${booking.vendor_name}`);
        console.log(`      Couple: ${booking.couple_name}`);
        console.log(`      Amount: ₱${booking.amount}`);
      });
    }

    // Test the API endpoint directly
    console.log(`\n🌐 Testing API endpoint for couple ${couples[0]?.couple_id}...`);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkCoupleBookings();
