const https = require('https');

const API_BASE = 'https://weddingbazaar-web.onrender.com';

// Test messaging functionality end-to-end
async function testMessagingFlow() {
  console.log('🧪 Testing Production Messaging Flow...\n');

  try {
    // Step 1: Test authentication
    console.log('1️⃣ Testing Authentication...');
    const authResult = await testAuth();
    if (!authResult.success) {
      console.error('❌ Authentication failed - cannot proceed with messaging tests');
      return;
    }
    console.log('✅ Authentication successful\n');

    // Step 2: Test conversation creation
    console.log('2️⃣ Testing Conversation Creation...');
    const conversationResult = await testCreateConversation(authResult.token);
    if (!conversationResult.success) {
      console.error('❌ Conversation creation failed');
      return;
    }
    console.log('✅ Conversation created:', conversationResult.conversationId, '\n');

    // Step 3: Test message sending
    console.log('3️⃣ Testing Message Sending...');
    const messageResult = await testSendMessage(authResult.token, conversationResult.conversationId);
    if (!messageResult.success) {
      console.error('❌ Message sending failed');
      return;
    }
    console.log('✅ Message sent successfully\n');

    // Step 4: Test message retrieval
    console.log('4️⃣ Testing Message Retrieval...');
    const retrieveResult = await testGetMessages(authResult.token, conversationResult.conversationId);
    if (!retrieveResult.success) {
      console.error('❌ Message retrieval failed');
      return;
    }
    console.log('✅ Messages retrieved successfully\n');

    console.log('🎉 All messaging tests passed! The backend is working correctly.');
    console.log('🔍 Issue is likely in the frontend modal implementation.');

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
    console.log('   📡 Auth Response Status:', response.statusCode);
    console.log('   📄 Auth Response Body:', JSON.stringify(response.body, null, 2));

    if (response.statusCode === 200 && response.body.token) {
      return { success: true, token: response.body.token, user: response.body.user };
    }
    return { success: false, error: response.body };
  } catch (error) {
    console.error('   ❌ Auth Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testCreateConversation(token) {
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
    conversationId: `conv_${Date.now()}_test`,
    vendorId: '2', // Test vendor ID
    vendorName: 'Test Vendor',
    serviceName: 'Photography Service Test',
    userId: '2-2025-001', // Use the authenticated user ID
    userName: 'Test User',
    userType: 'couple'
  };

  try {
    const response = await makeRequest(options, conversationData);
    console.log('   📡 Conversation Response Status:', response.statusCode);
    console.log('   📄 Conversation Response Body:', JSON.stringify(response.body, null, 2));

    if ((response.statusCode === 201 || response.statusCode === 200) && response.body.conversationId) {
      return { success: true, conversationId: response.body.conversationId };
    }
    return { success: false, error: response.body };
  } catch (error) {
    console.error('   ❌ Conversation Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testSendMessage(token, conversationId) {
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
    senderId: '2-2025-001',
    senderName: 'Test User',
    content: 'Test message from modal - ' + new Date().toISOString()
  };

  try {
    const response = await makeRequest(options, messageData);
    console.log('   📡 Message Send Response Status:', response.statusCode);
    console.log('   📄 Message Send Response Body:', JSON.stringify(response.body, null, 2));

    if (response.statusCode === 200 || response.statusCode === 201) {
      return { success: true, messageId: response.body.messageId };
    }
    return { success: false, error: response.body };
  } catch (error) {
    console.error('   ❌ Message Send Error:', error.message);
    return { success: false, error: error.message };
  }
}

async function testGetMessages(token, conversationId) {
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
    console.log('   📡 Message Get Response Status:', response.statusCode);
    console.log('   📄 Message Get Response Body:', JSON.stringify(response.body, null, 2));

    if (response.statusCode === 200) {
      return { success: true, messages: response.body };
    }
    return { success: false, error: response.body };
  } catch (error) {
    console.error('   ❌ Message Get Error:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testMessagingFlow();
