// Compare API response formats
const apiUrl = 'https://weddingbazaar-web.onrender.com';

async function compareAPIFormats() {
  console.log('🔍 Comparing API response formats...');
  
  try {
    // Test the endpoint that the frontend is calling
    const frontendUrl = `${apiUrl}/api/bookings?coupleId=1-2025-001&page=1&limit=10&sortBy=created_at&sortOrder=desc`;
    console.log('\n🌐 Testing frontend endpoint:', frontendUrl);
    
    const response = await fetch(frontendUrl);
    const data = await response.json();
    
    console.log('📊 Frontend API Response Structure:');
    console.log('- success:', data.success);
    console.log('- data exists:', !!data.data);
    console.log('- data.bookings exists:', !!data.data?.bookings);
    console.log('- data.bookings length:', data.data?.bookings?.length || 'N/A');
    console.log('- direct bookings exists:', !!data.bookings);
    console.log('- direct bookings length:', data.bookings?.length || 'N/A');
    
    // Show full structure
    console.log('\n📋 Full Response Structure:');
    console.log('Keys in response:', Object.keys(data));
    if (data.data) {
      console.log('Keys in data:', Object.keys(data.data));
    }
    
    // Check what the response actually contains
    const actualBookings = data.data?.bookings || data.bookings || [];
    console.log(`\n📦 Found ${actualBookings.length} bookings in response`);
    
    if (actualBookings.length > 0) {
      console.log('Sample booking:', actualBookings[0]);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

compareAPIFormats();
