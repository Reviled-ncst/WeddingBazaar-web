// Execute database vendor mapping fix via API
import fetch from 'node-fetch';

const BACKEND_URL = 'https://weddingbazaar-web.onrender.com';

async function executeDatabaseFix() {
  console.log('🚀 EXECUTING DATABASE VENDOR MAPPING FIX');
  console.log('═══════════════════════════════════════════════');
  console.log('Target: 4 services with null vendor_id');
  console.log('Backend:', BACKEND_URL);
  console.log('Timestamp:', new Date().toISOString());
  
  try {
    // First, let's check if the admin endpoint exists by testing the backend
    console.log('\n1. 🔍 TESTING BACKEND CONNECTION...');
    const healthResponse = await fetch(`${BACKEND_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log(`   Backend Status: ${healthData.status} (${healthData.version})`);
    
    // Since we need to add the endpoint, let's create a direct database update
    // For now, let's use a different approach - create the SQL and execute it
    
    console.log('\n2. 📋 SERVICES NEEDING FIX:');
    const servicesResponse = await fetch(`${BACKEND_URL}/api/services`);
    const servicesData = await servicesResponse.json();
    
    const nullServices = servicesData.services.filter(s => !s.vendor_id || s.vendor_id === 'null');
    nullServices.forEach(service => {
      console.log(`   - ${service.id}: "${service.name || 'Unknown'}"`);
    });
    
    console.log('\n3. 🛠️ APPLYING FIXES VIA DIRECT SQL...');
    
    // Since we don't have direct database access in this environment,
    // let's create a comprehensive fix by updating the backend temporarily
    
    console.log('   Creating temporary fix endpoint...');
    
    // Execute via a backend update - let's create the code and deploy it
    const fixEndpointCode = `
// Add this to your backend routes:
app.post('/api/admin/fix-vendor-mappings', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const fixes = [
      { id: 'SRV-70524', vendor: '2-2025-004' }, // Security → Perfect Weddings Co.
      { id: 'SRV-39368', vendor: '2-2025-003' }, // Photography → Beltran Sound Systems
      { id: 'SRV-71896', vendor: '2-2025-003' }, // Photography → Beltran Sound Systems  
      { id: 'SRV-70580', vendor: '2-2025-003' }  // Photography → Beltran Sound Systems
    ];
    
    let count = 0;
    for (const fix of fixes) {
      const result = await client.query('UPDATE services SET vendor_id = $1 WHERE id = $2', [fix.vendor, fix.id]);
      count += result.rowCount;
    }
    
    await client.query('COMMIT');
    res.json({ success: true, fixed: count });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});`;

    console.log('\n4. 📤 BACKEND ENDPOINT CODE:');
    console.log('═══════════════════════════════════════════════');
    console.log(fixEndpointCode);
    
    console.log('\n5. 🎯 MANUAL EXECUTION OPTION:');
    console.log('If you have direct database access, run these SQL commands:');
    console.log('═══════════════════════════════════════════════');
    console.log("UPDATE services SET vendor_id = '2-2025-004' WHERE id = 'SRV-70524';");
    console.log("UPDATE services SET vendor_id = '2-2025-003' WHERE id = 'SRV-39368';");
    console.log("UPDATE services SET vendor_id = '2-2025-003' WHERE id = 'SRV-71896';");
    console.log("UPDATE services SET vendor_id = '2-2025-003' WHERE id = 'SRV-70580';");
    
    // For now, let me try a simpler approach - update the backend files directly
    console.log('\n6. 🚀 CREATING DEPLOYABLE BACKEND FIX...');
    
    return {
      success: true,
      message: 'Backend fix code generated',
      needsDeployment: true,
      servicesNeedingFix: nullServices.length
    };
    
  } catch (error) {
    console.error('❌ Fix execution failed:', error);
    return { success: false, error: error.message };
  }
}

// Execute the fix
executeDatabaseFix().then(result => {
  if (result.success) {
    console.log('\n✅ DATABASE FIX PREPARED SUCCESSFULLY');
    console.log('Next steps:');
    console.log('1. Deploy backend with admin endpoint');
    console.log('2. Call the endpoint to execute SQL fixes');
    console.log('3. Remove frontend filtering');
    console.log('4. Test booking modal with all services');
  } else {
    console.log('\n❌ Fix preparation failed:', result.error);
  }
});
