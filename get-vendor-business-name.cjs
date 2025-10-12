#!/usr/bin/env node

/**
 * 🔍 GET VENDOR BUSINESS NAME: Simple vendor name retrieval
 */

console.log('🔍 ====================================');
console.log('🔍 GET VENDOR BUSINESS NAME');
console.log('🔍 ====================================');

async function getVendorBusinessName() {
  try {
    console.log('\n🏪 1. TESTING VENDORS API');
    console.log('-------------------------');
    
    const vendorsResponse = await fetch('https://weddingbazaar-web.onrender.com/api/vendors/featured');
    const vendorsData = await vendorsResponse.json();
    
    console.log(`✅ Vendors API Status: ${vendorsResponse.status}`);
    console.log(`🏪 Vendors Found: ${vendorsData.vendors?.length || 0}`);
    
    if (vendorsData.vendors) {
      console.log('\n📋 VENDOR BUSINESS NAMES:');
      vendorsData.vendors.forEach(vendor => {
        console.log(`   ID: ${vendor.id} → Business Name: "${vendor.name}"`);
        console.log(`   Category: ${vendor.category} | Rating: ${vendor.rating}★`);
        console.log('');
      });
      
      // Find the vendor with ID that matches our booking vendor_id
      const targetVendor = vendorsData.vendors.find(v => v.id === '2-2025-004');
      if (targetVendor) {
        console.log('🎯 TARGET VENDOR FOUND:');
        console.log(`   Business Name: "${targetVendor.name}"`);
        console.log(`   This should be displayed instead of "vendor 2"`);
      }
    }
    
  } catch (error) {
    console.error('❌ Vendor API test failed:', error.message);
  }

  try {
    console.log('\n📅 2. TESTING SIMPLE BOOKING QUERY');
    console.log('----------------------------------');
    
    // Try to get the raw booking data to see vendor_id
    const bookingResponse = await fetch('https://weddingbazaar-web.onrender.com/api/debug/sample/bookings');
    const bookingData = await bookingResponse.json();
    
    console.log(`📊 Debug API Status: ${bookingResponse.status}`);
    if (bookingData.sample && bookingData.sample.length > 0) {
      console.log('\n📋 BOOKING VENDOR IDs:');
      bookingData.sample.forEach((booking, index) => {
        console.log(`   Booking ${index + 1}: vendor_id = "${booking.vendor_id}"`);
        console.log(`   Service: ${booking.service_name}`);
        console.log(`   Status: ${booking.status}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Booking debug failed:', error.message);
  }
}

async function main() {
  await getVendorBusinessName();
  
  console.log('\n🎯 ====================================');
  console.log('🎯 SUMMARY');
  console.log('🎯 ====================================');
  console.log('📋 The real issue is:');
  console.log('1. Frontend is using SIMULATED bookings');
  console.log('2. Backend API endpoints are returning 500 errors');
  console.log('3. Need to fix the backend SQL queries');
  console.log('4. Vendor business names are available from vendors API');
  console.log('🎯 ====================================');
}

if (require.main === module) {
  main();
}
