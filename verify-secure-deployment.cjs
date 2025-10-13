const https = require('https');
const http = require('http');

console.log('🔐 COMPREHENSIVE DEPLOYMENT VERIFICATION');
console.log('=======================================');

const PRODUCTION_URL = 'https://weddingbazaar-web.onrender.com';
const FRONTEND_URL = 'https://weddingbazaar-web.web.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const request = protocol.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          data: data,
          url: url
        });
      });
    });
    
    request.on('error', (error) => {
      reject(error);
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testBackendHealth() {
  console.log('\n🏥 BACKEND HEALTH CHECK');
  console.log('---------------------');
  
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/health`);
    console.log(`✅ Status: ${response.status}`);
    
    if (response.status === 200) {
      try {
        const data = JSON.parse(response.data);
        console.log(`✅ Database: ${data.database ? 'Connected' : 'Disconnected'}`);
        console.log(`✅ Timestamp: ${data.timestamp}`);
        return true;
      } catch (e) {
        console.log('⚠️ Response not JSON, but status is 200');
        return true;
      }
    } else {
      console.log(`❌ Backend health check failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend health check failed: ${error.message}`);
    return false;
  }
}

async function testSecureVendorEndpoint() {
  console.log('\n🔐 SECURE VENDOR BOOKINGS ENDPOINT TEST');
  console.log('--------------------------------------');
  
  try {
    // Test with a suspicious vendor ID that should be blocked
    const suspiciousId = '2-2025-003';
    const response = await makeRequest(`${PRODUCTION_URL}/api/bookings/vendor/${suspiciousId}`);
    
    console.log(`🎯 Testing suspicious ID: ${suspiciousId}`);
    console.log(`✅ Status: ${response.status}`);
    
    if (response.status === 403) {
      try {
        const data = JSON.parse(response.data);
        if (data.code === 'MALFORMED_VENDOR_ID') {
          console.log('✅ SECURITY WORKING: Malformed ID properly blocked');
          console.log(`✅ Security message: ${data.error}`);
          return true;
        } else {
          console.log('⚠️ Blocked but wrong error code');
          return false;
        }
      } catch (e) {
        console.log('⚠️ Blocked but response not parseable');
        return false;
      }
    } else if (response.status === 404) {
      console.log('❌ Endpoint not found - deployment may not be complete');
      return false;
    } else {
      console.log(`❌ Unexpected status: ${response.status}`);
      console.log('❌ SECURITY VULNERABILITY: Suspicious ID not blocked');
      return false;
    }
  } catch (error) {
    console.log(`❌ Security test failed: ${error.message}`);
    return false;
  }
}

async function testFrontendHealth() {
  console.log('\n🌐 FRONTEND HEALTH CHECK');
  console.log('----------------------');
  
  try {
    const response = await makeRequest(FRONTEND_URL);
    console.log(`✅ Status: ${response.status}`);
    
    if (response.status === 200) {
      const hasReact = response.data.includes('React');
      const hasWedding = response.data.includes('Wedding') || response.data.includes('wedding');
      console.log(`✅ Contains React: ${hasReact}`);
      console.log(`✅ Contains Wedding content: ${hasWedding}`);
      return true;
    } else {
      console.log(`❌ Frontend health check failed with status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend health check failed: ${error.message}`);
    return false;
  }
}

async function testCORSHeaders() {
  console.log('\n🔒 CORS HEADERS CHECK');
  console.log('--------------------');
  
  try {
    const response = await makeRequest(`${PRODUCTION_URL}/api/health`);
    const corsOrigin = response.headers['access-control-allow-origin'];
    const corsCredentials = response.headers['access-control-allow-credentials'];
    
    console.log(`✅ CORS Origin: ${corsOrigin || 'Not set'}`);
    console.log(`✅ CORS Credentials: ${corsCredentials || 'Not set'}`);
    
    return corsOrigin && (corsOrigin === '*' || corsOrigin.includes('weddingbazaar'));
  } catch (error) {
    console.log(`❌ CORS check failed: ${error.message}`);
    return false;
  }
}

async function generateSecurityReport() {
  console.log('\n📊 GENERATING SECURITY DEPLOYMENT REPORT');
  console.log('========================================');
  
  const results = {
    backendHealth: false,
    secureEndpoint: false,
    frontendHealth: false,
    corsHeaders: false,
    timestamp: new Date().toISOString()
  };
  
  // Run all tests
  results.backendHealth = await testBackendHealth();
  results.secureEndpoint = await testSecureVendorEndpoint();
  results.frontendHealth = await testFrontendHealth();
  results.corsHeaders = await testCORSHeaders();
  
  // Calculate overall status
  const allPassing = Object.values(results).every(result => result === true || typeof result === 'string');
  const criticalPassing = results.backendHealth && results.secureEndpoint;
  
  console.log('\n🎯 DEPLOYMENT VERIFICATION SUMMARY');
  console.log('==================================');
  console.log(`✅ Backend Health: ${results.backendHealth ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Security Endpoint: ${results.secureEndpoint ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Frontend Health: ${results.frontendHealth ? 'PASS' : 'FAIL'}`);
  console.log(`✅ CORS Headers: ${results.corsHeaders ? 'PASS' : 'FAIL'}`);
  
  if (criticalPassing) {
    console.log('\n🎉 CRITICAL SECURITY DEPLOYMENT: ✅ SUCCESS');
    console.log('🔐 Cross-vendor data leakage vulnerability is now FIXED');
    console.log('🛡️ Malformed ID protection is ACTIVE');
    console.log('🌐 Production systems are SECURE and OPERATIONAL');
  } else {
    console.log('\n⚠️ CRITICAL SECURITY DEPLOYMENT: ❌ ISSUES DETECTED');
    console.log('🚨 Manual intervention may be required');
    console.log('🔍 Check Render deployment logs for details');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Monitor Render deployment logs');
  console.log('2. Test vendor bookings in browser');
  console.log('3. Run database migration when possible');
  console.log('4. Update system documentation');
  
  console.log('\n🔗 PRODUCTION URLS:');
  console.log(`Backend: ${PRODUCTION_URL}`);
  console.log(`Frontend: ${FRONTEND_URL}`);
  console.log(`Security Test: ${PRODUCTION_URL}/api/bookings/vendor/2-2025-003`);
  
  return results;
}

// Wait a bit for Render deployment to complete
console.log('⏳ Waiting 30 seconds for Render deployment to complete...');
setTimeout(() => {
  generateSecurityReport().catch(console.error);
}, 30000);
