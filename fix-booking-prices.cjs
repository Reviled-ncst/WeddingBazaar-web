// Fix null price fields in existing bookings with realistic Philippine wedding pricing
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (err) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Philippine wedding pricing by service type
const PRICING_BY_SERVICE = {
  'Photography': { min: 25000, max: 100000 },
  'Videography': { min: 30000, max: 120000 },
  'Catering': { min: 80000, max: 300000 },
  'DJ': { min: 15000, max: 50000 },
  'Music': { min: 20000, max: 80000 },
  'Flowers': { min: 15000, max: 60000 },
  'Decoration': { min: 25000, max: 100000 },
  'Makeup': { min: 8000, max: 25000 },
  'Hair': { min: 5000, max: 15000 },
  'Wedding Planning': { min: 50000, max: 200000 },
  'Transportation': { min: 10000, max: 40000 },
  'Lighting': { min: 20000, max: 80000 },
  'Sound System': { min: 15000, max: 45000 }
};

function generateRealisticPrice(serviceType, guestCount = 100) {
  const pricing = PRICING_BY_SERVICE[serviceType] || { min: 20000, max: 80000 };
  
  // Base price
  let basePrice = pricing.min + Math.random() * (pricing.max - pricing.min);
  
  // Adjust for guest count (primarily affects catering)
  if (serviceType === 'Catering') {
    basePrice = Math.max(guestCount * 800, basePrice); // ₱800 per person minimum
  } else if (serviceType === 'DJ' || serviceType === 'Music') {
    // These don't scale much with guest count
    // Keep base price
  } else {
    // Other services scale moderately with guest count
    const guestMultiplier = 1 + ((guestCount - 100) / 300); // 1x for 100 guests, 1.33x for 200 guests
    basePrice *= Math.max(0.7, guestMultiplier);
  }
  
  // Round to nearest thousand
  return Math.round(basePrice / 1000) * 1000;
}

async function fixBookingPrices() {
  try {
    console.log('\n💰 FIXING NULL PRICE FIELDS IN BOOKINGS...\n');
    
    // Get all bookings
    const allBookings = await makeRequest('/api/bookings?limit=100');
    
    if (!allBookings.success) {
      console.log('❌ Failed to get bookings:', allBookings);
      return;
    }
    
    const bookings = allBookings.data?.bookings || [];
    console.log(`📋 Found ${bookings.length} bookings to process`);
    
    let fixedCount = 0;
    
    for (const booking of bookings) {
      const hasNullPrices = booking.quoted_price === null || 
                           booking.final_price === null || 
                           booking.downpayment_amount === null;
      
      if (hasNullPrices) {
        const quotedPrice = generateRealisticPrice(booking.service_type, booking.guest_count);
        const finalPrice = quotedPrice; // Assume same as quoted for now
        const downpaymentAmount = Math.round(finalPrice * 0.3); // 30% down payment
        
        console.log(`\n🔧 Fixing booking ${booking.id}:`);
        console.log(`   Service: ${booking.service_type}`);
        console.log(`   Vendor: ${booking.vendor_name}`);
        console.log(`   Guests: ${booking.guest_count}`);
        console.log(`   Old prices: quoted=${booking.quoted_price}, final=${booking.final_price}, down=${booking.downpayment_amount}`);
        console.log(`   New prices: quoted=₱${quotedPrice.toLocaleString()}, final=₱${finalPrice.toLocaleString()}, down=₱${downpaymentAmount.toLocaleString()}`);
        
        try {
          // Update via API
          const updateResult = await makeRequest(`/api/bookings/${booking.id}/status`, 'PUT', {
            status: booking.status, // Keep same status
            quoted_price: quotedPrice,
            final_price: finalPrice,
            downpayment_amount: downpaymentAmount,
            remaining_balance: finalPrice - downpaymentAmount
          });
          
          if (updateResult.success) {
            console.log(`   ✅ Updated successfully`);
            fixedCount++;
          } else {
            console.log(`   ❌ Update failed:`, updateResult.message || 'Unknown error');
          }
          
        } catch (error) {
          console.log(`   ❌ Error updating booking:`, error.message);
        }
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log(`\n✅ SUMMARY: Fixed prices for ${fixedCount} bookings`);
    
    // Test one booking to verify
    if (bookings.length > 0) {
      console.log('\n🧪 VERIFYING FIX...');
      const testBooking = await makeRequest(`/api/bookings?coupleId=${bookings[0].couple_id}&limit=1`);
      
      if (testBooking.success && testBooking.data?.bookings?.length > 0) {
        const updated = testBooking.data.bookings[0];
        console.log('Updated booking prices:', {
          quoted_price: updated.quoted_price,
          final_price: updated.final_price,
          downpayment_amount: updated.downpayment_amount
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error fixing booking prices:', error.message);
  }
}

fixBookingPrices();
