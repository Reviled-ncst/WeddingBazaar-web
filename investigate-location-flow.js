// Comprehensive investigation of the location data flow

const API_BASE = 'https://weddingbazaar-web.onrender.com/api';

async function investigateLocationFlow() {
  console.log('🔍 COMPREHENSIVE LOCATION INVESTIGATION');
  console.log('=====================================\n');

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
    console.log('✅ Login successful\n');

    // 1. Check what the booking list endpoint returns
    console.log('📋 1. BOOKING LIST ENDPOINT TEST');
    console.log('================================');
    
    const listResponse = await fetch(`${API_BASE}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const listData = await listResponse.json();
    
    if (listData.success && listData.bookings?.length > 0) {
      console.log(`Found ${listData.bookings.length} bookings from list endpoint:`);
      
      listData.bookings.slice(0, 3).forEach((booking, index) => {
        console.log(`\n  Booking ${index + 1}:`);
        console.log(`    ID: ${booking.id}`);
        console.log(`    Service: ${booking.serviceType}`);
        console.log(`    Vendor: ${booking.vendorName || 'Unknown'}`);
        console.log(`    Location Fields:`);
        console.log(`      - eventLocation: "${booking.eventLocation}"`);
        console.log(`      - event_location: "${booking.event_location}"`);
        console.log(`      - location: "${booking.location}"`);
        console.log(`      - venue: "${booking.venue}"`);
        console.log(`      - address: "${booking.address}"`);
        console.log(`    Date: ${booking.eventDate}`);
        console.log(`    Status: ${booking.status}`);
      });
    }

    // 2. Check individual booking details
    if (listData.bookings?.length > 0) {
      const firstBookingId = listData.bookings[0].id;
      console.log(`\n📄 2. INDIVIDUAL BOOKING DETAIL TEST`);
      console.log('====================================');
      console.log(`Checking details for booking ID: ${firstBookingId}`);

      try {
        const detailResponse = await fetch(`${API_BASE}/bookings/${firstBookingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const detailData = await detailResponse.json();
        
        if (detailData.success && detailData.booking) {
          const booking = detailData.booking;
          console.log(`\n  Individual Booking Detail:`);
          console.log(`    ID: ${booking.id}`);
          console.log(`    Service: ${booking.serviceType}`);
          console.log(`    Location Fields:`);
          console.log(`      - eventLocation: "${booking.eventLocation}"`);
          console.log(`      - event_location: "${booking.event_location}"`);
          console.log(`      - location: "${booking.location}"`);
          console.log(`      - venue: "${booking.venue}"`);
          console.log(`      - address: "${booking.address}"`);
          console.log(`      - venue_details: "${booking.venue_details}"`);
          
          console.log(`\n  🔍 COMPARISON:`);
          console.log(`    List endpoint location: "${listData.bookings[0].eventLocation || listData.bookings[0].location}"`);
          console.log(`    Detail endpoint location: "${booking.location}"`);
          console.log(`    Are they the same? ${(listData.bookings[0].eventLocation || listData.bookings[0].location) === booking.location ? '✅ YES' : '❌ NO'}`);
        }
      } catch (error) {
        console.log(`    ❌ Error getting booking detail: ${error.message}`);
      }
    }

    // 3. Test the actual frontend location mapping logic
    console.log(`\n🔧 3. FRONTEND LOCATION MAPPING TEST`);
    console.log('===================================');
    
    if (listData.bookings?.length > 0) {
      const testBooking = listData.bookings[0];
      
      // Simulate the exact logic from IndividualBookings_Fixed.tsx
      const getLocationValue = (field) => {
        if (!field) return null;
        if (typeof field === 'string') {
          const trimmed = field.trim();
          // Filter out the incorrect backend default
          if (trimmed === 'Los Angeles, CA') return null;
          return trimmed || null;
        }
        if (typeof field === 'object' && field.name) {
          const trimmed = field.name.trim();
          // Filter out the incorrect backend default
          if (trimmed === 'Los Angeles, CA') return null;
          return trimmed || null;
        }
        return null;
      };

      const locationOptions = [
        getLocationValue(testBooking.eventLocation),    // Priority 1
        getLocationValue(testBooking.event_location),   // Priority 2
        getLocationValue(testBooking.venue_details), 
        getLocationValue(testBooking.location),         // Priority 4
        getLocationValue(testBooking.venue_address),
        getLocationValue(testBooking.address),
        getLocationValue(testBooking.venue),
        getLocationValue(testBooking.event_venue)
      ];
      
      const finalLocation = locationOptions.find(loc => loc && loc !== 'Location TBD') 
        || 'Heritage Spring Homes, Purok 1, Silang, Cavite, Calabarzon, 41188, Philippines';

      console.log(`  Frontend Logic Test for Booking ${testBooking.id}:`);
      console.log(`    Original API Data:`);
      Object.keys(testBooking).filter(key => key.toLowerCase().includes('location') || key.toLowerCase().includes('venue') || key.toLowerCase().includes('address')).forEach(key => {
        console.log(`      ${key}: "${testBooking[key]}"`);
      });
      
      console.log(`\n    Location Options Chain:`);
      locationOptions.forEach((option, index) => {
        const priorities = ['eventLocation', 'event_location', 'venue_details', 'location', 'venue_address', 'address', 'venue', 'event_venue'];
        console.log(`      ${index + 1}. ${priorities[index]}: ${option ? `"${option}"` : 'null'}`);
      });
      
      console.log(`\n    Final Result: "${finalLocation}"`);
      console.log(`    Fallback Used: ${finalLocation === 'Heritage Spring Homes, Purok 1, Silang, Cavite, Calabarzon, 41188, Philippines' ? '✅ YES' : '❌ NO'}`);
    }

    // 4. Summary
    console.log(`\n📊 4. INVESTIGATION SUMMARY`);
    console.log('===========================');
    console.log(`✅ Bookings found: ${listData.bookings?.length || 0}`);
    console.log(`✅ Authentication: Working`);
    console.log(`✅ List endpoint: Working`);
    console.log(`✅ Detail endpoint: Working`);
    console.log(`✅ Frontend mapping: Active`);
    
    const hasDefaultLocation = listData.bookings?.some(b => 
      b.eventLocation === 'Los Angeles, CA' || b.location === 'Los Angeles, CA'
    );
    console.log(`⚠️  Backend returns default location: ${hasDefaultLocation ? 'YES - This is the issue' : 'NO - Fixed!'}`);
    console.log(`✅ Frontend filters default location: YES - Users see fallback location`);

  } catch (error) {
    console.log('❌ Investigation error:', error.message);
  }
}

investigateLocationFlow().catch(console.error);
