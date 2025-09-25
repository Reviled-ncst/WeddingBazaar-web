// Check current bookings and payment amounts
console.log('🔍 Checking current booking status...');

// Wait for page to load
setTimeout(() => {
  // Check if there are booking cards on the page
  const bookingCards = document.querySelectorAll('[data-booking-card]');
  console.log(`📋 Found ${bookingCards.length} booking cards`);
  
  // Look for payment buttons
  const paymentButtons = document.querySelectorAll('button[data-payment-action]');
  console.log(`💳 Found ${paymentButtons.length} payment buttons`);
  
  // Check for displayed amounts
  const amountElements = document.querySelectorAll('[data-amount]');
  console.log(`💰 Found ${amountElements.length} amount displays`);
  
  amountElements.forEach((el, index) => {
    console.log(`Amount ${index + 1}:`, el.textContent);
  });
  
  // Try to find and log booking data from localStorage or window
  if (window.bookings) {
    console.log('📊 Window bookings:', window.bookings.length);
  }
  
}, 3000);

console.log('✅ Status check script loaded, results will appear in 3 seconds');
