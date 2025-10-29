/**
 * Diagnostic Script: Check Booking Dates in Database
 * Purpose: Verify that bookings exist and have proper event_date values
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkBookingDates() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n=== BOOKING DATES DIAGNOSTIC ===\n');
  
  try {
    // Get all bookings with their dates
    const bookings = await sql`
      SELECT 
        id,
        vendor_id,
        service_id,
        event_date,
        status,
        created_at
      FROM bookings
      ORDER BY event_date DESC
      LIMIT 20
    `;
    
    console.log(`Found ${bookings.length} bookings\n`);
    
    if (bookings.length === 0) {
      console.log('❌ NO BOOKINGS FOUND IN DATABASE');
      console.log('   This explains why calendar shows all dates as available');
      return;
    }
    
    // Group by vendor
    const byVendor = {};
    bookings.forEach(booking => {
      const vendorId = booking.vendor_id;
      if (!byVendor[vendorId]) {
        byVendor[vendorId] = [];
      }
      byVendor[vendorId].push(booking);
    });
    
    console.log('📊 Bookings by Vendor:\n');
    for (const [vendorId, vendorBookings] of Object.entries(byVendor)) {
      console.log(`Vendor ID: ${vendorId}`);
      console.log(`  Total bookings: ${vendorBookings.length}`);
      
      vendorBookings.forEach(booking => {
        const eventDate = booking.event_date ? 
          new Date(booking.event_date).toISOString().split('T')[0] : 
          'NO DATE';
        console.log(`    - ${eventDate} | Status: ${booking.status} | ID: ${booking.id}`);
      });
      console.log('');
    }
    
    // Check for bookings on specific test date
    const testDate = '2025-12-25'; // Christmas
    const bookingsOnTestDate = await sql`
      SELECT 
        id,
        vendor_id,
        event_date,
        status
      FROM bookings
      WHERE DATE(event_date) = ${testDate}
    `;
    
    console.log(`\n🎄 Bookings on ${testDate}:`);
    if (bookingsOnTestDate.length === 0) {
      console.log('   No bookings found on this date');
    } else {
      bookingsOnTestDate.forEach(booking => {
        console.log(`   Vendor: ${booking.vendor_id} | Status: ${booking.status}`);
      });
    }
    
    // Check vendor ID formats
    console.log('\n🔍 Vendor ID Formats:');
    const uniqueVendorIds = [...new Set(bookings.map(b => b.vendor_id))];
    uniqueVendorIds.forEach(vendorId => {
      console.log(`   ${vendorId}`);
    });
    
    // Check service ID formats
    console.log('\n🔍 Service ID Formats:');
    const uniqueServiceIds = [...new Set(bookings.map(b => b.service_id).filter(Boolean))];
    uniqueServiceIds.forEach(serviceId => {
      console.log(`   ${serviceId}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBookingDates();
