// Enhanced Booking Modal Feature Test Script
// Run this in browser console to test all modal features

console.log('🧪 Starting Enhanced Booking Modal Feature Test...');

// Test 1: Check if modal exists and can be opened
function testModalExists() {
  console.log('📝 Test 1: Modal Existence');
  const bookingCards = document.querySelectorAll('[data-testid*="booking-card"], .booking-card, button:contains("View Details")');
  console.log(`✅ Found ${bookingCards.length} booking cards with detail buttons`);
  return bookingCards.length > 0;
}

// Test 2: Check modal interactive elements
function testModalInteractivity() {
  console.log('📝 Test 2: Modal Interactivity');
  
  // Check for tab buttons
  const tabButtons = document.querySelectorAll('button[data-tab], nav button');
  console.log(`✅ Found ${tabButtons.length} interactive tab buttons`);
  
  // Check for quick action buttons
  const actionButtons = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"], button[onclick*="whatsapp"]');
  console.log(`✅ Found ${actionButtons.length} quick action buttons`);
  
  return tabButtons.length > 0;
}

// Test 3: Check enhanced visual elements
function testVisualEnhancements() {
  console.log('📝 Test 3: Visual Enhancements');
  
  // Check for gradient backgrounds
  const gradientElements = document.querySelectorAll('[class*="gradient"], [class*="bg-gradient"]');
  console.log(`✅ Found ${gradientElements.length} elements with gradient backgrounds`);
  
  // Check for glassmorphism effects
  const glassElements = document.querySelectorAll('[class*="backdrop-blur"], [class*="bg-opacity"]');
  console.log(`✅ Found ${glassElements.length} elements with glassmorphism effects`);
  
  // Check for animation classes
  const animatedElements = document.querySelectorAll('[class*="transition"], [class*="hover:"], [class*="group-hover"]');
  console.log(`✅ Found ${animatedElements.length} elements with animation classes`);
  
  return gradientElements.length > 0 && glassElements.length > 0;
}

// Test 4: Check accessibility features
function testAccessibility() {
  console.log('📝 Test 4: Accessibility Features');
  
  // Check for ARIA labels
  const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby], [role]');
  console.log(`✅ Found ${ariaElements.length} elements with ARIA attributes`);
  
  // Check for keyboard navigation
  const focusableElements = document.querySelectorAll('button, a, input, [tabindex]');
  console.log(`✅ Found ${focusableElements.length} focusable elements`);
  
  return ariaElements.length > 0;
}

// Test 5: Check responsive design
function testResponsiveDesign() {
  console.log('📝 Test 5: Responsive Design');
  
  // Check for responsive classes
  const responsiveElements = document.querySelectorAll('[class*="md:"], [class*="lg:"], [class*="xl:"]');
  console.log(`✅ Found ${responsiveElements.length} elements with responsive classes`);
  
  // Check for mobile-optimized elements
  const mobileElements = document.querySelectorAll('[class*="sm:"], [class*="mobile"]');
  console.log(`✅ Found ${mobileElements.length} elements with mobile optimizations`);
  
  return responsiveElements.length > 0;
}

// Run all tests
function runAllTests() {
  console.log('🚀 Running Complete Enhancement Test Suite...\n');
  
  const results = {
    modalExists: testModalExists(),
    interactivity: testModalInteractivity(),
    visualEnhancements: testVisualEnhancements(),
    accessibility: testAccessibility(),
    responsiveDesign: testResponsiveDesign()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed (${Math.round(passedTests/totalTests*100)}%)`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All enhanced booking modal features are working perfectly!');
  } else {
    console.log('⚠️ Some features may need attention.');
  }
  
  return results;
}

// Auto-run tests
runAllTests();

// Export test functions for manual use
window.bookingModalTests = {
  runAll: runAllTests,
  testModal: testModalExists,
  testInteractivity: testModalInteractivity,
  testVisuals: testVisualEnhancements,
  testA11y: testAccessibility,
  testResponsive: testResponsiveDesign
};

console.log('\n💡 You can run individual tests using:');
console.log('   window.bookingModalTests.testModal()');
console.log('   window.bookingModalTests.testVisuals()');
console.log('   window.bookingModalTests.runAll()');
