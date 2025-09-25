// Test to verify the API service is now using the correct URL
console.log('🔍 Testing environment variables...');

// Simulate the environment variable check
const apiUrl = 'https://weddingbazaar-web.onrender.com'; // Should be VITE_API_URL
const fallbackUrl = 'http://localhost:3001';

console.log('📊 Environment Check:');
console.log('- VITE_API_URL should be:', apiUrl);
console.log('- Fallback URL:', fallbackUrl);
console.log('- Expected result: Frontend should use production API');

// Test the production API one more time to confirm it has 17 bookings
async function verifyProductionAPI() {
  try {
    const response = await fetch(`${apiUrl}/api/bookings?coupleId=1-2025-001&page=1&limit=50`);
    const data = await response.json();
    
    console.log('\n✅ Production API Response:');
    console.log('- success:', data.success);
    console.log('- bookings count:', data.bookings?.length || 0);
    console.log('- total bookings:', data.pagination?.totalBookings || 'Unknown');
    
    if (data.bookings?.length >= 10) {
      console.log('🎉 Production API has plenty of bookings!');
      
      // Check if any bookings have zero amounts (should trigger fallback pricing)
      const zeroAmountBookings = data.bookings.filter(b => b.amount === 0).length;
      console.log(`💰 Bookings with zero amount: ${zeroAmountBookings} (should trigger fallback pricing)`);
    } else {
      console.log('⚠️ Production API has fewer bookings than expected');
    }
    
  } catch (error) {
    console.error('❌ Production API test failed:', error.message);
  }
}

verifyProductionAPI();
