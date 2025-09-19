// Check if users in database have first_name and last_name data
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function checkUserData() {
  try {
    console.log('👥 Checking if users have first_name/last_name data...');
    
    // Check what's in the booking for couple 1-2025-001
    const response = await fetch(`${API_BASE}/api/bookings/couple/1-2025-001?limit=1`);
    const data = await response.json();
    
    if (data.bookings && data.bookings.length > 0) {
      const booking = data.bookings[0];
      console.log('📋 Booking fields:', Object.keys(booking));
      console.log('📋 Contact related fields:');
      console.log('  - contactEmail:', booking.contactEmail);
      console.log('  - contactPhone:', booking.contactPhone);
      console.log('  - contactPerson:', booking.contactPerson);
      console.log('  - coupleId:', booking.coupleId);
      
      // Check if there's already a contactPerson name in the booking
      if (booking.contactPerson) {
        console.log('✅ Found contactPerson in booking:', booking.contactPerson);
      } else {
        console.log('❌ No contactPerson in booking data');
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUserData();
