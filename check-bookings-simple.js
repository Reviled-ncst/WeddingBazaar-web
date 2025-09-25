// Check which couple IDs have bookings
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/bookings?limit=20',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('📊 Total bookings in system:', response.data?.total || 0);
      
      if (response.data?.bookings?.length > 0) {
        console.log('\n👥 Couples with bookings:');
        const couplesMap = {};
        response.data.bookings.forEach(booking => {
          const coupleId = booking.couple_id;
          if (!couplesMap[coupleId]) {
            couplesMap[coupleId] = {
              count: 0,
              name: booking.couple_name,
              firstBookingId: booking.id
            };
          }
          couplesMap[coupleId].count++;
        });
        
        Object.entries(couplesMap).forEach(([coupleId, info]) => {
          console.log(`  ${coupleId}: ${info.name} (${info.count} bookings)`);
        });
        
        // Pick the first couple with bookings
        const firstCoupleId = Object.keys(couplesMap)[0];
        console.log(`\n🎯 Test URL for customer with bookings:`);
        console.log(`http://localhost:5173/individual/bookings`);
        console.log(`\n📋 Sample booking data structure:`);
        const sampleBooking = response.data.bookings[0];
        console.log('Available fields:', Object.keys(sampleBooking));
        console.log('Critical fields:');
        console.log('  - vendor_name:', sampleBooking.vendor_name);
        console.log('  - couple_name:', sampleBooking.couple_name);
        console.log('  - status:', sampleBooking.status);
        console.log('  - amount:', sampleBooking.amount);
        console.log('  - service_type:', sampleBooking.service_type);
      }
      
    } catch (error) {
      console.error('Error parsing response:', error);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
