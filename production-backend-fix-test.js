// PRODUCTION FIX: Force backend to return services
// This tests if the production backend ServicesService is working

console.log('🚀 TESTING PRODUCTION BACKEND FIX...');

const API_URL = 'https://weddingbazaar-web.onrender.com';

async function forceBackendServicesTest() {
  try {
    // Test the production backend directly with curl-like request
    console.log('📡 Testing production /api/services with full headers...');
    
    const response = await fetch(`${API_URL}/api/services`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'WeddingBazaar-Debug/1.0'
      }
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('📊 Raw response (first 200 chars):', text.substring(0, 200));
    
    const data = JSON.parse(text);
    console.log('📊 Parsed response structure:', Object.keys(data));
    console.log('📊 Success field:', data.success);
    console.log('📊 Services field type:', typeof data.services);
    console.log('📊 Services count:', data.services?.length || 0);
    
    if (data.success && data.services && data.services.length === 0) {
      console.log('⚠️ CONFIRMED: Backend is returning empty services array');
      console.log('💡 SOLUTION: The backend ServicesService needs to be fixed on production');
      console.log('💡 The issue is NOT in the frontend - frontend fallback should work');
      
      // Test if there are any console logs we can see
      console.log('\n🔍 Testing if backend logs any errors...');
      
      // Make multiple requests to see if there are different responses
      for (let i = 0; i < 3; i++) {
        const testResponse = await fetch(`${API_URL}/api/services?test=${i}`);
        const testData = await testResponse.json();
        console.log(`   Test ${i+1}: ${testData.services?.length || 0} services`);
      }
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Production backend test failed:', error);
    return null;
  }
}

// Run the test and provide fix recommendations
forceBackendServicesTest().then(result => {
  console.log('\n🎯 DIAGNOSIS AND SOLUTION:');
  
  if (result && result.success && result.services && result.services.length === 0) {
    console.log('✅ CONFIRMED: Backend API format is correct');
    console.log('❌ PROBLEM: Backend ServicesService is returning empty array');
    console.log('💡 ROOT CAUSE: Production backend has database connection or query issue');
    console.log('\n🔧 IMMEDIATE SOLUTIONS:');
    console.log('   1. Fix backend ServicesService to return real services');
    console.log('   2. Or ensure frontend fallback to vendors is working');
    console.log('   3. The database has 80+ services, so backend should return them');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('   1. Check production backend logs for ServicesService errors');
    console.log('   2. Verify production database connection');
    console.log('   3. Test frontend vendor fallback logic');
    console.log('   4. Deploy backend fix to return real services');
  }
});
