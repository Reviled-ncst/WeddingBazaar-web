// Debug the actual data flow in the booking system
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

async function debugDataHandling() {
  try {
    console.log('🔍 DEBUGGING DATA HANDLING...\n');
    
    // Step 1: Test the API endpoint the frontend is using
    console.log('Step 1: Testing API endpoint');
    const response = await fetch(`${API_BASE_URL}/bookings?coupleId=1-2025-001&page=1&limit=10&sortBy=created_at&sortOrder=desc`);
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      return;
    }
    
    const rawData = await response.json();
    console.log('📨 Raw API Response:', JSON.stringify(rawData, null, 2));
    
    // Step 2: Check data structure and extraction
    console.log('\nStep 2: Data extraction analysis');
    const bookings = rawData.data?.bookings || rawData.bookings || [];
    const pagination = rawData.data?.pagination || rawData.pagination || {};
    
    console.log('📊 Extracted Data:');
    console.log(`  - Bookings count: ${bookings.length}`);
    console.log(`  - Pagination: ${JSON.stringify(pagination)}`);
    
    // Step 3: Analyze first few bookings
    console.log('\nStep 3: Sample booking analysis');
    bookings.slice(0, 3).forEach((booking, index) => {
      console.log(`\nBooking ${index + 1}:`);
      console.log(`  ID: ${booking.id}`);
      console.log(`  Status: "${booking.status}"`);
      console.log(`  Service Type: "${booking.serviceType}"`);
      console.log(`  Vendor Name: "${booking.vendorName}"`);
      console.log(`  Amount: ${booking.amount}`);
      console.log(`  Event Date: ${booking.eventDate}`);
      console.log(`  Created At: ${booking.createdAt}`);
      console.log(`  All Fields: ${Object.keys(booking).join(', ')}`);
    });
    
    // Step 4: Check if the data matches the UI expectations
    console.log('\nStep 4: UI compatibility check');
    const expectedFields = ['id', 'status', 'serviceName', 'vendorName', 'amount', 'eventDate'];
    const missingFields = [];
    
    if (bookings.length > 0) {
      const sampleBooking = bookings[0];
      expectedFields.forEach(field => {
        if (!(field in sampleBooking)) {
          missingFields.push(field);
        }
      });
      
      if (missingFields.length > 0) {
        console.warn('⚠️ Missing expected fields:', missingFields);
      } else {
        console.log('✅ All expected fields present');
      }
    }
    
    // Step 5: Test different user IDs to see if there's a user-specific issue
    console.log('\nStep 5: Testing alternative user queries');
    const testEndpoints = [
      `/bookings?userId=1-2025-001&limit=5`,
      `/bookings/couple/1-2025-001?limit=5`,
      `/bookings?coupleId=couple1&limit=5`
    ];
    
    for (const endpoint of testEndpoints) {
      try {
        console.log(`\nTesting: ${API_BASE_URL}${endpoint}`);
        const testResponse = await fetch(`${API_BASE_URL}${endpoint}`);
        console.log(`Status: ${testResponse.status}`);
        
        if (testResponse.ok) {
          const testData = await testResponse.json();
          const testBookings = Array.isArray(testData) ? testData : (testData.bookings || testData.data?.bookings || []);
          console.log(`Found: ${testBookings.length} bookings`);
          
          if (testBookings.length > 0) {
            console.log(`Sample ID: ${testBookings[0].id}, Status: ${testBookings[0].status}`);
          }
        }
      } catch (e) {
        console.log(`Error: ${e.message}`);
      }
    }
    
    console.log('\n🎯 Data handling debug complete!');
    
  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugDataHandling();
