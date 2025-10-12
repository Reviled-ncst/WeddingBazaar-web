// Check Deployed Backend Status
const checkBackendStatus = async () => {
  const BASE_URL = 'https://weddingbazaar-web.onrender.com';
  
  console.log('🔍 Checking deployed backend status...\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log('📊 Backend Status:');
    console.log('  Status:', data.status);
    console.log('  Version:', data.version);
    console.log('  Environment:', data.environment);
    console.log('  Uptime:', Math.floor(data.uptime / 60), 'minutes');
    
    console.log('\n📡 Available Endpoints:');
    if (data.endpoints) {
      Object.entries(data.endpoints).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    } else {
      console.log('  No endpoint information available');
    }
    
    // Check if the bookings endpoint mentions the new payment endpoints
    if (data.availableEndpoints && data.availableEndpoints.bookings) {
      console.log('\n💳 Booking Endpoints:');
      console.log('  ' + data.availableEndpoints.bookings);
      
      if (data.availableEndpoints.bookings.includes('accept-quote')) {
        console.log('✅ Payment workflow endpoints are deployed!');
      } else {
        console.log('❌ Payment workflow endpoints not yet deployed');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check backend status:', error.message);
  }
};

checkBackendStatus();
