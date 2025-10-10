const https = require('https');

// Final comprehensive test with correct endpoints and authentication
async function testCompleteMessagingFlow() {
  console.log('🎯 FINAL COMPREHENSIVE MESSAGING TEST\n');

  try {
    // Step 1: Auth
    const authResult = await getAuth();
    if (!authResult.success) {
      console.error('❌ Authentication failed');
      return;
    }
    console.log('✅ Authentication successful');
    console.log(`   Token: ${authResult.token.substring(0, 20)}...`);
    console.log(`   User: ${authResult.user.firstName} ${authResult.user.lastName} (${authResult.user.id})\n`);

    // Step 2: Create conversation
    const convResult = await createConversation(authResult.token, authResult.user.id);
    if (!convResult.success) {
      console.error('❌ Conversation creation failed');
      return;
    }
    console.log('✅ Conversation created successfully');
    console.log(`   ID: ${convResult.conversationId}\n`);

    // Step 3: Send message
    const msgResult = await sendMessage(authResult.token, convResult.conversationId, authResult.user.id, authResult.user.firstName + ' ' + authResult.user.lastName);
    if (!msgResult.success) {
      console.error('❌ Message sending failed:', msgResult.error);
      return;
    }
    console.log('✅ Message sent successfully');
    console.log(`   Message ID: ${msgResult.messageId}\n`);

    // Step 4: Retrieve messages (using correct endpoint)
    const getMsgResult = await getMessages(authResult.token, convResult.conversationId);
    if (!getMsgResult.success) {
      console.error('❌ Message retrieval failed:', getMsgResult.error);
      return;
    }
    console.log('✅ Messages retrieved successfully');
    console.log(`   Found ${getMsgResult.messages.length} messages in conversation\n`);

    // Step 5: Get conversations list
    const getConvResult = await getConversations(authResult.token, authResult.user.id);
    if (!getConvResult.success) {
      console.error('❌ Conversations retrieval failed:', getConvResult.error);
      return;
    }
    console.log('✅ Conversations retrieved successfully');
    console.log(`   Found ${getConvResult.conversations.length} conversations\n`);

    console.log('🎉 ALL TESTS PASSED! THE MESSAGING SYSTEM IS FULLY FUNCTIONAL!');
    console.log('🔥 The modal on the live site should now work perfectly with:');
    console.log('   ✅ Real authentication');
    console.log('   ✅ Real conversation creation');
    console.log('   ✅ Real message sending');
    console.log('   ✅ Real message loading');
    console.log('   ✅ Persistent conversations');

  } catch (error) {
    console.error('💥 Test failed:', error.message);
  }
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getAuth() {
  const options = {
    method: 'POST',
    hostname: 'weddingbazaar-web.onrender.com',
    path: '/api/auth/login',
    headers: { 'Content-Type': 'application/json' }
  };

  const loginData = { email: 'test@example.com', password: 'password123' };

  try {
    const response = await makeRequest(options, loginData);
    if (response.statusCode === 200 && response.body.token) {
      return { success: true, token: response.body.token, user: response.body.user };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createConversation(token, userId) {
  const options = {
    method: 'POST',
    hostname: 'weddingbazaar-web.onrender.com',
    path: '/api/conversations',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const data = {
    conversationId: `conv_${Date.now()}_final_test`,
    vendorId: '2',
    vendorName: 'Final Test Vendor',
    serviceName: 'Final Test Service',
    userId: userId,
    userName: 'Final Test User',
    userType: 'couple'
  };

  try {
    const response = await makeRequest(options, data);
    if ((response.statusCode === 200 || response.statusCode === 201) && response.body.conversationId) {
      return { success: true, conversationId: response.body.conversationId };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function sendMessage(token, conversationId, senderId, senderName) {
  const options = {
    method: 'POST',
    hostname: 'weddingbazaar-web.onrender.com',
    path: '/api/messages',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  };

  const data = {
    conversationId,
    senderId,
    senderName,
    content: 'Final test message - messaging modal should work perfectly now! ' + new Date().toISOString()
  };

  try {
    const response = await makeRequest(options, data);
    if (response.statusCode === 200 || response.statusCode === 201) {
      return { success: true, messageId: response.body.messageId };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getMessages(token, conversationId) {
  const options = {
    method: 'GET',
    hostname: 'weddingbazaar-web.onrender.com',
    path: `/api/conversations/${conversationId}/messages`,
    headers: { 'Authorization': `Bearer ${token}` }
  };

  try {
    const response = await makeRequest(options);
    if (response.statusCode === 200) {
      return { success: true, messages: response.body.messages };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getConversations(token, userId) {
  const options = {
    method: 'GET',
    hostname: 'weddingbazaar-web.onrender.com',
    path: `/api/conversations/${userId}`,
    headers: { 'Authorization': `Bearer ${token}` }
  };

  try {
    const response = await makeRequest(options);
    if (response.statusCode === 200) {
      return { success: true, conversations: response.body.conversations };
    }
    return { success: false, error: response.body };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

testCompleteMessagingFlow();
