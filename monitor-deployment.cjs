#!/usr/bin/env node

/**
 * 🔍 BACKEND DEPLOYMENT MONITOR
 * Monitors when the vendor ID fix is deployed to production
 */

console.log('🔍 =============================================');
console.log('🔍 BACKEND DEPLOYMENT MONITOR');
console.log('🔍 =============================================\n');

async function monitorDeployment() {
  const testVendorId = '2-2025-003';
  const apiUrl = 'https://weddingbazaar-web.onrender.com';
  const maxAttempts = 20; // Monitor for ~10 minutes
  const intervalMs = 30000; // Check every 30 seconds
  
  console.log(`🎯 Monitoring fix deployment for vendor ID: ${testVendorId}`);
  console.log(`📡 API URL: ${apiUrl}`);
  console.log(`⏱️ Checking every ${intervalMs/1000} seconds (max ${maxAttempts} attempts)\n`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxAttempts} - ${new Date().toLocaleTimeString()}`);
      
      const response = await fetch(`${apiUrl}/api/bookings/vendor/${testVendorId}`);
      const data = await response.json();
      
      console.log(`   Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log('   ✅ SUCCESS! Vendor ID is now accepted');
        console.log('\n🎉 DEPLOYMENT SUCCESSFUL!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Backend fix deployed successfully');
        console.log('✅ Vendor ID validation now working correctly');
        console.log('✅ Frontend booking page should now load bookings');
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Refresh the vendor booking page in your browser');
        console.log('2. Login as vendor (vendor0@gmail.com)');
        console.log('3. Navigate to bookings - should now show data');
        break;
        
      } else if (data.code === 'MALFORMED_VENDOR_ID') {
        console.log('   ⏳ Still waiting for deployment...');
        console.log(`   📝 Response: ${data.error}`);
        
      } else {
        console.log(`   ⚠️ Unexpected response: ${JSON.stringify(data)}`);
      }
      
      if (attempt < maxAttempts) {
        console.log(`   ⏰ Waiting ${intervalMs/1000} seconds before next check...\n`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
      
    } catch (error) {
      console.log(`   ❌ Request failed: ${error.message}`);
      
      if (attempt < maxAttempts) {
        console.log(`   ⏰ Waiting ${intervalMs/1000} seconds before retry...\n`);
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    }
  }
  
  console.log('\n📋 MONITORING COMPLETE');
  console.log('If the fix is still not deployed, you may need to:');
  console.log('1. Check Render dashboard for deployment status');
  console.log('2. Manually trigger a deployment if needed');
  console.log('3. Verify the backend-deploy/index.js file has the correct changes');
}

monitorDeployment().catch(console.error);
