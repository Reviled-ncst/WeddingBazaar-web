const https = require('https');

console.log('🔍 Debugging vendor booking data...\n');
console.log('Target vendor ID: "2-2025-003"');
console.log('User role: vendor\n');

// Test the debug endpoint to see what's in the bookings table
const debugBookings = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://weddingbazaar-web.onrender.com/api/debug/sample/bookings', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📊 Bookings Table Debug:');
          console.log(`   Status: ${res.statusCode}`);
          
          if (result.success && result.data) {
            console.log(`   Total bookings in table: ${result.data.length}`);
            
            // Check if any bookings exist for vendor 2-2025-003
            const vendorBookings = result.data.filter(b => 
              b.vendor_id === '2-2025-003' || 
              String(b.vendor_id) === '2-2025-003'
            );
            
            console.log(`   Bookings for vendor 2-2025-003: ${vendorBookings.length}`);
            
            if (result.data.length > 0) {
              console.log('\n📋 Sample Booking Records:');
              result.data.slice(0, 3).forEach((booking, i) => {
                console.log(`   Booking ${i + 1}:`);
                console.log(`     ID: ${booking.id}`);
                console.log(`     Vendor ID: ${booking.vendor_id} (${typeof booking.vendor_id})`);
                console.log(`     Status: ${booking.status}`);
                console.log(`     Created: ${booking.created_at}`);
              });
              
              // Check all unique vendor IDs in bookings
              const uniqueVendorIds = [...new Set(result.data.map(b => b.vendor_id))];
              console.log('\n🔍 All Vendor IDs in bookings table:');
              uniqueVendorIds.forEach(id => {
                const count = result.data.filter(b => b.vendor_id === id).length;
                console.log(`   "${id}" (${typeof id}): ${count} bookings`);
              });
            }
            
            if (vendorBookings.length === 0) {
              console.log('\n❌ PROBLEM FOUND: No bookings exist for vendor 2-2025-003');
              console.log('   This explains why bookings show as "new request"');
              console.log('   The vendor has no booking history in the database');
            } else {
              console.log('\n✅ Bookings exist for this vendor, checking API endpoint...');
            }
          } else {
            console.log('❌ No booking data returned');
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ Parse error:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Test the actual vendor bookings endpoint
const testVendorBookingsAPI = () => {
  return new Promise((resolve, reject) => {
    const req = https.get('https://weddingbazaar-web.onrender.com/api/bookings/vendor/2-2025-003', (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('\n📡 Vendor Bookings API Test:');
          console.log(`   Status: ${res.statusCode}`);
          console.log(`   Success: ${result.success}`);
          console.log(`   Bookings returned: ${result.bookings ? result.bookings.length : 0}`);
          
          if (result.bookings && result.bookings.length > 0) {
            console.log('✅ API returning bookings correctly');
          } else {
            console.log('❌ API returning no bookings - this confirms the issue');
          }
          
          resolve(result);
        } catch (error) {
          console.error('❌ API test error:', error.message);
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

// Run both tests
Promise.all([debugBookings(), testVendorBookingsAPI()])
  .then(() => {
    console.log('\n🎯 DIAGNOSIS COMPLETE');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Debug failed:', error.message);
    process.exit(1);
  });
