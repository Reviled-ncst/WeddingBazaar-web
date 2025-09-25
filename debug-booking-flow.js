// Browser console debugging script for booking flow
// Copy and paste this into the browser console on the IndividualBookings page

console.log('🔧 Wedding Bazaar Booking Flow Debugger');
console.log('=====================================\n');

// Test 1: Check if IndividualBookings is listening for events
console.log('🧪 Test 1: Testing event listener');

// Dispatch a test event to see if IndividualBookings responds
const testEvent = new CustomEvent('bookingCreated', {
  detail: {
    id: 'TEST-BOOKING-001',
    service_name: 'Test Service',
    vendor_name: 'Test Vendor'
  }
});

console.log('📢 Dispatching test bookingCreated event...');
window.dispatchEvent(testEvent);

// Test 2: Test direct API call
console.log('\n🧪 Test 2: Testing direct booking creation API call');

const testBookingCreation = async () => {
  const payload = {
    coupleId: '1-2025-001',
    vendorId: 'VEND-0002',
    serviceId: 'SRV-8154',
    serviceType: 'photography',
    serviceName: 'Debug Test Photography',
    eventDate: '2025-08-10',
    eventTime: '17:00',
    eventLocation: 'Debug Test Location',
    venueDetails: 'Debug Test Venue',
    guestCount: 100,
    specialRequests: 'Debug test booking',
    contactPhone: '+639171234567',
    preferredContactMethod: 'phone',
    budgetRange: '₱50,000 - ₱80,000'
  };
  
  try {
    console.log('📤 Making direct API call...');
    console.log('Payload:', payload);
    
    const response = await fetch('/api/bookings/enhanced', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Booking created:', result);
      
      // Dispatch the exact same event that BookingRequestModal would dispatch
      const bookingCreatedEvent = new CustomEvent('bookingCreated', {
        detail: result
      });
      console.log('📢 Dispatching real bookingCreated event...');
      window.dispatchEvent(bookingCreatedEvent);
      
      return result;
    } else {
      const error = await response.text();
      console.error('❌ API Error:', error);
      return null;
    }
  } catch (error) {
    console.error('💥 Exception:', error);
    return null;
  }
};

// Test 3: Test getting bookings
const testGetBookings = async () => {
  console.log('\n🧪 Test 3: Testing get bookings API call');
  
  try {
    const response = await fetch('/api/bookings/enhanced?coupleId=1-2025-001&limit=10&sortBy=created_at&sortOrder=DESC');
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('📊 Bookings found:', result.total);
      console.log('📋 Bookings:', result.bookings);
      return result;
    } else {
      const error = await response.text();
      console.error('❌ Get Bookings Error:', error);
      return null;
    }
  } catch (error) {
    console.error('💥 Exception:', error);
    return null;
  }
};

// Run complete flow test
const runCompleteTest = async () => {
  console.log('\n🚀 Running complete booking flow test...');
  
  // Step 1: Get initial booking count
  const initialBookings = await testGetBookings();
  const initialCount = initialBookings ? initialBookings.total : 0;
  console.log('📊 Initial booking count:', initialCount);
  
  // Step 2: Create a new booking
  const createdBooking = await testBookingCreation();
  
  if (createdBooking) {
    // Step 3: Wait and check if booking appears
    console.log('⏳ Waiting 2 seconds then checking bookings...');
    
    setTimeout(async () => {
      const finalBookings = await testGetBookings();
      const finalCount = finalBookings ? finalBookings.total : 0;
      console.log('📊 Final booking count:', finalCount);
      
      if (finalCount > initialCount) {
        console.log('🎉 SUCCESS: Booking count increased!');
        console.log('✅ The booking creation API is working correctly.');
        console.log('🔍 If bookings don\'t appear in the UI, the issue is with:');
        console.log('   1. Event listener not working');
        console.log('   2. loadBookings function not being called');
        console.log('   3. UI not updating after loadBookings');
      } else {
        console.log('❌ ERROR: Booking count did not increase');
        console.log('🔍 The booking may not have been created properly');
      }
    }, 2000);
  }
};

// Auto-run the complete test
setTimeout(runCompleteTest, 1000);

console.log('\n📝 Instructions:');
console.log('1. Watch the console for test results');
console.log('2. If event dispatch works, you should see IndividualBookings react');
console.log('3. If API calls work, booking count should increase');
console.log('4. Check the Network tab for actual HTTP requests');
console.log('5. If everything works but UI doesn\'t update, issue is in React component');
