/**
 * Debug script to check frontend messaging issues
 * Run this in the browser console on the /vendor/messages page
 */

// Check if the messaging components are loaded
console.log('🔍 DEBUGGING VENDOR MESSAGES');
console.log('============================');

// Check if React components are mounted
const checkReactMount = () => {
  const buttons = document.querySelectorAll('button');
  const sendButtons = Array.from(buttons).filter(btn => 
    btn.innerHTML.includes('Send') || 
    btn.querySelector('svg') || 
    btn.getAttribute('aria-label')?.includes('send')
  );
  
  console.log('📊 Found buttons:', buttons.length);
  console.log('📤 Found send-like buttons:', sendButtons.length);
  
  sendButtons.forEach((btn, index) => {
    console.log(`   Button ${index + 1}:`, {
      innerHTML: btn.innerHTML.substring(0, 100),
      disabled: btn.disabled,
      classes: btn.className,
      onclick: typeof btn.onclick
    });
  });
};

// Check for JavaScript errors
const checkConsoleErrors = () => {
  console.log('📋 Recent console errors:');
  // This would show recent errors if logged properly
};

// Check if messaging API is accessible
const checkMessagingAPI = async () => {
  try {
    const baseUrl = window.location.origin.replace('5173', '3001');
    const testUrl = `${baseUrl}/api/messaging/conversations/2-2025-003`;
    
    console.log('🌐 Testing messaging API:', testUrl);
    const response = await fetch(testUrl);
    console.log('   API Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ API working, conversations:', data.conversations?.length || 0);
    } else {
      console.log('   ❌ API failed');
    }
  } catch (error) {
    console.log('   ❌ API error:', error.message);
  }
};

// Check React state (if React DevTools available)
const checkReactState = () => {
  if (window.React) {
    console.log('⚛️ React found');
  } else {
    console.log('⚛️ React not found in global scope');
  }
};

// Run all checks
setTimeout(() => {
  checkReactMount();
  checkReactState();
  checkMessagingAPI();
  checkConsoleErrors();
  
  console.log('\n💡 TROUBLESHOOTING TIPS:');
  console.log('1. Check if send button is disabled (message input empty)');
  console.log('2. Check if conversation is selected');
  console.log('3. Check browser network tab for failed requests');
  console.log('4. Check if user authentication is working');
  console.log('\n🎯 TO TEST: Type a message and click send button');
}, 1000);

// Export for manual testing
window.debugMessaging = {
  checkReactMount,
  checkMessagingAPI,
  checkReactState
};
