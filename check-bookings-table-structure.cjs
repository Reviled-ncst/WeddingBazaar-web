const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkBookingsTableStructure() {
  try {
    console.log('🔍 Checking bookings table structure...\n');
    
    // Check table structure
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position;
    `;
    
    console.log('📊 Bookings table structure:');
    console.table(tableInfo);
    
    // Get a sample booking to see the actual data
    console.log('\n📋 Sample booking data:');
    const sampleBooking = await sql`
      SELECT * FROM bookings LIMIT 1
    `;
    
    if (sampleBooking.length > 0) {
      console.log('Sample booking:', JSON.stringify(sampleBooking[0], null, 2));
    }
    
    // Check total count
    console.log('\n📊 Total bookings count:');
    const count = await sql`SELECT COUNT(*) as total FROM bookings`;
    console.log('Total bookings:', count[0].total);
    
    // Check bookings for specific vendor
    console.log('\n🔍 Bookings for vendor 2-2025-003:');
    const vendorBookings = await sql`
      SELECT id, vendor_id, couple_id, service_type, status, event_date 
      FROM bookings 
      WHERE vendor_id = '2-2025-003' 
      LIMIT 5
    `;
    console.table(vendorBookings);

  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Full error:', error);
  }
}

checkBookingsTableStructure();
