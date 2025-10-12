// Script to manually update a booking status to quote_accepted
const https = require('https');

function makePatchRequest(url, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'PATCH',
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

async function updateBookingToQuoteAccepted() {
  console.log('🎯 UPDATING BOOKING TO QUOTE_ACCEPTED STATUS\n');
  
  // Update booking 544943 to quote_accepted status
  const bookingId = '544943';
  const updateData = {
    status: 'quote_accepted',
    vendor_notes: 'QUOTE_ACCEPTED: ₱45,000 - Quote accepted by couple, ready for payment'
  };
  
  try {
    console.log(`Updating booking ${bookingId} to quote_accepted...`);
    
    const result = await makePatchRequest(
      `https://weddingbazaar-web.onrender.com/api/bookings/${bookingId}/status`,
      updateData
    );
    
    if (result.status === 200) {
      console.log('✅ Booking updated successfully:', result.data);
    } else {
      console.log('❌ Failed to update booking:', result.status, result.data);
    }
    
    // Wait a moment then fetch the updated booking
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\n📊 Fetching updated booking for couple 1-2025-001...');
    
    const https = require('https');
    https.get('https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log('✅ Updated bookings for couple 1-2025-001:');
          console.log('Count:', parsed.bookings?.length || 0);
          if (parsed.bookings && parsed.bookings.length > 0) {
            parsed.bookings.forEach((booking, index) => {
              console.log(`\nBooking ${index + 1}:`);
              console.log('  ID:', booking.id);
              console.log('  Status:', booking.status);
              console.log('  Service:', booking.service_name || booking.service_type);
              console.log('  Notes:', booking.notes?.substring(0, 100) + '...');
              console.log('  Total Amount:', booking.total_amount);
              
              const shouldShowPayment = booking.status === 'quote_accepted';
              console.log('  🎯 Should show payment buttons:', shouldShowPayment);
            });
          }
        } catch (e) {
          console.log('Error parsing response:', e.message);
          console.log('Raw response:', data.substring(0, 500));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

updateBookingToQuoteAccepted();
