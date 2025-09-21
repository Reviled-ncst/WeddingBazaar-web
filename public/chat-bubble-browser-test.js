/**
 * Browser Console Test Script for Chat Bubble
 * Copy and paste this into the browser console on http://localhost:5173
 */

// Test authentication and create chat bubble
async function testChatBubble() {
  console.log('🎯 CHAT BUBBLE TEST');
  console.log('==================');
  
  // Step 1: Create test authentication
  console.log('1️⃣ Creating test authentication...');
  const testUser = {
    id: '2-2025-003',
    email: 'vendor@test.com',
    firstName: 'Test',
    lastName: 'Vendor',
    role: 'vendor'
  };
  
  localStorage.setItem('authData', JSON.stringify(testUser));
  localStorage.setItem('auth_token', 'test-token-' + Date.now());
  console.log('   ✅ Test auth created');
  
  // Step 2: Check current page state
  console.log('2️⃣ Checking page state...');
  const chatButton = document.querySelector('[aria-label="Open chat"]');
  const floatingButtons = document.querySelectorAll('button[class*="fixed"][class*="bottom"]');
  
  console.log(`   Chat buttons found: ${chatButton ? 1 : 0}`);
  console.log(`   Floating buttons found: ${floatingButtons.length}`);
  
  // Step 3: Force page refresh to trigger auth context
  console.log('3️⃣ Refreshing page to trigger authentication...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
  
  console.log('   💡 Page will reload in 1 second to activate auth context');
  console.log('   💡 After reload, look for pink chat button in bottom-right');
}

// Test conversation creation
function createTestConversation() {
  console.log('💬 CREATING TEST CONVERSATION');
  console.log('=============================');
  
  // Create a test conversation in localStorage
  const testConversation = {
    id: 'test-conversation-123',
    vendor: {
      name: 'Test Vendor',
      service: 'Wedding Photography',
      vendorId: '2-2025-003',
      rating: 4.8,
      verified: true,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400'
    },
    lastActivity: new Date(),
    unreadCount: 1,
    messages: [{
      id: 'msg-1',
      text: 'Hello! This is a test message.',
      sender: 'user',
      timestamp: new Date()
    }]
  };
  
  localStorage.setItem('wedding-bazaar-conversations', JSON.stringify([testConversation]));
  localStorage.setItem('wedding-bazaar-active-conversation', JSON.stringify(testConversation.id));
  localStorage.setItem('wedding-bazaar-chat-visible', JSON.stringify(false));
  localStorage.setItem('wedding-bazaar-chat-minimized', JSON.stringify(false));
  
  console.log('✅ Test conversation created in localStorage');
  console.log('💡 Refresh page to see chat button');
}

// Check current state
function checkCurrentState() {
  console.log('🔍 CURRENT STATE CHECK');
  console.log('======================');
  
  const authData = localStorage.getItem('authData');
  const conversations = localStorage.getItem('wedding-bazaar-conversations');
  const chatButton = document.querySelector('[aria-label="Open chat"]');
  
  console.log('Auth:', authData ? 'exists' : 'missing');
  console.log('Conversations:', conversations ? 'exists' : 'missing');
  console.log('Chat Button:', chatButton ? 'found' : 'not found');
  
  if (conversations) {
    try {
      const parsed = JSON.parse(conversations);
      console.log('Conversation count:', parsed.length);
    } catch (e) {
      console.log('Conversations data corrupted');
    }
  }
}

// Export functions for manual use
window.testChatBubble = testChatBubble;
window.createTestConversation = createTestConversation;
window.checkCurrentState = checkCurrentState;

console.log('🚀 CHAT BUBBLE TEST FUNCTIONS LOADED');
console.log('====================================');
console.log('Available functions:');
console.log('• testChatBubble() - Full test with auth and reload');
console.log('• createTestConversation() - Add test conversation');
console.log('• checkCurrentState() - Check current state');
console.log('');
console.log('💡 QUICK TEST: Run testChatBubble() to start');
