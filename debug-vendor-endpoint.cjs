const https = require('https');

console.log('🔍 DEBUGGING VENDOR BOOKING ENDPOINT');
console.log('===================================');

// Test the endpoint with different approaches
const tests = [
  {
    name: 'Test 1: Valid vendor ID (should work)',
    url: 'https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-003'
  },
  {
    name: 'Test 2: Simple numeric vendor ID (should work)', 
    url: 'https://weddingbazaar-web.onrender.com/api/bookings/vendor/2'
  },
  {
    name: 'Test 3: Check if endpoint exists',
    url: 'https://weddingbazaar-web.onrender.com/api/health'
  }
];

async function testEndpoint(test) {
  return new Promise((resolve) => {
    console.log(`\n🧪 ${test.name}`);
    console.log(`📡 URL: ${test.url}`);
    
    const request = https.get(test.url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        console.log(`✅ Status: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`📊 Response:`, jsonData);
          } catch (e) {
            console.log(`📝 Response (text):`, data.substring(0, 200) + '...');
          }
        } else if (response.statusCode === 403) {
          try {
            const jsonData = JSON.parse(data);
            console.log(`🚨 Blocked by security:`, jsonData);
          } catch (e) {
            console.log(`🚨 Security block:`, data);
          }
        } else {
          console.log(`⚠️ Unexpected response:`, data.substring(0, 200));
        }
        
        resolve({
          status: response.statusCode,
          data: data
        });
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Error:`, error.message);
      resolve({ error: error.message });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      console.log(`⏰ Request timeout`);
      resolve({ error: 'timeout' });
    });
  });
}

async function runTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  for (const test of tests) {
    await testEndpoint(test);
  }
  
  console.log('\n🎯 ANALYSIS');
  console.log('===========');
  console.log('If Test 1 returns 403, the security logic is too strict');
  console.log('If Test 2 returns 200, simple IDs work but complex ones don\'t');
  console.log('If Test 3 fails, there might be a deployment issue');
}

runTests();
