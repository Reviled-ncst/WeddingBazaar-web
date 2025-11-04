/**
 * EXTRACT USER ID FROM JWT TOKEN
 * 
 * This script extracts the user ID from the JWT token stored in localStorage.
 * Run this in the browser console to get your user ID.
 */

(function extractUserId() {
  console.log('🔍 Extracting user ID from JWT token...\n');
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('❌ No token found in localStorage');
    console.log('💡 Please log in first');
    return;
  }
  
  console.log('✅ Token found:', token.substring(0, 50) + '...');
  
  try {
    // Decode JWT token (format: header.payload.signature)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    
    console.log('✅ Token decoded successfully!\n');
    console.log('📋 Token payload:', decoded);
    
    // Try to find user ID in various possible fields
    const userId = decoded.id || decoded.userId || decoded.user_id || decoded.sub || decoded.coupleId || decoded.couple_id;
    
    if (userId) {
      console.log('\n✅ ✅ ✅ USER ID FOUND: ' + userId + ' ✅ ✅ ✅\n');
      console.log('=' .repeat(60));
      console.log('COPY THIS USER ID:', userId);
      console.log('=' .repeat(60));
      
      // Now test booking with this user ID
      console.log('\n🚀 Testing booking creation with this user ID...\n');
      
      fetch('https://weddingbazaar-web.onrender.com/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id: "SRV-00005",
          vendor_id: "2-2025-003",
          couple_id: userId,
          service_type: "Officiant",
          event_date: "2025-12-25",
          total_amount: 5000,
          event_location: "Makati City",
          notes: "Test booking with extracted user ID"
        })
      })
      .then(r => r.json())
      .then(result => {
        console.log('📦 Booking result:', result);
        
        if (result.success) {
          console.log('\n✅ ✅ ✅ SUCCESS! BOOKING CREATED! ✅ ✅ ✅');
          console.log('📧 NOW CHECK RENDER LOGS FOR EMAIL SENDING!');
          console.log('📧 Check vendor email inbox!');
          console.log('\n📋 Booking ID:', result.booking?.id);
        } else {
          console.error('\n❌ BOOKING FAILED:', result.error);
        }
      })
      .catch(error => {
        console.error('\n❌ NETWORK ERROR:', error);
      });
      
    } else {
      console.error('❌ Could not find user ID in token');
      console.log('💡 Token fields:', Object.keys(decoded));
      console.log('💡 Try one of these fields manually');
    }
    
  } catch (error) {
    console.error('❌ Error decoding token:', error);
    console.log('💡 Token might be invalid or corrupted');
  }
})();
