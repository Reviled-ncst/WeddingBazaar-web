/**
 * VALID BOOKING REQUEST TEST - Use in Browser Console
 * 
 * This test uses REAL service and vendor IDs from your database.
 * 
 * INSTRUCTIONS:
 * 1. Go to: https://weddingbazaarph.web.app/individual/bookings
 * 2. Open browser console (F12)
 * 3. Copy and paste this ENTIRE script
 * 4. Press Enter
 * 5. Check the console output for success/error
 * 6. Check Render logs for email sending
 */

(async function testValidBooking() {
  console.log('🚀 STARTING VALID BOOKING TEST...\n');
  
  // Get auth token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ ERROR: No auth token found. Please log in first.');
    return;
  }
  
  console.log('✅ Auth token found');
  
  // VALID IDs from your database
  const validBookingData = {
    service_id: "SRV-00005",        // ✅ Valid service ID
    vendor_id: "2-2025-003",         // ✅ Valid vendor ID
    service_type: "Officiant",       // ✅ Matches service category
    event_date: "2025-12-25",        // ✅ Required field
    total_amount: 5000,              // ✅ Required field
    event_location: "Makati City",
    notes: "Test booking with valid IDs",
    special_requests: "Please confirm availability"
  };
  
  console.log('📋 Booking data:', JSON.stringify(validBookingData, null, 2));
  
  try {
    console.log('\n🔄 Sending booking request to backend...');
    
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(validBookingData)
    });
    
    console.log(`\n📊 Response status: ${response.status} ${response.statusText}`);
    
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ SUCCESS! Booking created!');
      console.log('📧 Check Render logs for email sending logs');
      console.log('📧 Check vendor email for notification');
      console.log('\n📋 Booking ID:', data.booking?.id);
    } else {
      console.error('\n❌ FAILED! Error details:', data);
    }
    
  } catch (error) {
    console.error('\n❌ NETWORK ERROR:', error.message);
    console.error('Full error:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🔍 NEXT STEPS:');
  console.log('1. Check Render logs: https://dashboard.render.com/');
  console.log('2. Look for "Creating new booking" and "Email sent" logs');
  console.log('3. Check vendor email inbox');
  console.log('='.repeat(60));
})();
