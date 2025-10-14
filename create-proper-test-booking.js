// CREATE PROPER TEST BOOKING FOR VENDOR 2-2025-023
console.log('🎯 CREATING PROPER TEST BOOKING FOR VENDOR 2-2025-023');
console.log('======================================================');

const testBooking = {
  coupleId: '1-2025-001', // Customer ID (required)
  vendorId: '2-2025-023', // Our vendor ID (required) 
  eventDate: '2025-11-15', // Event date (required)
  serviceType: 'DJ Service',
  status: 'pending',
  totalAmount: 15000,
  message: 'Need DJ service for wedding reception',
  guestCount: 150,
  eventLocation: 'Garden Resort, Tagaytay',
  contactEmail: 'customer@email.com',
  contactPhone: '+63 917 123 4567'
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
      
      // Now test the vendor endpoint
      console.log('\n🧪 Testing vendor endpoint after creating booking...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const vendorResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-023');
      const vendorData = await vendorResponse.json();
      
      console.log('🔍 Vendor bookings response:');
      console.log(JSON.stringify(vendorData, null, 2));
      
      if (vendorData.bookings && vendorData.bookings.length > 0) {
        console.log(`🎉 SUCCESS: Found ${vendorData.bookings.length} booking(s) for vendor!`);
      } else {
        console.log('⚠️ No bookings found yet - may need time to sync');
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
