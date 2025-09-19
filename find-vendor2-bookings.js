// Check all bookings to find data for vendor 2-2025-003
const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function findVendor2Bookings() {
  try {
    console.log('🔍 Searching for vendor 2-2025-003 bookings...');
    
    // Check different couple IDs to find bookings
    const couplesToCheck = [
      '1-2025-001', '1-2025-002', '1-2025-003', 
      '2-2025-001', '2-2025-002', '2-2025-003',
      '3-2025-001', '3-2025-002', '3-2025-003'
    ];
    
    let allBookings = [];
    
    for (const coupleId of couplesToCheck) {
      try {
        console.log(`📋 Checking couple ${coupleId}...`);
        const response = await fetch(`${API_BASE}/api/bookings/couple/${coupleId}?limit=20`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.bookings && data.bookings.length > 0) {
            console.log(`✅ Found ${data.bookings.length} bookings for couple ${coupleId}`);
            allBookings.push(...data.bookings);
            
            // Check if any belong to vendor 2-2025-003
            const vendor2Bookings = data.bookings.filter(b => 
              b.vendorId.toString() === '2-2025-003' || 
              b.vendorId.toString() === '2' ||
              b.vendorId === '2-2025-003' ||
              b.vendorId === 2
            );
            
            if (vendor2Bookings.length > 0) {
              console.log(`🎯 FOUND VENDOR 2-2025-003 BOOKINGS:`, vendor2Bookings);
            }
          }
        } else if (response.status !== 404) {
          console.log(`⚠️ API error for couple ${coupleId}: ${response.status}`);
        }
      } catch (error) {
        // Ignore individual couple errors
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`Total bookings found: ${allBookings.length}`);
    
    if (allBookings.length > 0) {
      console.log('\n🏪 All vendors found:');
      const vendors = [...new Set(allBookings.map(b => `${b.vendorId} (${b.vendorName})`))];
      vendors.forEach(vendor => console.log(`- ${vendor}`));
      
      console.log('\n👥 All couples found:');
      const couples = [...new Set(allBookings.map(b => b.coupleId))];
      couples.forEach(couple => console.log(`- ${couple}`));
      
      // Check if vendor 2-2025-003 has any bookings
      const vendor2Bookings = allBookings.filter(b => 
        b.vendorId.toString().includes('2-2025-003') || 
        b.vendorId.toString() === '2' ||
        b.vendorId === 2
      );
      
      if (vendor2Bookings.length > 0) {
        console.log('\n🎯 VENDOR 2-2025-003 BOOKINGS FOUND:');
        vendor2Bookings.forEach((booking, i) => {
          console.log(`${i + 1}. ${booking.serviceType} - ${booking.coupleId} - ₱${booking.amount}`);
        });
      } else {
        console.log('\n❌ NO BOOKINGS FOUND FOR VENDOR 2-2025-003');
        console.log('Need to either:');
        console.log('1. Create test booking for vendor 2-2025-003');
        console.log('2. Use vendor 1 instead (which has real data)');
        console.log('3. Update mock data to show real couple format');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

findVendor2Bookings();
