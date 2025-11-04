/**
 * UPDATED VALID BOOKING REQUEST TEST - With User ID
 * 
 * This test includes the required couple_id/userId field.
 * 
 * INSTRUCTIONS:
 * 1. Make sure you're logged in
 * 2. Go to: https://weddingbazaarph.web.app/individual/bookings
 * 3. Open browser console (F12)
 * 4. Copy and paste this ENTIRE script
 * 5. Press Enter
 */

(async function testValidBookingWithUserId() {
  console.log('🚀 STARTING VALID BOOKING TEST WITH USER ID...\n');
  
  // Get auth token and user data from localStorage
  const token = localStorage.getItem('token');
  const userDataStr = localStorage.getItem('userData');
  
  if (!token) {
    console.error('❌ ERROR: No auth token found. Please log in first.');
    return;
  }
  
  console.log('✅ Auth token found');
  
  // Parse user data to get user ID
  let userId = null;
  if (userDataStr) {
    try {
      const userData = JSON.parse(userDataStr);
      userId = userData.id || userData.userId || userData.couple_id;
      console.log('✅ User ID found:', userId);
    } catch (e) {
      console.error('⚠️ Could not parse user data:', e);
    }
  }
  
  if (!userId) {
    console.error('❌ ERROR: Could not find user ID. Trying to get from token...');
    
    // Try to decode JWT to get user ID
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decoded = JSON.parse(jsonPayload);
      userId = decoded.id || decoded.userId || decoded.sub;
      console.log('✅ User ID extracted from token:', userId);
    } catch (e) {
      console.error('❌ Could not decode token:', e);
      console.error('⚠️ Will try to create booking without couple_id...');
    }
  }
  
  // VALID booking data with all required fields
  const validBookingData = {
    service_id: "SRV-00005",        // ✅ Valid service ID
    vendor_id: "2-2025-003",         // ✅ Valid vendor ID
    couple_id: userId,               // ✅ User ID from localStorage/token
    service_type: "Officiant",       // ✅ Matches service category
    event_date: "2025-12-25",        // ✅ Required field
    total_amount: 5000,              // ✅ Required field
    event_location: "Makati City",
    notes: "Test booking with valid IDs and user ID",
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
      console.log('\n✅ ✅ ✅ SUCCESS! Booking created! ✅ ✅ ✅');
      console.log('\n' + '='.repeat(60));
      console.log('📧 NOW CHECK THESE:');
      console.log('='.repeat(60));
      console.log('1. 🖥️  Render logs for "Creating new booking..." and "Email sent"');
      console.log('2. 📧 Vendor email inbox for notification');
      console.log('3. 💾 Database bookings table for new entry');
      console.log('='.repeat(60));
      console.log('\n📋 Booking ID:', data.booking?.id);
      console.log('📧 Email should be sent to vendor email');
      console.log('\n🎉 BACKEND IS WORKING! If no email, check email service.');
    } else {
      console.error('\n❌ FAILED! Error details:', data);
      console.error('\n💡 Possible issues:');
      if (data.error?.includes('coupleId') || data.error?.includes('userId')) {
        console.error('   - User ID is missing or invalid');
        console.error('   - Logged in user:', userId);
      } else if (data.error?.includes('foreign key')) {
        console.error('   - Service ID or Vendor ID not found in database');
      } else {
        console.error('   - Check error message above for details');
      }
    }
    
  } catch (error) {
    console.error('\n❌ NETWORK ERROR:', error.message);
    console.error('Full error:', error);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 SUMMARY');
  console.log('='.repeat(60));
  console.log('Service ID: SRV-00005');
  console.log('Vendor ID: 2-2025-003');
  console.log('User ID:', userId || 'NOT FOUND');
  console.log('='.repeat(60));
})();
