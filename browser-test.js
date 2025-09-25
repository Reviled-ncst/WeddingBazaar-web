console.log('🧪 Testing booking API directly in browser...');

const API_URL = 'https://weddingbazaar-web.onrender.com';

const testBooking = async () => {
  const bookingRequest = {
    vendor_id: '2-2025-003',
    service_id: 'SRV-0013',
    service_type: 'photography',
    service_name: 'Browser Test Service',
    event_date: '2025-03-15',
    event_time: '14:00',
    guest_count: 100,
    special_requests: 'Test from browser console',
    contact_phone: '+1234567890',
    preferred_contact_method: 'phone'
  };

  try {
    console.log('📤 Sending request...');
    
    const response = await fetch(`${API_URL}/api/bookings/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'browser-test'
      },
      body: JSON.stringify(bookingRequest)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📥 Raw response:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Success! Booking created:', data);
    } else {
      console.error('❌ Request failed:', responseText);
    }
  } catch (error) {
    console.error('💥 Error:', error);
  }
};

testBooking();
