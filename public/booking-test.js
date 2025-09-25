// Quick test to verify bookings are loading correctly
console.log('🎯 Testing booking load after fixes...');

// Wait for page to load
setTimeout(async () => {
  try {
    // Test the API endpoint directly
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/bookings?coupleId=1-2025-001&page=1&limit=10&sortBy=created_at&sortOrder=desc');
    
    if (!response.ok) {
      console.error('❌ API test failed:', response.status);
      return;
    }
    
    const data = await response.json();
    const bookings = data.bookings || [];
    const pagination = data.pagination || {};
    
    console.log('✅ API Test Results:');
    console.log(`📊 Bookings loaded: ${bookings.length}`);
    console.log(`📄 Total bookings: ${pagination.totalBookings || 'unknown'}`);
    console.log(`🎯 All bookings have status: ${bookings.length > 0 ? bookings[0].status : 'none'}`);
    
    // Check status coverage
    const statusConfig = {
      draft: true, request: true, quote_requested: true, quote_sent: true, 
      quote_accepted: true, quote_rejected: true, confirmed: true, 
      downpayment_paid: true, paid_in_full: true, in_progress: true,
      completed: true, cancelled: true, refunded: true, disputed: true
    };
    
    const statuses = [...new Set(bookings.map(b => b.status))];
    const uncovered = statuses.filter(s => !statusConfig[s]);
    
    if (uncovered.length > 0) {
      console.warn('⚠️ Uncovered statuses:', uncovered);
    } else {
      console.log('✅ All statuses covered in statusConfig');
    }
    
    console.log('🎉 API test complete - frontend should work!');
    
  } catch (error) {
    console.error('❌ API test error:', error.message);
  }
}, 2000);

console.log('⏳ API test will run in 2 seconds...');
