// Debug booking data from the correct endpoint
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

async function debugCorrectBookings() {
  try {
    console.log('🔍 Fetching bookings from correct endpoint...\n');
    
    const response = await fetch(`${API_BASE_URL}/bookings/couple/1-2025-001?limit=50`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 Raw API Response structure:', {
      hasData: !!data.data,
      hasBookings: !!data.bookings,
      isArray: Array.isArray(data),
      keys: Object.keys(data)
    });
    
    // Extract bookings (handle both direct and nested formats)
    let bookings = [];
    if (Array.isArray(data)) {
      bookings = data;
    } else if (data.data && data.data.bookings) {
      bookings = data.data.bookings;
    } else if (data.bookings) {
      bookings = data.bookings;
    }
    
    console.log(`\n📋 Found ${bookings.length} bookings\n`);
    
    // Check status values and other important fields
    const statusValues = new Set();
    const serviceTypes = new Set();
    
    bookings.forEach((booking, index) => {
      statusValues.add(booking.status);
      serviceTypes.add(booking.service_type);
      
      console.log(`Booking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Status: "${booking.status}"`);
      console.log(`  Service Type: "${booking.service_type}"`);
      console.log(`  Service Name: "${booking.service_name}"`);
      console.log(`  Vendor: ${booking.vendor_name}`);
      console.log(`  Amount: ${booking.amount || 0}`);
      console.log(`  Event Date: ${booking.event_date}`);
      console.log('');
    });
    
    console.log('📈 Unique status values:', Array.from(statusValues));
    console.log('📈 Service types:', Array.from(serviceTypes));
    
    // Check if any status values are not in the expected statusConfig
    const knownStatuses = [
      'draft', 'quote_requested', 'quote_sent', 'quote_accepted', 'quote_rejected',
      'confirmed', 'downpayment_paid', 'paid_in_full', 'in_progress', 
      'completed', 'cancelled', 'refunded', 'disputed'
    ];
    
    const missingStatuses = Array.from(statusValues).filter(status => !knownStatuses.includes(status));
    
    if (missingStatuses.length > 0) {
      console.log('\n⚠️  Statuses NOT in statusConfig:', missingStatuses);
      console.log('These need to be added to avoid the "config is undefined" error');
    } else {
      console.log('\n✅ All statuses are covered in statusConfig');
    }
    
  } catch (error) {
    console.error('❌ Error debugging bookings:', error.message);
  }
}

debugCorrectBookings();
