/**
 * 🧪 BROWSER CONSOLE TEST - BOOKING API WITH REAL DATA
 * 
 * INSTRUCTIONS:
 * 1. Open https://weddingbazaarph.web.app in browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this ENTIRE script
 * 5. Press Enter
 * 6. Check the results
 */

(async function testBookingWithRealService() {
  console.clear();
  console.log('🧪 BOOKING API TEST WITH REAL SERVICE DATA');
  console.log('='.repeat(80));
  
  // REAL DATA from your services database
  const testData = {
    serviceId: 'SRV-00001',      // SADASDAS - Rentals
    vendorId: '2-2025-003',      // vendor0qw@gmail.com
    serviceName: 'SADASDAS',
    serviceType: 'Rentals',
    eventDate: '2025-12-25',
    eventLocation: 'Limpkin Street, Molino, Bacoor, Cavite',
    totalAmount: 25000,
    notes: 'Test booking with real service ID - Browser test',
    specialRequests: 'Please confirm availability'
  };
  
  console.log('\n📋 Test Booking Data:');
  console.table(testData);
  
  const apiUrl = 'https://weddingbazaar-web.onrender.com/api/bookings';
  
  const payload = {
    user_id: 'test-user-browser-' + Date.now(),
    vendor_id: testData.vendorId,
    service_id: testData.serviceId,
    service_type: testData.serviceType,
    service_name: testData.serviceName,
    event_date: testData.eventDate,
    event_location: testData.eventLocation,
    amount: testData.totalAmount,
    status: 'request',
    notes: testData.notes,
    special_requests: testData.specialRequests
  };
  
  console.log('\n🚀 Sending POST request to:', apiUrl);
  console.log('\n📦 Payload:');
  console.log(JSON.stringify(payload, null, 2));
  console.log('\n⏳ Waiting for response...\n');
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const duration = Date.now() - startTime;
    
    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log(`⏱️  Response Time: ${duration}ms`);
    
    const data = await response.json();
    
    console.log('\n📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n' + '='.repeat(80));
    
    if (response.ok) {
      console.log('✅ SUCCESS! Booking created!');
      console.log('\n📧 Email Notifications:');
      console.log('   → Vendor email should be sent to: vendor0qw@gmail.com');
      console.log('   → Check Render logs for email sending status');
      
      if (data.booking_id || data.id) {
        console.log(`\n🆔 Booking ID: ${data.booking_id || data.id}`);
      }
      
      console.log('\n🔍 Next Steps:');
      console.log('   1. Check vendor email inbox (vendor0qw@gmail.com)');
      console.log('   2. Check Render logs: https://dashboard.render.com');
      console.log('   3. Verify booking in database');
      console.log('   4. Test frontend booking modal with same data');
      
    } else {
      console.log('❌ FAILED! Booking creation failed');
      console.log('\n🔍 Error Details:');
      if (data.message) {
        console.log(`   Message: ${data.message}`);
      }
      if (data.error) {
        console.log(`   Error: ${data.error}`);
      }
      if (data.detail) {
        console.log(`   Detail: ${data.detail}`);
      }
      
      console.log('\n💡 Troubleshooting:');
      if (response.status === 500 && data.detail && data.detail.includes('foreign key')) {
        console.log('   ⚠️  Foreign key constraint error');
        console.log('   → Service ID or Vendor ID does not exist in database');
        console.log('   → Verify service exists: SELECT * FROM services WHERE id = \'SRV-00001\'');
        console.log('   → Verify vendor exists: SELECT * FROM vendors WHERE id = \'2-2025-003\'');
      } else if (response.status === 404) {
        console.log('   ⚠️  API endpoint not found');
        console.log('   → Backend may not be deployed');
        console.log('   → Check Render deployment status');
      } else if (response.status === 401 || response.status === 403) {
        console.log('   ⚠️  Authentication issue');
        console.log('   → May need auth token');
        console.log('   → Check if endpoint requires authentication');
      }
    }
    
    console.log('='.repeat(80) + '\n');
    
    return { success: response.ok, data, status: response.status };
    
  } catch (error) {
    console.log('\n❌ REQUEST FAILED!');
    console.error('Error:', error);
    console.log('\n🔍 Possible Causes:');
    console.log('   - Backend server is down');
    console.log('   - Network connectivity issues');
    console.log('   - CORS policy blocking request');
    console.log('   - Backend URL is incorrect');
    console.log('\n💡 Quick Checks:');
    console.log('   1. Test backend health: https://weddingbazaar-web.onrender.com/api/health');
    console.log('   2. Check Render dashboard for server status');
    console.log('   3. Verify API_URL in frontend code');
    
    return { success: false, error: error.message };
  }
})();
