const https = require('https');

const API_BASE = 'https://weddingbazaar-web.onrender.com';

// Test authenticated messaging functionality
async function testAuthenticatedMessaging() {
  console.log('🔐 Testing Authenticated Messaging Flow...\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Getting Authentication Token...');
    const authResult = await testAuth();
    if (!authResult.success) {
      console.error('❌ Authentication failed - cannot proceed');
      return;
    }
    console.log('✅ Token received:', authResult.token);
    console.log('✅ User ID:', authResult.user.id, '\n');

    // Step 2: Test authenticated conversation creation
    console.log('2️⃣ Testing Authenticated Conversation Creation...');
    const conversationResult = await testCreateConversationAuth(authResult.token, authResult.user.id);
    if (!conversationResult.success) {
      console.error('❌ Authenticated conversation creation failed');
      return;
    }
    console.log('✅ Authenticated conversation created:', conversationResult.conversationId, '\n');

    // Step 3: Test authenticated message sending
    console.log('3️⃣ Testing Authenticated Message Sending...');
    const messageResult = await testSendMessageAuth(authResult.token, conversationResult.conversationId, authResult.user.id, authResult.user.firstName + ' ' + authResult.user.lastName);
    if (!messageResult.success) {
      console.error('❌ Authenticated message sending failed:', messageResult.error);
      return;
    }
    console.log('✅ Authenticated message sent successfully\n');

    // Step 4: Test authenticated message retrieval
    console.log('4️⃣ Testing Authenticated Message Retrieval...');
    const retrieveResult = await testGetMessagesAuth(authResult.token, conversationResult.conversationId);
    if (!retrieveResult.success) {
      console.error('❌ Authenticated message retrieval failed:', retrieveResult.error);
      return;
    }
    console.log('✅ Authenticated messages retrieved successfully\n');

    console.log('🎉 ALL AUTHENTICATED MESSAGING TESTS PASSED!');
    console.log('🔥 The messaging modal should now work perfectly on the live site!');

  } catch (error) {
    console.error('💥 Unexpected error:', error.message);
  }
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: parsed, headers: res.headers });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAuth() {
  const options = {
    method: 'POST',
    hostname: 'weddingbazaar-web.onrender.com',
    path: '/api/auth/login',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const loginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  try {
    const response = await makeRequest(options, loginData);
    console.log('   📡 Auth Status:', response.statusCode);

    if (response.statusCode === 200 && response.body.token) {
      return { success: true, token: response.body.token, user: response.body.user };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testCreateConversationAuth(token, userId) {
  const options = {
    method: 'POST',
    hostname: 'weddingbazaar-web.onrender.com',
    path: '/api/conversations',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const conversationData = {
    conversationId: `conv_${Date.now()}_auth_test`,
    vendorId: '2',
    vendorName: 'Test Vendor',
    serviceName: 'Authenticated Photography Test',
    userId: userId,
    userName: 'Test User',
    userType: 'couple'
  };

  try {
    const response = await makeRequest(options, conversationData);
    console.log('   📡 Conversation Status:', response.statusCode);
    console.log('   📄 Response:', JSON.stringify(response.body, null, 2));

    if ((response.statusCode === 200 || response.statusCode === 201) && response.body.conversationId) {
      return { success: true, conversationId: response.body.conversationId };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testSendMessageAuth(token, conversationId, senderId, senderName) {
  const options = {
    method: 'POST',
    hostname: 'weddingbazaar-web.onrender.com',
    path: '/api/messages',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const messageData = {
    conversationId: conversationId,
    senderId: senderId,
    senderName: senderName,
    content: 'Authenticated test message - ' + new Date().toISOString()
  };

  try {
    const response = await makeRequest(options, messageData);
    console.log('   📡 Message Send Status:', response.statusCode);
    console.log('   📄 Response:', JSON.stringify(response.body, null, 2));

    if (response.statusCode === 200 || response.statusCode === 201) {
      return { success: true, messageId: response.body.messageId };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testGetMessagesAuth(token, conversationId) {
  const options = {
    method: 'GET',
    hostname: 'weddingbazaar-web.onrender.com',
    path: `/api/messages/${conversationId}`,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  try {
    const response = await makeRequest(options);
    console.log('   📡 Message Get Status:', response.statusCode);
    console.log('   📄 Response:', JSON.stringify(response.body, null, 2));

    if (response.statusCode === 200) {
      return { success: true, messages: response.body };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Run the test
testAuthenticatedMessaging();
