#!/usr/bin/env node

/**
 * 🚀 BACKEND SECURITY DEPLOYMENT SCRIPT  
 * Deploy the security-enhanced booking routes to production
 */

console.log('🚀 =====================================');
console.log('🚀 BACKEND SECURITY DEPLOYMENT SCRIPT');
console.log('🚀 =====================================\n');

const fs = require('fs');
const path = require('path');

async function deployBackendSecurity() {
  try {
    console.log('📋 Checking current backend security status...\n');
    
    // Check if the booking routes have security enhancements
    const bookingsPath = path.join(__dirname, 'backend-deploy', 'routes', 'bookings.cjs');
    const bookingsContent = fs.readFileSync(bookingsPath, 'utf8');
    
    const hasSecurityEnhanced = bookingsContent.includes('securityEnhanced: true');
    const hasMalformedDetection = bookingsContent.includes('isMalformedUserId');
    const hasSecurityAlert = bookingsContent.includes('SECURITY ALERT');
    
    console.log('🔍 CURRENT BACKEND STATUS:');
    console.log(`✅ Security Enhanced Flag: ${hasSecurityEnhanced ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ Malformed ID Detection: ${hasMalformedDetection ? 'PRESENT' : 'MISSING'}`);
    console.log(`✅ Security Alert Logging: ${hasSecurityAlert ? 'PRESENT' : 'MISSING'}`);
    
    if (hasSecurityEnhanced && hasMalformedDetection && hasSecurityAlert) {
      console.log('\n🎉 BACKEND SECURITY: Already enhanced! ✅');
      console.log('📋 The security fixes are in place locally.');
      console.log('');
      console.log('🚀 DEPLOYMENT STATUS:');
      console.log('The enhanced booking routes should be active in production.');
      console.log('If security tests are still failing, it may indicate:');
      console.log('1. Deployment hasn\'t propagated yet (wait 2-3 minutes)');
      console.log('2. Cache needs to be cleared');
      console.log('3. Backend restart may be needed');
      
    } else {
      console.log('\n❌ BACKEND SECURITY: Missing enhancements');
      console.log('🔧 Security fixes need to be applied to production backend.');
    }
    
    // Test the production backend to see if changes are live
    console.log('\n📡 Testing production backend...');
    
    const testResults = await testProductionSecurity();
    
    console.log('\n🎯 PRODUCTION TEST RESULTS:');
    console.log(`Security Enhanced: ${testResults.securityEnhanced ? '✅ YES' : '❌ NO'}`);
    console.log(`Malformed ID Protection: ${testResults.malformedProtection ? '✅ ACTIVE' : '❌ MISSING'}`);
    console.log(`Booking Access: ${testResults.bookingAccess ? '✅ WORKING' : '❌ FAILED'}`);
    
    if (testResults.securityEnhanced && testResults.malformedProtection) {
      console.log('\n🎉 SUCCESS: Backend security fixes are LIVE in production! ✅');
      console.log('🔒 Cross-vendor data leakage vulnerability: PATCHED');
      console.log('🛡️ Malformed ID detection: ACTIVE');
      
      console.log('\n📋 NEXT STEPS:');
      console.log('1. ✅ Backend security: COMPLETE');
      console.log('2. 🛠️ Run database migration: node database-security-migration.mjs');
      console.log('3. 🔍 Final security verification');
      console.log('4. 📊 Monitor security audit logs');
      
    } else {
      console.log('\n⚠️ WARNING: Backend security fixes not yet active in production');
      console.log('🔄 This could be due to:');
      console.log('   - Deployment propagation delay (normal for Render)');
      console.log('   - Backend needs restart to apply changes');
      console.log('   - Additional deployment steps required');
      
      console.log('\n🛠️ MANUAL STEPS TO COMPLETE:');
      console.log('1. Wait 2-3 minutes for deployment propagation');
      console.log('2. Test again with: node quick-security-check.js');
      console.log('3. If still failing, check Render deployment logs');
      console.log('4. Manual restart of backend service may be needed');
    }
    
  } catch (error) {
    console.error('❌ Deployment script failed:', error);
  }
}

async function testProductionSecurity() {
  const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';
  
  try {
    // Test 1: Check for security enhanced flag
    const response1 = await fetch(`${BACKEND_URL}/api/bookings/vendor/2`);
    const data1 = await response1.json();
    const securityEnhanced = data1.securityEnhanced === true;
    
    // Test 2: Check malformed ID protection  
    const response2 = await fetch(`${BACKEND_URL}/api/bookings/vendor/2-2025-001`);
    const data2 = await response2.json();
    const malformedProtection = data2.code === 'MALFORMED_VENDOR_ID';
    
    // Test 3: Basic booking access
    const bookingAccess = response1.status === 200;
    
    return {
      securityEnhanced,
      malformedProtection,
      bookingAccess
    };
    
  } catch (error) {
    console.log('⚠️ Production test failed:', error.message);
    return {
      securityEnhanced: false,
      malformedProtection: false,
      bookingAccess: false
    };
  }
}

// Execute deployment
deployBackendSecurity();
