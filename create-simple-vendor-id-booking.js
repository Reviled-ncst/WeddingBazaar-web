// CREATE TEST BOOKING WITH SIMPLE VENDOR ID FORMAT
console.log('🎯 CREATING TEST BOOKING WITH SIMPLE VENDOR ID: 23');
console.log('==================================================');

const testBooking = {
  coupleId: '1-2025-001', // Customer ID (required)
  vendorId: '23', // Simple vendor ID format
  eventDate: '2025-12-01', // Different date to distinguish
  serviceType: 'Wedding Photography',
  status: 'pending',
  totalAmount: 25000,
  message: 'Need photography service for wedding ceremony',
  guestCount: 100,
  eventLocation: 'Manila Cathedral',
  contactEmail: 'customer2@email.com',
  contactPhone: '+63 917 999 8888'
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
      
      // Now test both vendor endpoints
      console.log('\n🧪 Testing vendor endpoints after creating booking...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      // Test simple vendor ID
      console.log('\n🔍 Testing simple vendor ID (23):');
      const simpleResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/23');
      const simpleData = await simpleResponse.json();
      console.log('Simple ID response:', JSON.stringify(simpleData, null, 2));
      
      // Test complex vendor ID 
      console.log('\n🔍 Testing complex vendor ID (2-2025-023):');
      const complexResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-023');
      const complexData = await complexResponse.json();
      console.log('Complex ID response:', JSON.stringify(complexData, null, 2));
      
    } else {
      console.log('❌ FAILED: Could not create test booking');
      console.log('🔍 Error details:', result);
    }
    
  } catch (error) {
    console.error('💥 ERROR creating test booking:', error);
  }
}

createTestBooking();
