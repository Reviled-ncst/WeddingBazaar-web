// CREATE TEST BOOKING FOR CURRENT VENDOR 2-2025-003
console.log('🎯 CREATING TEST BOOKING FOR CURRENT VENDOR 2-2025-003');
console.log('=========================================================');

const testBooking = {
  coupleId: '1-2025-001', // Customer ID (required)
  vendorId: '3', // Simple vendor ID that the API expects (3 maps to 2-2025-003)
  eventDate: '2025-12-15', // Event date (required)
  serviceType: 'DJ Service',
  status: 'pending',
  totalAmount: 25000,
  message: 'Need professional DJ service for wedding celebration',
  guestCount: 200,
  eventLocation: 'Grand Ballroom, Manila Hotel',
  contactEmail: 'couple@email.com',
  contactPhone: '+63 917 555 1234'
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
      console.log(`📋 Booking ID: ${result.booking?.id || result.id || 'Not provided'}`);
      
      // Now test the vendor endpoint with simple ID
      console.log('\n🧪 Testing vendor endpoint with simple ID: 3');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const vendorResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/3');
      const vendorData = await vendorResponse.json();
      
      console.log('🔍 Vendor bookings response (ID: 3):');
      console.log(JSON.stringify(vendorData, null, 2));
      
      if (vendorData.bookings && vendorData.bookings.length > 0) {
        console.log(`🎉 SUCCESS: Found ${vendorData.bookings.length} booking(s) for vendor ID 3!`);
      } else {
        console.log('⚠️ No bookings found for vendor ID 3');
      }
      
    } else {
      console.log('❌ FAILED: Could not create test booking');
      console.log('🔍 Error details:', result);
    }
    
  } catch (error) {
    console.error('💥 ERROR creating test booking:', error);
  }
}

createTestBooking();
