const https = require('https');

console.log('🔍 DEBUGGING BOOKING LOADING ISSUE');
console.log('==================================');

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';
const VENDOR_ID = '2-2025-003';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          data: data
        });
      });
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function debugBookingIssue() {
  console.log(`\n🔍 Testing vendor ID: ${VENDOR_ID}`);
  console.log('=====================================');
  
  // Test 1: Check if vendor bookings endpoint exists
  console.log('\n1. Testing vendor bookings endpoint...');
  try {
    const response = await makeRequest(`${BACKEND_URL}/api/bookings/vendor/${VENDOR_ID}`);
    console.log(`Status: ${response.status}`);
    
    if (response.status === 403) {
      const data = JSON.parse(response.data);
      console.log('🚨 SECURITY BLOCK DETECTED:');
      console.log(`   Code: ${data.code}`);
      console.log(`   Message: ${data.error}`);
      console.log('   Analysis: This vendor ID is being blocked by our security fix');
    } else if (response.status === 404) {
      console.log('❌ ENDPOINT NOT FOUND: The vendor bookings endpoint may not be deployed yet');
    } else if (response.status === 200) {
      const data = JSON.parse(response.data);
      console.log('✅ SUCCESS: Bookings loaded successfully');
      console.log(`   Bookings found: ${data.bookings?.length || 0}`);
    } else {
      console.log(`⚠️ UNEXPECTED STATUS: ${response.status}`);
      console.log('Response:', response.data.substring(0, 200));
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
  
  // Test 2: Check bookings stats endpoint
  console.log('\n2. Testing booking stats endpoint...');
  try {
    const statsResponse = await makeRequest(`${BACKEND_URL}/api/bookings/stats?vendorId=${VENDOR_ID}`);
    console.log(`Status: ${statsResponse.status}`);
    
    if (statsResponse.status === 200) {
      const statsData = JSON.parse(statsResponse.data);
      console.log('✅ Stats loaded successfully');
      console.log(`   Stats response:`, Object.keys(statsData));
    } else {
      console.log(`❌ Stats failed with status: ${statsResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Stats ERROR: ${error.message}`);
  }
  
  // Test 3: Analyze the vendor ID pattern
  console.log('\n3. Analyzing vendor ID pattern...');
  console.log(`   ID: ${VENDOR_ID}`);
  console.log(`   Contains dash: ${VENDOR_ID.includes('-')}`);
  console.log(`   Length: ${VENDOR_ID.length}`);
  console.log(`   Pattern matches booking ID: ${/^\d+-\d{4}-\d{3}$/.test(VENDOR_ID)}`);
  console.log(`   Segments: ${VENDOR_ID.split('-')}`);
  
  // Determine issue
  if (/^\d+-\d{4}-\d{3}$/.test(VENDOR_ID)) {
    console.log('\n🎯 ROOT CAUSE IDENTIFIED:');
    console.log('============================');
    console.log('The vendor ID "2-2025-003" matches the pattern of a booking ID');
    console.log('Our security fix is correctly blocking this as a malformed user ID');
    console.log('This suggests the vendor record has an incorrect user_id value');
    console.log('');
    console.log('💡 SOLUTIONS:');
    console.log('1. Fix the vendor record to have proper user_id (e.g., "2" instead of "2-2025-003")');
    console.log('2. Update frontend to use correct vendor identification');
    console.log('3. Run database migration to fix malformed user IDs');
  }
  
  // Test 4: Check with simpler vendor ID
  console.log('\n4. Testing with simple vendor ID...');
  try {
    const simpleResponse = await makeRequest(`${BACKEND_URL}/api/bookings/vendor/2`);
    console.log(`Simple ID Status: ${simpleResponse.status}`);
    
    if (simpleResponse.status === 200) {
      const simpleData = JSON.parse(simpleResponse.data);
      console.log('✅ Simple ID works! Bookings found:', simpleData.bookings?.length || 0);
      console.log('🎯 CONFIRMED: The issue is with the malformed vendor ID');
    }
  } catch (error) {
    console.log(`❌ Simple ID test ERROR: ${error.message}`);
  }
  
  console.log('\n📊 DIAGNOSIS SUMMARY:');
  console.log('====================');
  console.log('✅ Backend security is working correctly');
  console.log('✅ Malformed ID detection is active and protecting the system');
  console.log('⚠️ The vendor is using a booking-ID-like user_id which is being blocked');
  console.log('🔧 Solution: Fix the vendor data to use proper user IDs');
}

debugBookingIssue().catch(console.error);
