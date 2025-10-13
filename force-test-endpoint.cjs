// FORCE TEST VENDOR ENDPOINT WITH CACHE BUSTING
console.log('🔍 FORCE TESTING VENDOR ENDPOINT (CACHE BUSTING)');
console.log('===============================================');

const https = require('https');

async function testWithCacheBusting() {
  // Add cache busting parameter
  const timestamp = Date.now();
  const url = `https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-003?_t=${timestamp}`;
  
  console.log(`📡 Testing: ${url}`);
  
  return new Promise((resolve) => {
    const request = https.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'User-Agent': 'NodeJS-Test-Client'
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        console.log(`✅ Status: ${response.statusCode}`);
        console.log(`📊 Headers:`, response.headers);
        
        try {
          const jsonData = JSON.parse(data);
          console.log(`📋 Response:`, JSON.stringify(jsonData, null, 2));
          
          if (response.statusCode === 403 && jsonData.code === 'MALFORMED_VENDOR_ID') {
            console.log('🚨 STILL BLOCKED - Old deployment logic is active');
            console.log('💡 Render may need more time to deploy or there\'s a different issue');
          } else if (response.statusCode === 200) {
            console.log('🎉 SUCCESS - Security fix is working!');
          }
          
        } catch (e) {
          console.log(`📝 Raw response:`, data);
        }
        
        resolve();
      });
    });
    
    request.on('error', (error) => {
      console.log(`❌ Error:`, error.message);
      resolve();
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      console.log(`⏰ Request timeout`);
      resolve();
    });
  });
}

testWithCacheBusting();
