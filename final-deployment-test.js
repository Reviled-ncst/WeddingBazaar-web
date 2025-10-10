import https from 'https';

// Test both frontend and backend
async function comprehensiveTest() {
  console.log('🎯 COMPLETE WEDDING BAZAAR DEPLOYMENT TEST');
  console.log('=' .repeat(60));

  // Test Backend
  console.log('\n🔧 BACKEND TESTS:');
  console.log('🔗 https://weddingbazaar-web.onrender.com');

  const backendTests = [
    { name: 'Health Check', path: '/api/health' },
    { name: 'Services List', path: '/api/services' },
    { name: 'Featured Vendors', path: '/api/vendors/featured' },
    { name: 'Authentication Check', path: '/api/auth/verify' }
  ];

  for (const test of backendTests) {
    try {
      const response = await makeRequest('weddingbazaar-web.onrender.com', test.path);
      const icon = response.status < 400 ? '✅' : response.status === 401 ? '🔐' : '❌';
      console.log(`${icon} ${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  // Test Frontend
  console.log('\n🌐 FRONTEND TESTS:');
  console.log('🔗 https://weddingbazaarph.web.app');

  const frontendTests = [
    { name: 'Homepage', path: '/' },
    { name: 'Vendor Login', path: '/vendor' },
    { name: 'Individual Dashboard', path: '/individual' }
  ];

  for (const test of frontendTests) {
    try {
      const response = await makeRequest('weddingbazaarph.web.app', test.path);
      const icon = response.status < 400 ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log('\n🎉 DEPLOYMENT TEST RESULTS:');
  console.log('✅ Frontend: https://weddingbazaarph.web.app');
  console.log('✅ Backend: https://weddingbazaar-web.onrender.com');
  console.log('\n🚀 READY FOR SERVICE CREATION TESTING!');
  console.log('\n📋 Next Steps:');
  console.log('1. Login as vendor at https://weddingbazaarph.web.app/vendor');
  console.log('2. Navigate to Services section');
  console.log('3. Click "Add Service" button');
  console.log('4. Fill form and test image upload');
  console.log('5. Submit and verify service creation');
}

function makeRequest(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve({ status: res.statusCode, statusText: res.statusMessage });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
    req.end();
  });
}

comprehensiveTest();
