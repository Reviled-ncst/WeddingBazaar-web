// Debug vendor registration to find the exact issue
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com';

async function testVendorRegistration() {
  console.log('🧪 Testing vendor registration...');
  
  const testData = {
    first_name: 'Test',
    last_name: 'Vendor',
    email: `testvendor${Date.now()}@example.com`,
    password: 'firebase_auth_user',
    role: 'vendor',
    phone: '555-0123',
    business_name: 'Test Wedding Services',
    business_type: 'photographer',
    location: 'New York, NY'
  };
  
  console.log('📤 Sending vendor registration data:');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📊 Parsed response:', responseJson);
    } catch (parseError) {
      console.log('⚠️ Could not parse response as JSON');
    }
    
    if (response.ok) {
      console.log('✅ Vendor registration successful!');
    } else {
      console.log('❌ Vendor registration failed');
    }
    
  } catch (error) {
    console.error('💥 Network error:', error);
  }
}

// Test regular user registration too
async function testCoupleRegistration() {
  console.log('🧪 Testing couple registration...');
  
  const testData = {
    first_name: 'Test',
    last_name: 'Couple',
    email: `testcouple${Date.now()}@example.com`,
    password: 'firebase_auth_user',
    role: 'couple',
    phone: '555-0124'
  };
  
  console.log('📤 Sending couple registration data:');
  console.log(JSON.stringify(testData, null, 2));
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Response status:', response.status);
    console.log('📊 Response status text:', response.statusText);
    
    const responseText = await response.text();
    console.log('📊 Raw response:', responseText);
    
    try {
      const responseJson = JSON.parse(responseText);
      console.log('📊 Parsed response:', responseJson);
    } catch (parseError) {
      console.log('⚠️ Could not parse response as JSON');
    }
    
    if (response.ok) {
      console.log('✅ Couple registration successful!');
    } else {
      console.log('❌ Couple registration failed');
    }
    
  } catch (error) {
    console.error('💥 Network error:', error);
  }
}

// Run both tests
async function runTests() {
  console.log('🚀 Starting registration debug tests...\n');
  
  await testCoupleRegistration();
  console.log('\n' + '='.repeat(50) + '\n');
  await testVendorRegistration();
  
  console.log('\n🎯 Debug tests completed!');
}

runTests();
