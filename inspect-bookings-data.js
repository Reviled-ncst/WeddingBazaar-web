// Test the correct API endpoint and show all available fields
const apiUrl = 'https://weddingbazaar-web.onrender.com';

async function inspectBookingsData() {
  console.log('🔍 Inspecting detailed bookings data...');
  
  try {
    const response = await fetch(`${apiUrl}/api/bookings?coupleId=1-2025-001`);
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response structure:', {
      hasSuccess: !!data.success,
      hasData: !!data.data,
      dataType: typeof data.data,
      bookingsCount: data.data?.bookings?.length || 0
    });
    
    if (data.data?.bookings && data.data.bookings.length > 0) {
      const booking = data.data.bookings[0];
      console.log('\n📋 First booking all fields:');
      Object.keys(booking).forEach(key => {
        console.log(`  ${key}: ${booking[key]}`);
      });
      
      // Show a few more bookings to see if they have different data
      console.log(`\n📋 Showing first 3 bookings summary:`);
      data.data.bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`\nBooking ${index + 1}:`);
        console.log(`  ID: ${booking.id}`);
        console.log(`  Status: ${booking.status}`);
        console.log(`  Service: ${booking.service_name || booking.service_type || 'Unknown'}`);
        console.log(`  Vendor: ${booking.vendor_name || 'Unknown'}`);
        console.log(`  Quoted Price: ${booking.quoted_price || 'NULL'}`);
        console.log(`  Final Price: ${booking.final_price || 'NULL'}`);
        console.log(`  Total Amount: ${booking.total_amount || 'NULL'}`);
      });
    } else {
      console.log('⚠️ No bookings found in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

inspectBookingsData();
