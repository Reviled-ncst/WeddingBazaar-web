/**
 * Chat Bubble Verification Test
 * Run this in browser console to check chat bubble status
 */

console.log('🔍 CHAT BUBBLE VERIFICATION TEST');
console.log('================================');

// Check if chat button is in the DOM
const checkChatButton = () => {
  const chatButtons = document.querySelectorAll('[aria-label="Open chat"], button[title*="chat"], button[title*="Chat"]');
  const floatingButtons = document.querySelectorAll('button[class*="fixed"][class*="bottom"]');
  
  console.log('🔍 DOM Check:');
  console.log(`   Chat buttons found: ${chatButtons.length}`);
  console.log(`   Floating buttons found: ${floatingButtons.length}`);
  
  chatButtons.forEach((btn, index) => {
    console.log(`   Button ${index + 1}:`, {
      visible: btn.style.display !== 'none' && !btn.hidden,
      classes: btn.className,
      title: btn.title,
      ariaLabel: btn.getAttribute('aria-label')
    });
  });
  
  floatingButtons.forEach((btn, index) => {
    console.log(`   Floating ${index + 1}:`, {
      visible: btn.style.display !== 'none' && !btn.hidden,
      position: getComputedStyle(btn).position,
      bottom: getComputedStyle(btn).bottom,
      right: getComputedStyle(btn).right,
      zIndex: getComputedStyle(btn).zIndex,
      innerHTML: btn.innerHTML.substring(0, 100)
    });
  });
};

// Check authentication status
const checkAuth = () => {
  console.log('🔐 Authentication Check:');
  
  // Check localStorage
  const authData = localStorage.getItem('authData');
  const token = localStorage.getItem('auth_token');
  
  console.log(`   Auth data: ${authData ? 'exists' : 'missing'}`);
  console.log(`   Auth token: ${token ? 'exists' : 'missing'}`);
  
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      console.log(`   User: ${parsed.email} (${parsed.role})`);
    } catch (e) {
      console.log('   Auth data corrupted');
    }
  }
};

// Check React context state
const checkReactState = () => {
  console.log('⚛️ React State Check:');
  
  // Try to access window.__REACT_DEVTOOLS_GLOBAL_HOOK__ if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('   React DevTools detected');
  } else {
    console.log('   React DevTools not available');
  }
  
  // Check for common React error boundaries
  const errorBoundaries = document.querySelectorAll('[data-reactroot] [role="alert"]');
  console.log(`   Error boundaries: ${errorBoundaries.length}`);
};

// Check console for errors
const checkConsoleErrors = () => {
  console.log('📋 Console Status:');
  console.log('   (Check browser console for any error messages)');
  console.log('   Look for:');
  console.log('   - Authentication errors');
  console.log('   - API connection failures');
  console.log('   - React component errors');
  console.log('   - GlobalMessenger context issues');
};

// Check network requests
const checkNetworkRequests = () => {
  console.log('🌐 Network Check:');
  console.log('   Check browser Network tab for:');
  console.log('   - /api/auth/verify requests');
  console.log('   - /api/messaging/conversations requests');
  console.log('   - Any failed API calls (4xx, 5xx status)');
};

// Simulate login to test chat button
const simulateTestLogin = () => {
  console.log('🎭 Test Login Simulation:');
  console.log('   Creating test auth data in localStorage...');
  
  const testUser = {
    id: '2-2025-003',
    email: 'vendor@test.com',
    firstName: 'Test',
    lastName: 'Vendor',
    role: 'vendor'
  };
  
  const testToken = 'test-token-' + Date.now();
  
  localStorage.setItem('authData', JSON.stringify(testUser));
  localStorage.setItem('auth_token', testToken);
  
  console.log('   ✅ Test auth data created');
  console.log('   💡 Refresh the page to see if chat button appears');
  console.log('   💡 Or navigate to another page and back');
};

// Run all checks
console.log('🚀 Running verification checks...\n');
checkChatButton();
console.log('');
checkAuth();
console.log('');
checkReactState();
console.log('');
checkConsoleErrors();
console.log('');
checkNetworkRequests();
console.log('');

console.log('💡 TROUBLESHOOTING TIPS:');
console.log('1. If no chat button found, user might not be authenticated');
console.log('2. If button exists but hidden, check CSS and React state');
console.log('3. If authentication missing, run simulateTestLogin()');
console.log('4. Check browser console for JavaScript errors');
console.log('5. Verify API endpoints are responding correctly');
console.log('');
console.log('🔧 MANUAL TESTS:');
console.log('• Run simulateTestLogin() to create test user');
console.log('• Refresh page after test login');
console.log('• Navigate to /vendor/messages to test messaging');
console.log('• Check if floating button appears in bottom-right');

// Export functions for manual use
window.chatBubbleTest = {
  checkChatButton,
  checkAuth,
  checkReactState,
  simulateTestLogin
};
