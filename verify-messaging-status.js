const API_BASE = 'https://weddingbazaar-web.onrender.com/api';

async function testMessagingEndpoints() {
  console.log('🔍 TESTING MESSAGING ENDPOINTS');
  console.log('==============================');

  try {
    // Test 1: Check if messaging endpoints exist
    console.log('\n1️⃣ Testing /api/health endpoint...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    console.log('✅ Health check:', healthResponse.status, await healthResponse.text());

    // Test 2: Test vendor login to get token
    console.log('\n2️⃣ Testing vendor login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (!loginData.success) {
      console.log('❌ Login failed, testing with different credentials...');
      
      // Try alternate login
      const altLoginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@vendor.com',
          password: 'password123'
        })
      });
      
      const altLoginData = await altLoginResponse.json();
      console.log('Alternate login response:', altLoginData);
    }

    // Test 3: Check conversations endpoint without auth
    console.log('\n3️⃣ Testing conversations endpoint (no auth)...');
    const conversationsResponse = await fetch(`${API_BASE}/messaging/conversations`);
    console.log('Conversations status:', conversationsResponse.status);
    const conversationsData = await conversationsResponse.text();
    console.log('Conversations response:', conversationsData);

    // Test 4: Check if vendor 2-2025-003 exists
    console.log('\n4️⃣ Testing vendor endpoint...');
    const vendorResponse = await fetch(`${API_BASE}/vendors/2-2025-003`);
    console.log('Vendor response status:', vendorResponse.status);
    if (vendorResponse.ok) {
      const vendorData = await vendorResponse.json();
      console.log('Vendor data:', vendorData);
    } else {
      console.log('Vendor response:', await vendorResponse.text());
    }

    // Test 5: Check featured vendors
    console.log('\n5️⃣ Testing featured vendors...');
    const featuredResponse = await fetch(`${API_BASE}/vendors/featured`);
    console.log('Featured vendors status:', featuredResponse.status);
    if (featuredResponse.ok) {
      const featuredData = await featuredResponse.json();
      console.log('Featured vendors count:', featuredData.length);
      console.log('First vendor:', featuredData[0]);
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

async function checkFrontendStatus() {
  console.log('\n🌐 CHECKING FRONTEND STATUS');
  console.log('===========================');

  try {
    const frontendResponse = await fetch('https://weddingbazaar-web.web.app');
    console.log('Frontend status:', frontendResponse.status);
    console.log('Frontend accessible:', frontendResponse.ok ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Frontend error:', error.message);
  }
}

async function main() {
  await testMessagingEndpoints();
  await checkFrontendStatus();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('==============');
  console.log('1. Open browser to: https://weddingbazaar-web.web.app');
  console.log('2. Navigate to vendor page: /vendor/messages');
  console.log('3. Check if messaging interface loads');
  console.log('4. Look for floating chat button');
  console.log('5. Test message sending functionality');
}

main().catch(console.error);
