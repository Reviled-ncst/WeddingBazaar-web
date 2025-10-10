// Simple authentication test
const https = require('https');

function testAuth() {
  console.log('🔍 Testing Authentication Fix...');
  
  // Test registration
  const testUser = {
    email: `auth-test-${Date.now()}@example.com`,
    password: 'testpassword123',
    first_name: 'Auth',
    last_name: 'Test',
    user_type: 'couple'
  };
  
  const postData = JSON.stringify(testUser);
  
  const options = {
    hostname: 'weddingbazaar-web.onrender.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`Registration Status: ${res.statusCode}`);
      try {
        const jsonData = JSON.parse(data);
        console.log('Registration Response:', jsonData);
        
        if (res.statusCode === 200 && jsonData.success) {
          console.log('✅ Registration successful! Now testing login...');
          
          // Test login with the same credentials
          setTimeout(() => testLogin(testUser.email, testUser.password), 1000);
        } else {
          console.log('❌ Registration failed');
        }
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Registration Error:', e.message);
  });
  
  req.write(postData);
  req.end();
}

function testLogin(email, password) {
  const loginData = JSON.stringify({ email, password });
  
  const options = {
    hostname: 'weddingbazaar-web.onrender.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`\nLogin Status: ${res.statusCode}`);
      try {
        const jsonData = JSON.parse(data);
        console.log('Login Response:', jsonData);
        
        if (res.statusCode === 200 && jsonData.success) {
          console.log('🎉 LOGIN WORKS! Authentication is fixed!');
          console.log(`Token received: ${jsonData.token ? 'Yes' : 'No'}`);
        } else {
          console.log('❌ Login failed');
        }
      } catch (e) {
        console.log('Response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('Login Error:', e.message);
  });
  
  req.write(loginData);
  req.end();
}

// Start the test
testAuth();
