#!/usr/bin/env node

// Quick script to check the actual database structure and field names
const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function checkDatabaseStructure() {
  try {
    console.log('🔍 CHECKING ACTUAL DATABASE STRUCTURE');
    console.log('=====================================\n');
    
    // Get raw response to see actual field names
    const response = await fetch(`${BACKEND_URL}/api/bookings/couple/1-2025-001`);
    const data = await response.json();
    
    console.log('📊 RAW API RESPONSE:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.bookings && data.bookings.length > 0) {
      console.log('\n🔑 ACTUAL FIELD NAMES IN BOOKING:');
      console.log('=================================');
      const booking = data.bookings[0];
      Object.keys(booking).forEach(key => {
        console.log(`  ${key}: ${typeof booking[key]} = ${booking[key]}`);
      });
    }
    
    // Also check general bookings endpoint
    console.log('\n\n🔍 CHECKING GENERAL BOOKINGS ENDPOINT:');
    console.log('======================================');
    const generalResponse = await fetch(`${BACKEND_URL}/api/bookings`);
    const generalData = await generalResponse.json();
    
    if (generalData.bookings && generalData.bookings.length > 0) {
      console.log('\n📋 GENERAL BOOKINGS SAMPLE:');
      console.log(JSON.stringify(generalData.bookings[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabaseStructure();
