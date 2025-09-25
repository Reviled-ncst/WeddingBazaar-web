// Debug booking status values from the API
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

async function debugBookingStatus() {
  try {
    console.log('🔍 Fetching bookings to check status values...\n');
    
    const response = await fetch(`${API_BASE_URL}/bookings/user/1-2025-001?limit=50`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Raw API Response:', JSON.stringify(data, null, 2));
    
    // Extract bookings array (handle both direct and nested formats)
    const bookings = Array.isArray(data) ? data : (data.bookings || []);
    
    console.log(`\n📋 Found ${bookings.length} bookings\n`);
    
    // Check status values
    const statusValues = new Set();
    bookings.forEach((booking, index) => {
      statusValues.add(booking.status);
      console.log(`Booking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Status: "${booking.status}"`);
      console.log(`  Service: ${booking.service_type || booking.serviceType}`);
      console.log(`  Vendor: ${booking.vendor_name || booking.vendorName}`);
      console.log(`  Amount: ${booking.amount || 0}`);
      console.log('');
    });
    
    console.log('📈 Unique status values found:', Array.from(statusValues));
    
    // Check which statuses might be missing from statusConfig
    const statusConfig = {
      draft: true,
      quote_requested: true,
      quote_sent: true,
      quote_accepted: true,
      quote_rejected: true,
      confirmed: true,
      downpayment_paid: true,
      paid_in_full: true,
      in_progress: true,
      completed: true,
      cancelled: true,
      refunded: true,
      disputed: true
    };
    
    const missingStatuses = Array.from(statusValues).filter(status => !statusConfig[status]);
    
    if (missingStatuses.length > 0) {
      console.log('⚠️  Statuses NOT in statusConfig:', missingStatuses);
    } else {
      console.log('✅ All statuses are covered in statusConfig');
    }
    
  } catch (error) {
    console.error('❌ Error debugging booking status:', error.message);
  }
}

debugBookingStatus();
