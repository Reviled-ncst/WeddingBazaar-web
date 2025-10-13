#!/usr/bin/env node

/**
 * 🔍 Quick Security Status Check
 */

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

console.log('🔍 QUICK SECURITY STATUS CHECK');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

async function quickSecurityCheck() {
  try {
    // Test 1: Regular vendor endpoint
    console.log('\n1. Testing regular vendor endpoint...');
    const regularTest = await fetch(`${BACKEND_URL}/api/bookings/vendor/2`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const regularData = await regularTest.json();
    
    console.log(`Status: ${regularTest.status}`);
    console.log(`Security Enhanced: ${regularData.securityEnhanced || false}`);
    console.log(`Bookings Count: ${regularData.bookings?.length || 0}`);
    
    // Test 2: Malformed ID endpoint
    console.log('\n2. Testing malformed ID detection...');
    const malformedTest = await fetch(`${BACKEND_URL}/api/bookings/vendor/2-2025-001`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const malformedData = await malformedTest.json();
    
    console.log(`Status: ${malformedTest.status}`);
    console.log(`Error Code: ${malformedData.code || 'none'}`);
    console.log(`Error Message: ${malformedData.error || 'none'}`);
    
    // Test 3: API Health
    console.log('\n3. Testing API health...');
    const healthTest = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthTest.json();
    
    console.log(`Health Status: ${healthTest.status}`);
    console.log(`Version: ${healthData.version}`);
    
    // Summary
    console.log('\n🎯 SECURITY STATUS SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (regularData.securityEnhanced) {
      console.log('✅ Backend Security: ENHANCED');
    } else {
      console.log('❌ Backend Security: BASIC');
    }
    
    if (malformedData.code === 'MALFORMED_VENDOR_ID') {
      console.log('✅ Malformed ID Protection: ACTIVE');
    } else {
      console.log('❌ Malformed ID Protection: MISSING');
    }
    
    console.log('\n🚀 Frontend Development Server: http://localhost:5177');
    console.log('🌐 Backend API: https://weddingbazaar-web.onrender.com');
    
  } catch (error) {
    console.error('❌ Security check failed:', error.message);
  }
}

quickSecurityCheck();
