// Analyze booking distribution and patterns
const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function analyzeBookings() {
  try {
    console.log('🔍 Analyzing booking patterns and distribution...\n');
    
    // Get all bookings
    const response = await makeRequest('/api/bookings?limit=100');
    const bookings = response.data?.bookings || [];
    
    console.log('📊 BOOKING DISTRIBUTION ANALYSIS');
    console.log('================================');
    console.log(`Total bookings in database: ${bookings.length}`);
    console.log(`API reports total: ${response.data?.total || 0}\n`);
    
    // Analyze by couple
    const coupleStats = {};
    bookings.forEach(booking => {
      const coupleId = booking.couple_id;
      const coupleName = booking.couple_name || 'Unknown';
      
      if (!coupleStats[coupleId]) {
        coupleStats[coupleId] = {
          name: coupleName,
          bookings: [],
          services: new Set(),
          statuses: new Set(),
          totalAmount: 0,
          creationDates: []
        };
      }
      
      coupleStats[coupleId].bookings.push(booking.id);
      coupleStats[coupleId].services.add(booking.service_type);
      coupleStats[coupleId].statuses.add(booking.status);
      coupleStats[coupleId].totalAmount += parseFloat(booking.quoted_price || booking.final_price || 0);
      coupleStats[coupleId].creationDates.push(booking.created_at);
    });
    
    console.log('👥 COUPLES AND THEIR BOOKINGS:');
    console.log('==============================');
    Object.entries(coupleStats).forEach(([coupleId, stats]) => {
      console.log(`\n🤵👰 ${stats.name} (${coupleId}):`);
      console.log(`  📋 Bookings: ${stats.bookings.length}`);
      console.log(`  🛍️ Services: ${Array.from(stats.services).join(', ')}`);
      console.log(`  📊 Statuses: ${Array.from(stats.statuses).join(', ')}`);
      console.log(`  💰 Total Amount: ₱${stats.totalAmount.toLocaleString()}`);
      console.log(`  📅 First Booking: ${stats.creationDates[0]?.slice(0, 10)}`);
      console.log(`  📅 Latest Booking: ${stats.creationDates[stats.creationDates.length - 1]?.slice(0, 10)}`);
    });
    
    // Check if there are patterns in service types
    console.log('\n🛍️  SERVICE TYPE DISTRIBUTION:');
    console.log('==============================');
    const serviceStats = {};
    bookings.forEach(booking => {
      const service = booking.service_type || 'Unknown';
      serviceStats[service] = (serviceStats[service] || 0) + 1;
    });
    
    Object.entries(serviceStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([service, count]) => {
        console.log(`  ${service}: ${count} bookings`);
      });
    
    // Check booking creation timeline
    console.log('\n📅 BOOKING CREATION TIMELINE:');
    console.log('=============================');
    const dateStats = {};
    bookings.forEach(booking => {
      const date = booking.created_at?.slice(0, 10) || 'Unknown';
      dateStats[date] = (dateStats[date] || 0) + 1;
    });
    
    Object.entries(dateStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, count]) => {
        console.log(`  ${date}: ${count} bookings created`);
      });
    
    // Check if there's a booking creation issue
    console.log('\n🔍 POTENTIAL ISSUES:');
    console.log('====================');
    
    const coupleCount = Object.keys(coupleStats).length;
    const avgBookingsPerCouple = bookings.length / coupleCount;
    
    console.log(`• ${coupleCount} couples in system`);
    console.log(`• Average ${avgBookingsPerCouple.toFixed(1)} bookings per couple`);
    
    if (avgBookingsPerCouple < 3) {
      console.log('⚠️  LOW BOOKING DENSITY: Most couples have very few bookings');
      console.log('   This suggests either:');
      console.log('   - New system with limited test data');
      console.log('   - Booking creation process issues');
      console.log('   - Users not completing booking flows');
    }
    
    const uniqueServices = new Set(bookings.map(b => b.service_type)).size;
    console.log(`• ${uniqueServices} unique service types being booked`);
    
    if (uniqueServices < 8) {
      console.log('⚠️  LIMITED SERVICE DIVERSITY: Few service types being used');
    }
    
    // Sample booking data for debugging
    console.log('\n📋 SAMPLE BOOKING DETAILS:');
    console.log('===========================');
    if (bookings.length > 0) {
      const sample = bookings[0];
      console.log('Sample booking structure:');
      Object.keys(sample).forEach(key => {
        if (key.includes('id') || key.includes('name') || key.includes('amount') || key.includes('status')) {
          console.log(`  ${key}: ${sample[key]}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error analyzing bookings:', error);
  }
}

analyzeBookings();
