// Wake up the sleeping backend and test timeout improvements
// Run this with: node wake-up-backend.cjs

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function wakeUpBackend() {
  console.log('🔄 [WAKE UP] Attempting to wake up sleeping backend...');
  console.log('🌐 [WAKE UP] Backend URL:', BACKEND_URL);
  
  try {
    console.log('⏰ [WAKE UP] Starting wake-up process (this may take 30-60 seconds)...');
    
    // Extended timeout to allow service to wake up
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'WeddingBazaar-WakeUp/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ [WAKE UP] Backend is now awake!');
      console.log('📊 [WAKE UP] Health data:', JSON.stringify(data, null, 2));
      
      // Test bookings endpoint while backend is warm
      console.log('\n📚 [TEST] Testing bookings endpoint while backend is warm...');
      
      const bookingsResponse = await fetch(`${BACKEND_URL}/api/bookings/enhanced?coupleId=1-2025-001&page=1&limit=10`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        console.log('✅ [TEST] Bookings loaded successfully!');
        console.log('📊 [TEST] Found bookings:', bookingsData.count || 0);
        
        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
          console.log('📋 [TEST] Sample booking:', {
            id: bookingsData.bookings[0].id,
            status: bookingsData.bookings[0].status,
            service_name: bookingsData.bookings[0].service_name
          });
        }
      } else {
        console.log('⚠️ [TEST] Bookings endpoint returned:', bookingsResponse.status);
      }
      
    } else {
      console.log('❌ [WAKE UP] Backend responded but with error:', response.status);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('⏰ [WAKE UP] Wake-up timeout (60s) - backend may be completely offline');
    } else {
      console.log('❌ [WAKE UP] Wake-up failed:', error.message);
    }
  }
  
  console.log('\n🎯 [RESULT] Wake-up process completed.');
  console.log('💡 [TIP] If the backend is now awake, try refreshing the frontend page.');
  console.log('🌐 [FRONTEND] https://weddingbazaarph.web.app/individual/bookings');
}

// Run wake-up process
wakeUpBackend();
