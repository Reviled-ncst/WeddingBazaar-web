// Debug script to check booking statuses and payment button visibility
const https = require('https');

// Function to make API requests
function makeRequest(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : require('http');
    
    const req = client.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
  });
}

async function debugBookings() {
  console.log('🔍 DEBUGGING BOOKING STATUS AND PAYMENT BUTTONS\n');
  
  try {
    // Check backend health
    console.log('1. Checking backend health...');
    const health = await makeRequest('https://weddingbazaar-web.onrender.com/api/health');
    console.log('✅ Backend health:', health.status, health.data?.status || health.data);
    
    // Check if we have any test bookings (assuming user ID 1 exists for testing)
    console.log('\n2. Checking for test bookings...');
    
    // List of potential test user IDs
    const testUserIds = ['1', '2', '3', 'test-user'];
    
    for (const userId of testUserIds) {
      try {
        const bookings = await makeRequest(`https://weddingbazaar-web.onrender.com/api/bookings/couple/${userId}`);
        
        if (bookings.status === 200 && bookings.data.bookings?.length > 0) {
          console.log(`\n📊 Found ${bookings.data.bookings.length} bookings for user ${userId}:`);
          
          bookings.data.bookings.forEach((booking, index) => {
            console.log(`\nBooking ${index + 1}:`);
            console.log('  ID:', booking.id);
            console.log('  Status:', booking.status);
            console.log('  Service:', booking.service_type || booking.serviceName);
            console.log('  Vendor:', booking.vendor_name || booking.vendorName);
            console.log('  Total Amount:', booking.quoted_price || booking.final_price || booking.totalAmount);
            console.log('  Created:', booking.created_at);
            console.log('  Notes:', booking.notes);
            
            // Determine if payment buttons should show
            const shouldShowPayment = booking.status === 'quote_accepted' || 
                                    booking.status === 'confirmed' ||
                                    (booking.notes && booking.notes.toLowerCase().includes('quote accepted'));
            
            console.log('  🎯 Should show payment buttons:', shouldShowPayment);
            
            if (shouldShowPayment) {
              console.log('  🎯 Payment button logic: ✅ SHOULD SHOW');
            } else {
              console.log('  🎯 Payment button logic: ❌ WILL NOT SHOW');
              console.log('      Reason: Status is not "quote_accepted" and notes don\'t contain "quote accepted"');
            }
          });
        } else if (bookings.status === 200) {
          console.log(`  No bookings found for user ${userId}`);
        } else {
          console.log(`  Error fetching bookings for user ${userId}:`, bookings.status);
        }
      } catch (error) {
        console.log(`  Error checking user ${userId}:`, error.message);
      }
    }
    
    console.log('\n3. Testing payment endpoints...');
    
    // Test if payment endpoints exist
    const paymentEndpoints = [
      '/api/bookings/test/accept-quote',
      '/api/bookings/test/process-payment',
      '/api/bookings/test/payment-status'
    ];
    
    for (const endpoint of paymentEndpoints) {
      try {
        const result = await makeRequest(`https://weddingbazaar-web.onrender.com${endpoint}`);
        console.log(`✅ ${endpoint}: Status ${result.status}`);
      } catch (error) {
        console.log(`❌ ${endpoint}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugBookings();
