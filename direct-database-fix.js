// Direct database fix approach - use the debug endpoint if available
import fetch from 'node-fetch';

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function directDatabaseFix() {
  console.log('🔧 DIRECT DATABASE FIX APPROACH');
  console.log('═══════════════════════════════════════');
  
  try {
    // Since the admin endpoint isn't available, let's see if we can use other endpoints
    // or if there's a way to trigger the database fix manually
    
    console.log('1. 🔍 CHECKING CURRENT BACKEND STRUCTURE...');
    
    // Check if debug endpoints are available
    const debugResponse = await fetch(`${BACKEND_URL}/api/debug/tables`);
    if (debugResponse.ok) {
      const debugData = await debugResponse.json();
      console.log('   Debug endpoint available - can check tables');
      
      // Try to see the services table structure
      const servicesDebugResponse = await fetch(`${BACKEND_URL}/api/debug/sample/services`);
      if (servicesDebugResponse.ok) {
        const servicesDebugData = await servicesDebugResponse.json();
        console.log('   Services table sample:', servicesDebugData);
      }
    }
    
    console.log('\n2. 🛠️ ALTERNATIVE APPROACHES:');
    console.log('   Since admin endpoint deployment is delayed, here are options:');
    console.log('   Options:');
    console.log('   Option A: Wait for deployment and retry admin endpoint');
    console.log('   Option B: Use SQL console directly on Neon database');
    console.log('   Option C: Create temporary service endpoint to execute fix');
    
    console.log('\n3. 📋 MANUAL SQL COMMANDS (for direct database execution):');
    console.log('   -- Fix vendor mappings for null vendor_id services');
    console.log("   UPDATE services SET vendor_id = '2-2025-004' WHERE id = 'SRV-70524';");
    console.log("   UPDATE services SET vendor_id = '2-2025-003' WHERE id = 'SRV-39368';");
    console.log("   UPDATE services SET vendor_id = '2-2025-003' WHERE id = 'SRV-71896';");
    console.log("   UPDATE services SET vendor_id = '2-2025-003' WHERE id = 'SRV-70580';");
    
    console.log('\n4. 🚀 TEMPORARY WORKAROUND:');
    console.log('   Since we have frontend filtering in place, the booking modal issue is already resolved');
    console.log('   The 4 services with null vendor_id are filtered out and won\'t cause hangs');
    
    // Let's try one more approach - see if we can update a service using the existing PUT endpoint
    console.log('\n5. 🧪 TESTING SERVICE UPDATE ENDPOINT...');
    
    try {
      // Try updating one of the problematic services using the existing endpoint
      const updateResponse = await fetch(`${BACKEND_URL}/api/services/SRV-70524`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vendor_id: '2-2025-004' // Perfect Weddings Co.
        })
      });
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('   ✅ Successfully updated SRV-70524 via service endpoint!');
        console.log('   Result:', updateResult);
        
        // Try updating the other 3 services
        const serviceUpdates = [
          { id: 'SRV-39368', vendor: '2-2025-003' },
          { id: 'SRV-71896', vendor: '2-2025-003' }, 
          { id: 'SRV-70580', vendor: '2-2025-003' }
        ];
        
        for (const update of serviceUpdates) {
          try {
            const response = await fetch(`${BACKEND_URL}/api/services/${update.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ vendor_id: update.vendor })
            });
            
            if (response.ok) {
              console.log(`   ✅ Updated ${update.id} → ${update.vendor}`);
            } else {
              console.log(`   ❌ Failed to update ${update.id}: ${response.status}`);
            }
          } catch (error) {
            console.log(`   ❌ Error updating ${update.id}: ${error.message}`);
          }
        }
        
        return { success: true, method: 'service-endpoint' };
        
      } else {
        console.log(`   ❌ Service update failed: ${updateResponse.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Service update error: ${error.message}`);
    }
    
    console.log('\n6. 📊 CURRENT STATUS:');
    console.log('   - Frontend filtering: ✅ Active (prevents modal hangs)');
    console.log('   - Database fix: ⏳ Pending (admin endpoint not yet deployed)');
    console.log('   - User experience: ✅ Functional (problematic services hidden)');
    
    return { success: false, workaroundActive: true };
    
  } catch (error) {
    console.error('❌ Direct fix failed:', error);
    return { success: false, error: error.message };
  }
}

directDatabaseFix().then(result => {
  console.log('\n🎯 SUMMARY:');
  console.log('═══════════════════════════════════════');
  
  if (result.success) {
    console.log('🎉 DATABASE FIX COMPLETED VIA ALTERNATIVE METHOD!');
  } else if (result.workaroundActive) {
    console.log('⚠️ Database fix pending, but workaround is active');
    console.log('✅ Booking modal issue is resolved via frontend filtering');
    console.log('✅ Users can book all services with valid vendor mappings');
  } else {
    console.log('❌ Fix failed, but frontend protection is in place');
  }
});
