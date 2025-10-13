// CREATE TEST BOOKING FOR VENDOR 2-2025-003
console.log('🎯 CREATING TEST BOOKING FOR VENDOR 2-2025-003');
console.log('==============================================');

const testBooking = {
  vendor_id: '2-2025-003',
  user_id: '1-2025-001', // Customer ID
  service_id: 'SRV-1758769064490', // From your database image
  service_name: 'DJ Service',
  booking_date: '2025-11-15',
  status: 'pending',
  total_amount: 15000,
  message: 'Need DJ service for wedding reception',
  guest_count: 150,
  event_location: 'Garden Resort, Tagaytay',
  contact_email: 'customer@email.com',
  contact_phone: '+63 917 123 4567'
};

console.log('📋 Test Booking Data:');
console.log(JSON.stringify(testBooking, null, 2));

// Create the booking via API
async function createTestBooking() {
  try {
    console.log('\n📡 Sending booking request to API...');
    
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testBooking)
    });
    
    const result = await response.json();
    
    console.log(`✅ Response Status: ${response.status}`);
    console.log('📊 Response Data:', JSON.stringify(result, null, 2));
    
    if (response.ok && result.success) {
      console.log('🎉 SUCCESS: Test booking created!');
      console.log(`📋 Booking ID: ${result.booking?.id || 'Not provided'}`);
      
      // Now test the vendor endpoint
      console.log('\n🧪 Testing vendor endpoint after creating booking...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const vendorResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-003');
      const vendorData = await vendorResponse.json();
      
      console.log(`✅ Vendor Endpoint Status: ${vendorResponse.status}`);
      console.log('📊 Vendor Bookings:', JSON.stringify(vendorData, null, 2));
      
    } else {
      console.log('❌ FAILED: Could not create test booking');
      console.log('🔍 Error details:', result);
    }
    
  } catch (error) {
    console.error('💥 ERROR creating test booking:', error);
  }
}

// Run the test
createTestBooking();
