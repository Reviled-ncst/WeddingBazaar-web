#!/usr/bin/env node

/**
 * 🔍 DEBUG ENHANCED BOOKINGS API: Find the 500 error cause
 */

console.log('🔍 ====================================');
console.log('🔍 DEBUGGING ENHANCED BOOKINGS API');
console.log('🔍 ====================================');

async function debugEnhancedBookings() {
  try {
    console.log('\n📊 1. TESTING BASIC BOOKINGS API');
    console.log('----------------------------------');
    
    // First test the basic bookings endpoint
    try {
      const basicResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/couple/1-2025-001');
      const basicData = await basicResponse.json();
      
      console.log(`✅ Basic Bookings Status: ${basicResponse.status}`);
      console.log(`📅 Basic Bookings Found: ${basicData.bookings?.length || 0}`);
      
      if (basicData.bookings) {
        basicData.bookings.forEach((booking, index) => {
          console.log(`   ${index + 1}. ${booking.service_name} - Vendor: ${booking.vendor_name || 'NULL'}`);
        });
      }
    } catch (error) {
      console.error('❌ Basic bookings test failed:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Debug test failed:', error.message);
  }

  try {
    console.log('\n📊 2. TESTING ENHANCED BOOKINGS WITH ERROR DETAILS');
    console.log('--------------------------------------------------');
    
    const enhancedResponse = await fetch('https://weddingbazaar-web.onrender.com/api/bookings/enhanced?coupleId=1-2025-001');
    const responseText = await enhancedResponse.text();
    
    console.log(`📊 Enhanced Status: ${enhancedResponse.status}`);
    console.log(`📊 Response Headers:`, Object.fromEntries(enhancedResponse.headers));
    console.log(`📊 Response Body: ${responseText.substring(0, 500)}${responseText.length > 500 ? '...' : ''}`);
    
    if (enhancedResponse.status === 500) {
      try {
        const errorData = JSON.parse(responseText);
        console.log('❌ Error Details:', errorData);
      } catch (e) {
        console.log('❌ Raw error response (not JSON):', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ Enhanced bookings debug failed:', error.message);
  }

  try {
    console.log('\n📊 3. TESTING HEALTH ENDPOINT');
    console.log('-----------------------------');
    
    const healthResponse = await fetch('https://weddingbazaar-web.onrender.com/api/health');
    const healthData = await healthResponse.json();
    
    console.log(`✅ Health Status: ${healthResponse.status}`);
    console.log(`📊 Health Data:`, healthData);
    
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function main() {
  await debugEnhancedBookings();
  
  console.log('\n🎯 ====================================');
  console.log('🎯 DEBUG SUMMARY');
  console.log('🎯 ====================================');
  console.log('📋 Based on the debug results:');
  console.log('1. Check if basic bookings API works');
  console.log('2. Identify the 500 error cause in enhanced API');
  console.log('3. Fix the SQL syntax or logic issue');
  console.log('4. Redeploy the fixed backend');
  console.log('🎯 ====================================');
}

if (require.main === module) {
  main();
}
