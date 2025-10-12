// Script to create test bookings with quote_accepted status
const https = require('https');

function makePostRequest(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function createTestBookings() {
  console.log('🎯 CREATING TEST BOOKINGS WITH QUOTE_ACCEPTED STATUS\n');
  
  // Test booking data with correct database fields
  const testBookings = [
    {
      couple_id: 'test-couple-1',
      couple_name: 'John & Jane Doe',
      vendor_id: '1',
      vendor_name: 'Test Vendor 1',
      service_type: 'catering',
      service_name: 'Wedding Catering Package',
      event_date: '2025-10-31',
      event_location: 'Bayan Luna IV, Imus, Cavite, Philippines',
      total_amount: 45000,
      special_requests: 'Test booking for payment workflow',
      status: 'quote_accepted',
      notes: 'Quote accepted by couple - ready for payment'
    },
    {
      couple_id: 'test-couple-1',
      couple_name: 'John & Jane Doe',
      vendor_id: '2',
      vendor_name: 'Test Vendor 2',
      service_type: 'photography',
      service_name: 'Wedding Photography Package',
      event_date: '2025-12-15',
      event_location: 'Manila, Philippines',
      total_amount: 65000,
      special_requests: 'Wedding photography package',
      status: 'quote_accepted',
      notes: 'Quote accepted - premium package selected'
    }
  ];
  
  try {
    for (let i = 0; i < testBookings.length; i++) {
      const booking = testBookings[i];
      console.log(`Creating test booking ${i + 1}...`);
      
      try {
        const result = await makePostRequest(
          'https://weddingbazaar-web.onrender.com/api/bookings',
          booking
        );
        
        if (result.status === 201 || result.status === 200) {
          console.log(`✅ Booking ${i + 1} created successfully:`, result.data);
        } else {
          console.log(`❌ Failed to create booking ${i + 1}:`, result.status, result.data);
        }
      } catch (error) {
        console.log(`❌ Error creating booking ${i + 1}:`, error.message);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n📊 Test bookings creation completed!');
    console.log('Now testing if they appear in the API...\n');
    
    // Wait a moment for database to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test fetching the bookings
    const https = require('https');
    https.get('https://weddingbazaar-web.onrender.com/api/bookings/couple/test-couple-1', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Fetched bookings for test-couple-1:');
          console.log('Count:', parsed.bookings?.length || 0);
          if (parsed.bookings && parsed.bookings.length > 0) {
            parsed.bookings.forEach((booking, index) => {
              console.log(`\nBooking ${index + 1}:`);
              console.log('  ID:', booking.id);
              console.log('  Status:', booking.status);
              console.log('  Service:', booking.service_type);
              console.log('  Amount:', booking.quoted_price || booking.final_price);
              console.log('  Should show payment buttons:', booking.status === 'quote_accepted');
            });
          }
        } catch (e) {
          console.log('Error parsing response:', e.message);
          console.log('Raw response:', data);
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

createTestBookings();
