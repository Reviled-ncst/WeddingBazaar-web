// Quick verification test for floating chat button integration
// Run this in browser console on https://weddingbazaarph.web.app

console.log('🧪 Testing Wedding Bazaar Floating Chat Integration...');

// Test 1: Check if floating chat button exists in DOM
const chatButton = document.querySelector('[title*="Open chat"]');
console.log('✅ Floating chat button found:', !!chatButton);

if (chatButton) {
  console.log('📍 Button position:', window.getComputedStyle(chatButton).position);
  console.log('📍 Button z-index:', window.getComputedStyle(chatButton).zIndex);
  console.log('📍 Button classes:', chatButton.className);
}

// Test 2: Check if UnifiedMessaging context is available
const checkContext = () => {
  try {
    // This will be available if the context is properly loaded
    const hasAuth = !!window.localStorage.getItem('auth_token');
    console.log('🔐 Auth token present:', hasAuth);
    
    // Check if we're on a user page
    const isUserPage = window.location.pathname.includes('/individual') || 
                      window.location.pathname.includes('/vendor') ||
                      window.location.pathname.includes('/admin');
    console.log('👤 On user page:', isUserPage);
    
    return { hasAuth, isUserPage };
  } catch (error) {
    console.error('❌ Context check failed:', error);
    return { hasAuth: false, isUserPage: false };
  }
};

const contextStatus = checkContext();

// Test 3: Simulate chat button click (if authenticated)
if (chatButton && contextStatus.hasAuth) {
  console.log('🖱️ Testing chat button click...');
  
  // Add click listener to monitor
  chatButton.addEventListener('click', () => {
    console.log('✅ Chat button clicked successfully!');
    
    // Check if modal opens (look for modal elements)
    setTimeout(() => {
      const modal = document.querySelector('[role="dialog"]') || 
                   document.querySelector('.modal') ||
                   document.querySelector('[data-modal]');
      console.log('🪟 Chat modal opened:', !!modal);
    }, 500);
  });
  
  console.log('📝 Click the floating chat button to test modal opening...');
} else if (!contextStatus.hasAuth) {
  console.log('ℹ️ To test chat functionality, please log in first');
} else {
  console.log('❌ Chat button not found - checking visibility conditions...');
  console.log('   - Current path:', window.location.pathname);
  console.log('   - Should hide on /messages:', window.location.pathname.includes('/messages'));
}

// Test 4: Check services page real data integration
if (window.location.pathname.includes('/services')) {
  console.log('🛍️ Testing services page real data integration...');
  
  setTimeout(() => {
    const serviceCards = document.querySelectorAll('[data-service-id]') || 
                        document.querySelectorAll('.service-card') ||
                        document.querySelectorAll('[class*="service"]');
    
    console.log('📊 Service cards found:', serviceCards.length);
    
    if (serviceCards.length > 0) {
      const firstCard = serviceCards[0];
      const hasRealImages = !!firstCard.querySelector('img[src*="unsplash"]') ||
                           !!firstCard.querySelector('img[src*="cloudinary"]');
      console.log('🖼️ Using real images:', hasRealImages);
      
      const hasPricing = !!firstCard.textContent.match(/\$|₱|PHP/);
      console.log('💰 Has pricing info:', hasPricing);
      
      console.log('✅ Services page appears to be using real data');
    }
  }, 1000);
}

// Summary
console.log('\n📋 VERIFICATION SUMMARY:');
console.log('='.repeat(50));
console.log('Floating Chat Button:', !!chatButton ? '✅' : '❌');
console.log('Authentication Status:', contextStatus.hasAuth ? '✅' : '❌');
console.log('User Page Context:', contextStatus.isUserPage ? '✅' : '❌');
console.log('Production URL:', window.location.origin);
console.log('='.repeat(50));

// Instructions for manual testing
console.log('\n🧪 MANUAL TESTING INSTRUCTIONS:');
console.log('1. Navigate to https://weddingbazaarph.web.app/individual/services');
console.log('2. Log in using the login modal');
console.log('3. Look for floating chat button in bottom-right corner');
console.log('4. Click the chat button to test messaging modal');
console.log('5. Browse services to verify real data integration');
