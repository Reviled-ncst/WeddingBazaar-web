const https = require('https');

// Test what's currently working in the backend
const endpoints = [
  { path: '/api/health', method: 'GET' },
  { path: '/api/services', method: 'GET' },
  { path: '/api/vendors/featured', method: 'GET' },
  { path: '/api/auth/verify', method: 'POST' },
  { path: '/api/auth/login', method: 'POST', data: { email: 'test', password: 'test' } }
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'weddingbazaar-web.onrender.com',
      port: 443,
      path: endpoint.path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log(`\n🔍 Testing ${endpoint.method} ${endpoint.path}...`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const status = res.statusCode;
        const working = status >= 200 && status < 300;
        
        console.log(`${working ? '✅' : '❌'} Status: ${status}`);
        
        if (working) {
          try {
            const parsed = JSON.parse(data);
            if (parsed.version) console.log(`   Version: ${parsed.version}`);
            if (parsed.services) console.log(`   Services: ${parsed.services.length} found`);
            if (parsed.vendors) console.log(`   Vendors: ${parsed.vendors.length} found`);
            if (parsed.success !== undefined) console.log(`   Success: ${parsed.success}`);
          } catch (e) {
            console.log(`   Response: ${data.substring(0, 100)}...`);
          }
        } else {
          console.log(`   Error: ${data.substring(0, 200)}`);
        }
        
        resolve({ 
          endpoint: endpoint.path, 
          method: endpoint.method,
          status, 
          working,
          response: data 
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Network Error: ${err.message}`);
      resolve({ endpoint: endpoint.path, method: endpoint.method, status: 'error', working: false });
    });

    if (endpoint.data) {
      req.write(JSON.stringify(endpoint.data));
    }
    req.end();
  });
}

async function checkWorkingAreas() {
  console.log('🔍 CHECKING CURRENTLY WORKING BACKEND AREAS...\n');
  
  const results = [];
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 SUMMARY OF WORKING AREAS:');
  const working = results.filter(r => r.working);
  const broken = results.filter(r => !r.working);
  
  if (working.length > 0) {
    console.log(`\n✅ WORKING (${working.length}):`);
    working.forEach(r => console.log(`   ${r.method} ${r.endpoint}`));
  }
  
  if (broken.length > 0) {
    console.log(`\n❌ BROKEN (${broken.length}):`);
    broken.forEach(r => console.log(`   ${r.method} ${r.endpoint} (${r.status})`));
  }
  
  return { working, broken };
}

checkWorkingAreas();
