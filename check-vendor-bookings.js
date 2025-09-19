// Check vendor bookings in production database
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function checkVendorBookings() {
  try {
    console.log('🔍 Checking vendor bookings...');
    
    // First, let's see if the vendor endpoint exists
    console.log('\n1. Testing vendor bookings endpoint:');
    try {
      const response = await fetch(`${API_BASE}/api/vendors/1/bookings?limit=1`);
      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Vendor bookings API works:', data);
      } else {
        const errorText = await response.text();
        console.log('❌ Vendor bookings API error:', response.status, errorText);
      }
    } catch (error) {
      console.log('❌ Vendor bookings API failed:', error.message);
    }
    
    // Check if we can get bookings from the couple endpoint (that we know works)
    console.log('\n2. Checking couple bookings for comparison:');
    try {
      const response = await fetch(`${API_BASE}/api/bookings/couple/1-2025-001?limit=1`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Couple bookings work:', data);
        
        if (data.bookings && data.bookings.length > 0) {
          const booking = data.bookings[0];
          console.log('\n📊 Booking details:');
          console.log('- Booking ID:', booking.id);
          console.log('- Couple ID:', booking.coupleId);
          console.log('- Vendor ID:', booking.vendorId);
          console.log('- Vendor Name:', booking.vendorName);
          console.log('- Service Type:', booking.serviceType);
          
          // Now try to get this specific vendor's bookings
          console.log(`\n3. Testing vendor ${booking.vendorId} bookings:`);
          const vendorResponse = await fetch(`${API_BASE}/api/vendors/${booking.vendorId}/bookings?limit=1`);
          console.log('Vendor API Status:', vendorResponse.status);
          
          if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json();
            console.log('✅ Vendor bookings for vendor', booking.vendorId, ':', vendorData);
          } else {
            const vendorError = await vendorResponse.text();
            console.log('❌ Vendor bookings error for vendor', booking.vendorId, ':', vendorError);
          }
        }
      }
    } catch (error) {
      console.log('❌ Couple bookings failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVendorBookings();
