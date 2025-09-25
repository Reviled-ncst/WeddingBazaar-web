// Create bookings for the current logged-in user
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
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: responseData });
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

async function createBookingsForCurrentUser() {
  try {
    console.log('\n📋 CREATING BOOKINGS FOR CURRENT USER...\n');
    
    // First, let's see what users have bookings
    const bookingsResponse = await makeRequest('/api/bookings?limit=100');
    
    if (!bookingsResponse.data.success) {
      console.log('❌ Failed to get bookings');
      return;
    }
    
    const allBookings = bookingsResponse.data.data.bookings;
    console.log(`📊 Total bookings in system: ${allBookings.length}`);
    
    // Group by couple_id to see distribution
    const bookingsByUser = {};
    allBookings.forEach(booking => {
      if (!bookingsByUser[booking.couple_id]) {
        bookingsByUser[booking.couple_id] = [];
      }
      bookingsByUser[booking.couple_id].push(booking);
    });
    
    console.log('\n👥 CURRENT BOOKING DISTRIBUTION:');
    console.log('='.repeat(50));
    Object.entries(bookingsByUser).forEach(([userId, bookings]) => {
      const firstBooking = bookings[0];
      console.log(`${userId}: "${firstBooking.couple_name}" (${bookings.length} bookings)`);
      if (bookings.length <= 2) {
        console.log(`  ⚠️ Only ${bookings.length} bookings - may need more for testing`);
      }
    });
    
    // Let's pick a user with few bookings and create more for them
    const usersWithFewBookings = Object.entries(bookingsByUser)
      .filter(([userId, bookings]) => bookings.length <= 2)
      .map(([userId, bookings]) => ({ userId, bookings, count: bookings.length }));
    
    if (usersWithFewBookings.length > 0) {
      const targetUser = usersWithFewBookings[0];
      console.log(`\n🎯 Creating more bookings for: ${targetUser.userId}`);
      console.log(`   Current name: ${targetUser.bookings[0].couple_name}`);
      console.log(`   Current count: ${targetUser.count}`);
      
      // Get available vendors
      const vendorsResponse = await makeRequest('/api/vendors');
      console.log(`📋 Available vendors: ${vendorsResponse.data.vendors?.length || 0}`);
      
      // Create diverse booking scenarios
      const newBookings = [
        {
          couple_id: targetUser.userId,
          vendor_id: '2-2025-003', // Use existing vendor
          service_type: 'Photography',
          service_name: 'Wedding Photography Package',
          event_date: '2025-06-15',
          event_time: '14:00:00',
          event_location: 'Makati, Metro Manila',
          guest_count: 120,
          status: 'pending',
          vendor_name: 'Perfect Captures Photography',
          couple_name: targetUser.bookings[0].couple_name,
          vendor_category: 'Photography',
          special_requests: 'Full day coverage with engagement shoot',
          contact_person: targetUser.bookings[0].couple_name,
          contact_email: targetUser.bookings[0].contact_email,
          quoted_price: 85000,
          final_price: 85000,
          downpayment_amount: 25500
        },
        {
          couple_id: targetUser.userId,
          vendor_id: '2-2025-003',
          service_type: 'Catering',
          service_name: 'Premium Wedding Catering',
          event_date: '2025-06-15',
          event_time: '18:00:00',
          event_location: 'Makati, Metro Manila',
          guest_count: 120,
          status: 'quote_sent',
          vendor_name: 'Gourmet Catering Manila',
          couple_name: targetUser.bookings[0].couple_name,
          vendor_category: 'Catering',
          special_requests: 'Buffet style with vegetarian options',
          contact_person: targetUser.bookings[0].couple_name,
          contact_email: targetUser.bookings[0].contact_email,
          quoted_price: 120000,
          final_price: 120000,
          downpayment_amount: 36000
        },
        {
          couple_id: targetUser.userId,
          vendor_id: '2-2025-003',
          service_type: 'Music',
          service_name: 'Live Band Performance',
          event_date: '2025-06-15',
          event_time: '19:00:00',
          event_location: 'Makati, Metro Manila',
          guest_count: 120,
          status: 'confirmed',
          vendor_name: 'Manila Wedding Band',
          couple_name: targetUser.bookings[0].couple_name,
          vendor_category: 'Music',
          special_requests: '4-piece band with acoustic ceremony music',
          contact_person: targetUser.bookings[0].couple_name,
          contact_email: targetUser.bookings[0].contact_email,
          quoted_price: 45000,
          final_price: 45000,
          downpayment_amount: 13500
        }
      ];
      
      console.log(`\n🔧 Creating ${newBookings.length} new bookings...`);
      
      for (const booking of newBookings) {
        try {
          const createResponse = await makeRequest('/api/bookings/request', 'POST', booking);
          
          if (createResponse.status === 201 || createResponse.data.success) {
            console.log(`✅ Created: ${booking.service_type} - ₱${booking.quoted_price.toLocaleString()}`);
          } else {
            console.log(`❌ Failed to create ${booking.service_type}:`, createResponse.data.message || 'Unknown error');
          }
        } catch (error) {
          console.log(`❌ Error creating ${booking.service_type}:`, error.message);
        }
      }
      
      // Verify the new bookings
      console.log('\n🧪 VERIFYING NEW BOOKINGS...');
      const verifyResponse = await makeRequest(`/api/bookings?coupleId=${targetUser.userId}`);
      
      if (verifyResponse.data.success) {
        console.log(`✅ User now has ${verifyResponse.data.data.total} total bookings`);
        
        // Show pricing verification
        const bookingsWithPrices = verifyResponse.data.data.bookings.filter(b => 
          b.quoted_price !== null && b.quoted_price !== undefined
        );
        console.log(`💰 Bookings with prices: ${bookingsWithPrices.length}`);
        
        if (bookingsWithPrices.length > 0) {
          console.log('\nSample pricing:');
          bookingsWithPrices.slice(0, 3).forEach((booking, index) => {
            console.log(`${index + 1}. ${booking.service_type}: ₱${Number(booking.quoted_price).toLocaleString()}`);
          });
        }
        
        console.log('\n📋 NOW YOU CAN:');
        console.log(`1. Login as user: ${targetUser.userId}`);
        console.log(`2. Go to: http://localhost:5174/individual/bookings`);
        console.log(`3. See ${verifyResponse.data.data.total} bookings with proper pricing`);
        console.log(`4. Test filtering, sorting, and quote actions`);
      }
      
    } else {
      console.log('\n✅ All users already have sufficient bookings for testing');
    }
    
  } catch (error) {
    console.error('❌ Error creating bookings:', error.message);
  }
}

createBookingsForCurrentUser();
