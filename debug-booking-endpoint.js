// Debug booking endpoint issues

const API_BASE = 'https://weddingbazaar-web.onrender.com/api';

async function debugBookingEndpoint() {
  console.log('🔍 Debugging booking endpoint...');
  
  // Login first
  try {
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'locationtest@weddingbazaar.com',
        password: 'testing123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.log('❌ Login failed');
      return;
    }

    const token = loginData.token;
    console.log('✅ Login successful');

    // Test booking creation with minimal data
    const simpleBooking = {
      vendor_id: '1',
      service_type: 'Photography',
      event_date: '2024-12-25',
      event_location: 'Test Location - Manila, Philippines',
      event_time: '16:00',
      guest_count: 100,
      message: 'Simple test booking',
      contact_phone: '+63123456789'
    };

    console.log('\n📤 Sending booking request...');
    console.log('Data:', JSON.stringify(simpleBooking, null, 2));

    const bookingResponse = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(simpleBooking)
    });

    console.log('\n📥 Response status:', bookingResponse.status);
    console.log('Response headers:', Object.fromEntries(bookingResponse.headers.entries()));

    const responseText = await bookingResponse.text();
    console.log('\n📝 Raw response text (first 500 chars):');
    console.log(responseText.substring(0, 500));

    // Try to parse as JSON
    try {
      const bookingData = JSON.parse(responseText);
      console.log('\n✅ Parsed JSON response:', bookingData);
    } catch (error) {
      console.log('\n❌ Response is not valid JSON:', error.message);
    }

  } catch (error) {
    console.log('❌ Debug error:', error.message);
  }
}

debugBookingEndpoint().catch(console.error);
