// Call the admin endpoint to execute the database vendor mapping fix
import fetch from 'node-fetch';

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function executeVendorMappingFix() {
  console.log('🚀 EXECUTING VENDOR MAPPING DATABASE FIX');
  console.log('═══════════════════════════════════════════════');
  console.log('Backend:', BACKEND_URL);
  console.log('Endpoint: POST /api/admin/fix-vendor-mappings');
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // First verify backend is responsive
    console.log('\n1. 🔍 CHECKING BACKEND STATUS...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   Backend: ${healthData.status} (${healthData.version})`);
    console.log(`   Database: ${healthData.database}`);
    
    // Check current services before fix
    console.log('\n2. 📊 CHECKING SERVICES BEFORE FIX...');
    const servicesResponse = await fetch(`${BACKEND_URL}/api/services`);
    const servicesData = await servicesResponse.json();
    
    const nullServices = servicesData.services.filter(s => !s.vendor_id || s.vendor_id === 'null');
    console.log(`   Services with null vendor_id: ${nullServices.length}`);
    nullServices.forEach(s => {
      console.log(`   - ${s.id}: "${s.name || 'Unknown'}"`);
    });
    
    if (nullServices.length === 0) {
      console.log('   ✅ All services already have vendor mappings!');
      return { success: true, alreadyFixed: true };
    }
    
    // Execute the fix
    console.log('\n3. 🛠️ EXECUTING DATABASE FIX...');
    console.log('   Calling admin endpoint...');
    
    const fixResponse = await fetch(`${BACKEND_URL}/api/admin/fix-vendor-mappings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!fixResponse.ok) {
      throw new Error(`Admin endpoint returned ${fixResponse.status}: ${fixResponse.statusText}`);
    }
    
    const fixResult = await fixResponse.json();
    console.log('\n4. 📋 FIX EXECUTION RESULT:');
    console.log(`   Success: ${fixResult.success}`);
    console.log(`   Services Fixed: ${fixResult.servicesFixed}/${fixResult.totalServices}`);
    console.log(`   Remaining Null Vendors: ${fixResult.remainingNullVendors}`);
    
    if (fixResult.results) {
      console.log('\n   📝 Detailed Results:');
      fixResult.results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        console.log(`   ${status} ${result.description}`);
        if (!result.success && result.error) {
          console.log(`      Error: ${result.error}`);
        }
      });
    }
    
    // Verify the fix worked
    console.log('\n5. ✅ VERIFICATION AFTER FIX...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const verifyResponse = await fetch(`${BACKEND_URL}/api/services`);
    const verifyData = await verifyResponse.json();
    
    const remainingNullServices = verifyData.services.filter(s => !s.vendor_id || s.vendor_id === 'null');
    console.log(`   Services with null vendor_id: ${remainingNullServices.length}`);
    
    if (remainingNullServices.length === 0) {
      console.log('   🎉 SUCCESS: All services now have vendor mappings!');
    } else {
      console.log('   ⚠️ Some services still need fixing:');
      remainingNullServices.forEach(s => {
        console.log(`   - ${s.id}: "${s.name || 'Unknown'}"`);
      });
    }
    
    return {
      success: fixResult.success,
      servicesFixed: fixResult.servicesFixed,
      remainingIssues: remainingNullServices.length,
      fullyFixed: remainingNullServices.length === 0
    };
    
  } catch (error) {
    console.error('\n💥 EXECUTION FAILED:', error);
    return { success: false, error: error.message };
  }
}

// Execute the fix
executeVendorMappingFix().then(result => {
  console.log('\n🎯 FINAL RESULT:');
  console.log('═══════════════════════════════════════════════');
  
  if (result.success && result.fullyFixed) {
    console.log('🎉 DATABASE FIX COMPLETED SUCCESSFULLY! 🎉');
    console.log('✅ All services now have proper vendor mappings');
    console.log('✅ Booking modal will work for all services');
    console.log('✅ Frontend filtering can now be removed');
    console.log('\n📋 NEXT STEPS:');
    console.log('1. Remove frontend filtering in Services.tsx');
    console.log('2. Test booking modal with previously problematic services');
    console.log('3. Deploy updated frontend');
  } else if (result.success) {
    console.log(`✅ Partial fix completed: ${result.servicesFixed} services fixed`);
    console.log(`⚠️ ${result.remainingIssues} services still need manual attention`);
  } else {
    console.log('❌ Fix failed:', result.error || 'Unknown error');
    console.log('Please check the logs and try again');
  }
});
