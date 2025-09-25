const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function checkBookingsForQuoteTest() {
  const client = new Pool({ connectionString });

  try {
    console.log('🔍 Checking bookings for Send Quote modal testing...\n');

    // Get total bookings count
    const countResult = await client.query('SELECT COUNT(*) as total FROM bookings');
    const totalBookings = countResult.rows[0].total;
    console.log(`📊 Total bookings in database: ${totalBookings}`);

    if (totalBookings > 0) {
      // Get some sample bookings for testing
      const sampleBookings = await client.query(`
        SELECT 
          id, vendor_id, couple_name, service_type, 
          event_date, status, total_amount,
          created_at
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      console.log('\n📋 Sample bookings for quote testing:');
      sampleBookings.rows.forEach((booking, index) => {
        console.log(`${index + 1}. ID: ${booking.id}`);
        console.log(`   Vendor: ${booking.vendor_id}`);
        console.log(`   Couple: ${booking.couple_name}`);
        console.log(`   Service: ${booking.service_type}`);
        console.log(`   Event Date: ${booking.event_date}`);
        console.log(`   Status: ${booking.status}`);
        console.log(`   Amount: ₱${booking.total_amount}`);
        console.log('   ---');
      });

      // Check vendor bookings specifically for vendor_001
      const vendorBookings = await client.query(`
        SELECT COUNT(*) as vendor_count 
        FROM bookings 
        WHERE vendor_id = 'vendor_001'
      `);
      
      console.log(`\n🏪 Bookings for vendor_001: ${vendorBookings.rows[0].vendor_count}`);
      console.log('\n✅ Ready to test Send Quote modal!');
      console.log('📍 Navigate to: http://localhost:5175/vendor/bookings');
      console.log('📝 Look for "Send Quote" buttons on booking cards');

    } else {
      console.log('\n⚠️  No bookings found in database!');
      console.log('Please create some test bookings first.');
    }

  } catch (error) {
    console.error('❌ Error checking bookings:', error.message);
  } finally {
    await client.end();
  }
}

checkBookingsForQuoteTest();
