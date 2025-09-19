#!/usr/bin/env node

console.log('🎯 FINAL API INTEGRATION VERIFICATION');
console.log('=====================================');

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

const testEndpoints = [
  { name: 'Health Check', url: '/api/health', method: 'GET' },
  { name: 'Featured Vendors', url: '/api/vendors/featured', method: 'GET' },
  { name: 'Ping Test', url: '/api/ping', method: 'GET' },
  { name: 'Services', url: '/api/services', method: 'GET' },
  { name: 'Vendor Categories', url: '/api/vendors/categories', method: 'GET' }
];

async function testEndpoint(test) {
  try {
    const url = BACKEND_URL + test.url;
    console.log(`🔍 Testing ${test.name}: ${url}`);
    
    const response = await fetch(url, { 
      method: test.method,
      headers: { 'Accept': 'application/json' }
    });
    
    const status = response.status;
    const isOk = response.ok;
    
    if (isOk) {
      console.log(`  ✅ ${test.name}: ${status} OK`);
      return true;
    } else {
      console.log(`  ❌ ${test.name}: ${status} ERROR`);
      return false;
    }
  } catch (error) {
    console.log(`  ❌ ${test.name}: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('\n📡 Testing Backend API Endpoints...\n');
  
  let passedCount = 0;
  
  for (const test of testEndpoints) {
    const passed = await testEndpoint(test);
    if (passed) passedCount++;
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 RESULTS:');
  console.log(`✅ Passed: ${passedCount}/${testEndpoints.length}`);
  console.log(`❌ Failed: ${testEndpoints.length - passedCount}/${testEndpoints.length}`);
  
  if (passedCount === testEndpoints.length) {
    console.log('\n🎉 ALL TESTS PASSED! API Integration is working correctly.');
    console.log('📱 Frontend should now load real data from backend.');
    console.log('🌐 Production URL: https://weddingbazaarph.web.app');
  } else {
    console.log('\n⚠️  Some tests failed. Check backend deployment.');
  }
  
  console.log('\n🔧 If frontend still shows 404 errors:');
  console.log('   1. Clear browser cache');
  console.log('   2. Hard refresh (Ctrl+F5)');
  console.log('   3. Check browser console for API calls');
  console.log('   4. Verify all calls use /api/ prefix');
}

// Run if called directly
runAllTests().catch(console.error);
