// Comprehensive backend diagnostic
const https = require('https');

const BASE_URL = 'weddingbazaar-web.onrender.com';

function makeRequest(path, method = 'GET', body = null, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : null;
    
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData && { 'Content-Length': Buffer.byteLength(postData) })
      }
    };

    console.log(`\n🔍 Testing: ${method} ${path}`);
    const startTime = Date.now();

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        console.log(`   Status: ${res.statusCode} (${duration}ms)`);
        
        if (res.statusCode !== 200) {
          console.log(`   ❌ Error Response: ${data.substring(0, 200)}...`);
        } else {
          try {
            const parsed = JSON.parse(data);
            console.log(`   ✅ Success: ${JSON.stringify(parsed).substring(0, 100)}...`);
          } catch (e) {
            console.log(`   ✅ Success: ${data.substring(0, 100)}...`);
          }
        }
        
        resolve({ status: res.statusCode, data, duration });
      });
    });

    req.on('error', (err) => {
      console.log(`   💥 Request Error: ${err.message}`);
      reject(err);
    });

    // Set timeout
    req.setTimeout(timeout, () => {
      console.log(`   ⏰ Request timed out after ${timeout}ms`);
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function runDiagnostics() {
  console.log('🚨 BACKEND DIAGNOSTIC REPORT');
  console.log('============================');
  console.log(`Backend: https://${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);

  const tests = [
    // Basic health check
    { path: '/api/health', method: 'GET' },
    
    // Service endpoints
    { path: '/api/services', method: 'GET' },
    
    // Vendor endpoints
    { path: '/api/vendors/featured', method: 'GET' },
    { path: '/api/vendors', method: 'GET' },
    
    // Authentication endpoints
    { 
      path: '/api/auth/login', 
      method: 'POST', 
      body: { email: 'test@example.com', password: 'password123' }
    },
    
    // Test registration with valid user_type
    { 
      path: '/api/auth/register', 
      method: 'POST', 
      body: { 
        email: `diag-${Date.now()}@example.com`, 
        password: 'test123', 
        first_name: 'Diag',
        last_name: 'Test',
        user_type: 'couple'
      }
    },
    
    // Service creation test
    { 
      path: '/api/services', 
      method: 'POST', 
      body: {
        name: `Diagnostic Service ${Date.now()}`,
        category: 'photography',
        description: 'Diagnostic test service',
        price: 999,
        location: 'Test Location',
        images: ['https://example.com/test.jpg'],
        vendor_id: 'diag-vendor'
      }
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const test of tests) {
    try {
      const result = await makeRequest(test.path, test.method, test.body);
      if (result.status === 200 || result.status === 201) {
        successCount++;
      } else {
        errorCount++;
      }
    } catch (error) {
      console.log(`   💥 Test failed: ${error.message}`);
      errorCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('=====================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log(`📈 Success Rate: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);

  if (errorCount > 0) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED');
    console.log('The backend appears to have multiple failing endpoints.');
    console.log('This could indicate:');
    console.log('- Database connection issues');
    console.log('- Server deployment problems');
    console.log('- Code errors in recent changes');
  } else {
    console.log('\n✅ ALL SYSTEMS OPERATIONAL');
  }
}

runDiagnostics().catch(console.error);
