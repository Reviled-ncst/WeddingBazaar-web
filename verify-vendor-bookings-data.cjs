const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorBookingsData() {
  try {
    console.log('🔍 Checking vendor bookings data in database...\n');
    
    // Check all vendors that have bookings
    console.log('📊 Vendors with bookings:');
    const vendorsWithBookings = await sql`
      SELECT 
        vendor_id,
        vendor_name,
        COUNT(*) as booking_count,
        MIN(created_at) as first_booking,
        MAX(created_at) as latest_booking
      FROM bookings 
      WHERE vendor_id IS NOT NULL
      GROUP BY vendor_id, vendor_name
      ORDER BY booking_count DESC
    `;
    
    console.table(vendorsWithBookings);
    
    // Check sample bookings for the vendor with most bookings
    if (vendorsWithBookings.length > 0) {
      const topVendor = vendorsWithBookings[0];
      console.log(`\n📋 Sample bookings for ${topVendor.vendor_name} (${topVendor.vendor_id}):`);
      
      const sampleBookings = await sql`
        SELECT 
          id,
          vendor_id,
          vendor_name,
          service_type,
          status,
          amount,
          down_payment,
          event_date,
          created_at
        FROM bookings 
        WHERE vendor_id = ${topVendor.vendor_id}
        ORDER BY created_at DESC
        LIMIT 5
      `;
      
      console.table(sampleBookings);
    }
    
    // Check booking statuses
    console.log('\n📈 Booking status distribution:');
    const statusDistribution = await sql`
      SELECT 
        status,
        COUNT(*) as count
      FROM bookings 
      GROUP BY status
      ORDER BY count DESC
    `;
    
    console.table(statusDistribution);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

checkVendorBookingsData();
