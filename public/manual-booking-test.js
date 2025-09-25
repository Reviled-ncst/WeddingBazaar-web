console.log('🧪 Starting manual booking test...');

// Test the booking creation and reload flow manually
async function testBookingFlow() {
  console.log('📝 Step 1: Creating a booking via API');
  
  const bookingPayload = {
    vendor_id: 3,
    service_id: "SRV-1758769064490",
    service_type: "DJ",
    service_name: "Beltran Sound Systems",
    event_date: "2025-12-20",
    event_time: "18:00",
    event_location: "Test Manual Location",
    venue_details: "Manual Test Venue",
    guest_count: 150,
    budget_range: "₱30,000-₱50,000",
    special_requests: "Manual test booking request",
    contact_phone: "09171234567",
    preferred_contact_method: "email"
  };
  
  try {
    const createResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingPayload)
    });
    
    const createResult = await createResponse.json();
    console.log('✅ Step 1 result:', createResult);
    
    if (createResult.success) {
      console.log('📢 Step 2: Dispatching bookingCreated event');
      const event = new CustomEvent('bookingCreated', {
        detail: createResult.data
      });
      window.dispatchEvent(event);
      
      console.log('⏳ Step 3: Waiting 1 second then checking bookings...');
      setTimeout(async () => {
        console.log('📡 Step 4: Fetching user bookings');
        const bookingsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001');
        const bookingsResult = await bookingsResponse.json();
        console.log('📋 Step 4 result:', bookingsResult);
        
        if (bookingsResult.success && bookingsResult.bookings) {
          console.log(`✅ Found ${bookingsResult.bookings.length} bookings`);
          bookingsResult.bookings.forEach((booking, index) => {
            console.log(`  ${index + 1}. ID: ${booking.id}, Service: ${booking.vendorName}, Date: ${booking.eventDate}`);
          });
        }
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the test
testBookingFlow();
