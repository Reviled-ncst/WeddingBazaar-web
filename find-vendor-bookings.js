async function findVendorWithBookings() {
  const apiUrl = 'https://weddingbazaar-web.onrender.com';
  
  // Test the complex vendor IDs that are being blocked
  const complexVendorIds = [
    '2-2025-001', '2-2025-002', '2-2025-003', '2-2025-004', '2-2025-005'
  ];
  
  // Test simple vendor IDs that work
  const simpleVendorIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  
  console.log('🔍 SEARCHING FOR VENDOR IDS WITH BOOKING DATA');
  console.log('==============================================\n');
  
  console.log('1️⃣ Testing Complex Vendor IDs (currently blocked):');
  for (const vendorId of complexVendorIds) {
    try {
      const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
      const data = await response.json();
      
      if (response.status === 200 && data.success && data.bookings) {
        console.log(`✅ ${vendorId}: ${data.bookings.length} bookings`);
        if (data.bookings.length > 0) {
          console.log(`   📋 First booking: ${JSON.stringify(data.bookings[0]).substring(0, 100)}...`);
        }
      } else {
        console.log(`❌ ${vendorId}: ${response.status} - ${data.error || data.code || 'No data'}`);
      }
    } catch (error) {
      console.log(`❌ ${vendorId}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n2️⃣ Testing Simple Vendor IDs (currently working):');
  for (const vendorId of simpleVendorIds) {
    try {
      const response = await fetch(`${apiUrl}/api/bookings/vendor/${vendorId}`);
      const data = await response.json();
      
      if (response.status === 200 && data.success && data.bookings) {
        console.log(`✅ ${vendorId}: ${data.bookings.length} bookings`);
        if (data.bookings.length > 0) {
          console.log(`   📋 First booking vendor_id: ${data.bookings[0].vendor_id}, couple_id: ${data.bookings[0].couple_id}`);
        }
      } else {
        console.log(`⚠️ ${vendorId}: ${data.bookings?.length || 0} bookings`);
      }
    } catch (error) {
      console.log(`❌ ${vendorId}: ERROR - ${error.message}`);
    }
  }
  
  console.log('\n🎯 RECOMMENDATION:');
  console.log('Based on the results above, we can:');
  console.log('1. Use a simple vendor ID that has bookings for testing');
  console.log('2. Or wait for the backend fix to deploy to use the real vendor IDs');
  console.log('3. Current mapping: 2-2025-003 → 2 (working but no bookings)');
}

findVendorWithBookings();
