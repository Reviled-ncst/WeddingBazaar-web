// Browser Console Test for Booking API
// Copy and paste this into the browser console to test the booking API directly

window.testBookingAPI = async function() {
  console.log('🧪 Starting browser booking API test...');
  
  const API_URL = 'https://weddingbazaar-web.onrender.com';
  
  const bookingRequest = {
    vendor_id: '2-2025-003',
    service_id: 'SRV-0013',
    service_type: 'DJ',
    service_name: 'Browser Console Test',
    event_date: '2025-04-01',
    event_time: '18:00',
    event_location: 'Browser Test Location',
    guest_count: 75,
    special_requests: 'This is a test from browser console',
    contact_phone: '+1234567890',
    preferred_contact_method: 'phone',
    budget_range: '$1000-$2000'
  };

  try {
    console.log('📤 Sending request to:', `${API_URL}/api/bookings/request`);
    console.log('📋 Request payload:', bookingRequest);
    
    // Test with timeout to see if it hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Request timed out after 30 seconds!');
      controller.abort();
    }, 30000);
    
    const response = await fetch(`${API_URL}/api/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'browser-console-test'
      },
      body: JSON.stringify(bookingRequest),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    console.log('📥 Response received!');
    console.log('📥 Status:', response.status);
    console.log('📥 OK:', response.ok);
    console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Raw response text:', responseText);
    
    if (response.ok) {
      try {
        const data = JSON.parse(responseText);
        console.log('✅ SUCCESS! Booking created:', data);
        return data;
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        return responseText;
      }
    } else {
      console.error('❌ Request failed with status:', response.status);
      console.error('❌ Error response:', responseText);
      return { error: true, status: response.status, message: responseText };
    }
    
  } catch (error) {
    console.error('💥 Network/Request error:', error);
    if (error.name === 'AbortError') {
      console.error('⏰ Request was aborted due to timeout');
    }
    return { error: true, name: error.name, message: error.message };
  }
};

console.log('✅ Browser test function loaded! Run: testBookingAPI()');
