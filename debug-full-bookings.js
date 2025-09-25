// Debug full booking data structure
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

async function debugFullBookings() {
  try {
    console.log('🔍 Fetching full booking response...\n');
    
    const response = await fetch(`${API_BASE_URL}/bookings/couple/1-2025-001?limit=50`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Full API Response:', JSON.stringify(data, null, 2));
    
    // Now let's try the old endpoint that previously showed 17 bookings  
    console.log('\n\n🔍 Checking alternative endpoints...\n');
    
    const endpoints = [
      '/bookings?coupleId=1-2025-001&limit=50',
      '/bookings?userId=1-2025-001&limit=50',
      '/bookings/user/1-2025-001?limit=50'
    ];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`\nTesting: ${API_BASE_URL}${endpoint}`);
        const response2 = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`Status: ${response2.status}`);
        
        if (response2.ok) {
          const data2 = await response2.json();
          const bookings = Array.isArray(data2) ? data2 : (data2.bookings || data2.data?.bookings || []);
          console.log(`✅ Found ${bookings.length} bookings`);
          
          if (bookings.length > 1) {
            console.log('Sample fields from first booking:', Object.keys(bookings[0] || {}));
          }
        }
      } catch (e) {
        console.log(`❌ Error: ${e.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugFullBookings();
