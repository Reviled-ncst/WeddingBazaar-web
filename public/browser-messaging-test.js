// BROWSER TEST FOR MESSAGING SYSTEM
// Open browser console and run this script

console.log('🔍 TESTING MESSAGING SYSTEM IN BROWSER');
console.log('======================================');

async function testMessagingInBrowser() {
  try {
    // Test 1: Check if messaging API service is properly imported
    console.log('\n1️⃣ Testing messaging API service...');
    
    // Test API URL construction
    const testApiUrl = import.meta.env.VITE_API_URL || 'https://weddingbazaar-web.onrender.com';
    const apiBase = `${testApiUrl}/api`;
    console.log('API Base URL:', apiBase);
    
    // Test 2: Check if we can make a request to the conversations endpoint
    console.log('\n2️⃣ Testing conversations endpoint...');
    try {
      const response = await fetch(`${apiBase}/conversations`);
      console.log('Conversations response status:', response.status);
      
      if (response.status === 401) {
        console.log('✅ Endpoint exists but requires authentication (expected)');
      } else if (response.status === 404) {
        console.log('❌ Endpoint not found');
        const errorData = await response.json();
        console.log('Error details:', errorData);
      } else {
        console.log('Response:', await response.json());
      }
    } catch (error) {
      console.error('Request error:', error);
    }
    
    // Test 3: Check if authentication context is working
    console.log('\n3️⃣ Testing authentication context...');
    
    // Check if auth data is in localStorage
    const authData = localStorage.getItem('authData');
    console.log('Auth data in localStorage:', authData ? 'Present' : 'Not found');
    
    if (authData) {
      try {
        const parsedAuthData = JSON.parse(authData);
        console.log('Parsed auth data:', parsedAuthData);
        
        // Test authenticated request
        const authResponse = await fetch(`${apiBase}/conversations`, {
          headers: {
            'Authorization': `Bearer ${parsedAuthData.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Authenticated conversations response:', authResponse.status);
        const authResult = await authResponse.json();
        console.log('Authenticated response data:', authResult);
        
      } catch (error) {
        console.error('Auth test error:', error);
      }
    }
    
    // Test 4: Check if GlobalMessengerContext is working
    console.log('\n4️⃣ Testing GlobalMessengerContext...');
    
    // Look for global messenger context in the DOM/React
    const contextElements = document.querySelectorAll('[data-testid*="messenger"], [class*="messenger"], [class*="chat"]');
    console.log('Messenger-related elements found:', contextElements.length);
    
    contextElements.forEach((el, index) => {
      console.log(`Element ${index + 1}:`, el.className, el.tagName);
    });
    
    // Test 5: Check floating chat button
    console.log('\n5️⃣ Testing floating chat button...');
    
    const chatButtons = document.querySelectorAll('[class*="floating"], [class*="chat-button"], button[class*="chat"]');
    console.log('Chat button elements found:', chatButtons.length);
    
    chatButtons.forEach((btn, index) => {
      console.log(`Chat button ${index + 1}:`, btn.className, btn.textContent);
    });
    
  } catch (error) {
    console.error('❌ Browser test error:', error);
  }
}

// Auto-run the test
testMessagingInBrowser();

// Also provide manual functions for testing
window.testMessaging = testMessagingInBrowser;

window.simulateLogin = async function() {
  console.log('🔐 Simulating login for testing...');
  
  const testUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'couple',
    token: 'test-token-123'
  };
  
  localStorage.setItem('authData', JSON.stringify(testUser));
  console.log('✅ Test user logged in:', testUser);
  
  // Trigger a page refresh to update auth context
  console.log('Refresh the page to see auth changes');
};

window.clearAuth = function() {
  localStorage.removeItem('authData');
  console.log('🚪 Auth data cleared');
};

console.log('\n🎯 AVAILABLE FUNCTIONS:');
console.log('- testMessaging() - Run full messaging test');
console.log('- simulateLogin() - Simulate user login');
console.log('- clearAuth() - Clear authentication data');

export {};
