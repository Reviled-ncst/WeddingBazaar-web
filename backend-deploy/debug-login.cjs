// Test login to see what's happening
const https = require('https');

const BASE_URL = 'https://weddingbazaar-web.onrender.com';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function debugLogin() {
  console.log('🔍 DEBUG: Testing Login Process');
  console.log('=====================================\n');

  // First, let's see what users exist in the database
  console.log('1️⃣ Getting existing users (first let\'s check if any exist)...');
  
  // Test with various common test credentials
  const testCredentials = [
    { email: 'test@example.com', password: 'password123' },
    { email: 'admin@example.com', password: 'admin123' },
    { email: 'user@test.com', password: 'test123' },
    { email: 'demo@wedding.com', password: 'demo123' }
  ];

  for (const creds of testCredentials) {
    console.log(`\n2️⃣ Testing login with: ${creds.email} / ${creds.password}`);
    
    try {
      const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: creds
      });
      
      console.log(`   Status: ${loginResult.status}`);
      console.log(`   Response:`, loginResult.data);
      
      if (loginResult.status === 200) {
        console.log('   ✅ Login successful!');
        break;
      } else if (loginResult.status === 401) {
        console.log('   ❌ Invalid credentials');
      } else {
        console.log('   ⚠️ Unexpected response');
      }
      
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
    }
  }

  // Let's also try to register a test user and then login
  console.log('\n3️⃣ Creating a test user for login testing...');
  
  const testUser = {
    email: `debug-${Date.now()}@example.com`,
    password: 'debug123',
    first_name: 'Debug',
    last_name: 'User',
    user_type: 'couple'
  };
  
  try {
    const registerResult = await makeRequest(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      body: testUser
    });
    
    console.log(`   Registration Status: ${registerResult.status}`);
    console.log(`   Registration Response:`, registerResult.data);
    
    if (registerResult.status === 200) {
      console.log('   ✅ User created successfully!');
      
      // Now try to login with the new user
      console.log('\n4️⃣ Testing login with newly created user...');
      
      const loginResult = await makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: {
          email: testUser.email,
          password: testUser.password
        }
      });
      
      console.log(`   Login Status: ${loginResult.status}`);
      console.log(`   Login Response:`, loginResult.data);
      
      if (loginResult.status === 200) {
        console.log('   ✅ Login with new user successful!');
        console.log(`   Token received: ${loginResult.data.token ? 'Yes' : 'No'}`);
      } else {
        console.log('   ❌ Login with new user failed');
      }
    }
    
  } catch (error) {
    console.log(`   💥 Registration Error: ${error.message}`);
  }
}

debugLogin().catch(console.error);
