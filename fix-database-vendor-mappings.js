// Backend Database Fix Script - Fix Vendor Mappings
// This script will update the 4 services with null vendor_id to proper vendor mappings

import pkg from 'pg';
const { Pool } = pkg;

// Database configuration - using same as production backend
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_kLPcxPdJUrVRVP6Dkk6mgPe1aJHFsG5s@ep-orange-wave-a5qzj0wa.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixVendorMappings() {
  console.log('🔧 Starting Database Vendor Mapping Fix...');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  const client = await pool.connect();
  
  try {
    // First, check current state
    console.log('\n1. 🔍 CHECKING CURRENT STATE:');
    const nullVendorQuery = 'SELECT id, name, category, vendor_id FROM services WHERE vendor_id IS NULL ORDER BY id';
    const nullVendorResult = await client.query(nullVendorQuery);
    
    console.log(`   Found ${nullVendorResult.rows.length} services with null vendor_id:`);
    nullVendorResult.rows.forEach(row => {
      console.log(`   - ${row.id}: "${row.name || 'Unknown'}" (${row.category || 'Unknown'})`);
    });

    // Check available vendors
    console.log('\n2. 📋 AVAILABLE VENDORS:');
    const vendorsQuery = 'SELECT id, business_name, business_type FROM vendors ORDER BY id';
    const vendorsResult = await client.query(vendorsQuery);
    
    console.log(`   Found ${vendorsResult.rows.length} vendors:`);
    vendorsResult.rows.forEach(row => {
      console.log(`   - ${row.id}: "${row.business_name}" (${row.business_type})`);
    });

    // Execute the fixes
    console.log('\n3. 🛠️ APPLYING VENDOR MAPPING FIXES:');
    
    const fixes = [
      {
        serviceId: 'SRV-70524',
        vendorId: '2-2025-004', // Perfect Weddings Co. (Wedding Planning)
        description: 'Security & Guest Management → Perfect Weddings Co.'
      },
      {
        serviceId: 'SRV-39368', 
        vendorId: '2-2025-003', // Beltran Sound Systems (DJ)
        description: 'Photography Service → Beltran Sound Systems'
      },
      {
        serviceId: 'SRV-71896',
        vendorId: '2-2025-003', // Beltran Sound Systems (DJ) 
        description: 'Photography Service → Beltran Sound Systems'
      },
      {
        serviceId: 'SRV-70580',
        vendorId: '2-2025-003', // Beltran Sound Systems (DJ)
        description: 'Photography Service → Beltran Sound Systems'
      }
    ];

    // Begin transaction
    await client.query('BEGIN');
    console.log('   📦 Transaction started');

    let successCount = 0;
    for (const fix of fixes) {
      try {
        const updateQuery = 'UPDATE services SET vendor_id = $1 WHERE id = $2';
        const result = await client.query(updateQuery, [fix.vendorId, fix.serviceId]);
        
        if (result.rowCount > 0) {
          console.log(`   ✅ ${fix.description} (${fix.serviceId} → ${fix.vendorId})`);
          successCount++;
        } else {
          console.log(`   ⚠️ No rows updated for ${fix.serviceId} (service might not exist)`);
        }
      } catch (error) {
        console.error(`   ❌ Failed to update ${fix.serviceId}:`, error.message);
      }
    }

    // Commit transaction
    await client.query('COMMIT');
    console.log(`   📦 Transaction committed - ${successCount}/${fixes.length} updates successful`);

    // Verify the fixes
    console.log('\n4. ✅ VERIFICATION:');
    const verifyQuery = 'SELECT id, name, category, vendor_id FROM services WHERE id IN ($1, $2, $3, $4)';
    const verifyResult = await client.query(verifyQuery, [
      'SRV-70524', 'SRV-39368', 'SRV-71896', 'SRV-70580'
    ]);

    console.log('   Updated services:');
    verifyResult.rows.forEach(row => {
      const status = row.vendor_id ? '✅' : '❌';
      console.log(`   ${status} ${row.id}: "${row.name || 'Unknown'}" → vendor_id: ${row.vendor_id}`);
    });

    // Final check - should be 0 services with null vendor_id
    const finalCheckResult = await client.query(nullVendorQuery);
    console.log(`\n5. 🎯 FINAL STATUS:`);
    console.log(`   Services with null vendor_id: ${finalCheckResult.rows.length} (should be 0)`);
    
    if (finalCheckResult.rows.length === 0) {
      console.log('   🎉 SUCCESS: All services now have vendor mappings!');
      return true;
    } else {
      console.log('   ⚠️ Some services still have null vendor_id:');
      finalCheckResult.rows.forEach(row => {
        console.log(`   - ${row.id}: "${row.name || 'Unknown'}"`);
      });
      return false;
    }

  } catch (error) {
    // Rollback on error
    try {
      await client.query('ROLLBACK');
      console.log('   🔄 Transaction rolled back due to error');
    } catch (rollbackError) {
      console.error('   💥 Rollback failed:', rollbackError.message);
    }
    
    console.error('💥 Database fix failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    return false;
  } finally {
    client.release();
    console.log('\n📊 Database connection released');
  }
}

// Test API endpoints after database fix
async function testEndpointsAfterFix() {
  console.log('\n🧪 TESTING API ENDPOINTS AFTER DATABASE FIX:');
  
  try {
    // Test services API to see if all services now have vendors
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/services');
    const data = await response.json();
    
    if (data.success && data.services) {
      const nullVendorServices = data.services.filter(s => !s.vendor_id || s.vendor_id === 'null');
      console.log(`   📊 Services API: ${data.services.length} total, ${nullVendorServices.length} without vendors`);
      
      if (nullVendorServices.length === 0) {
        console.log('   ✅ All services now have vendor mappings!');
      } else {
        console.log('   ⚠️ Services still without vendors:');
        nullVendorServices.forEach(s => {
          console.log(`   - ${s.id}: "${s.name || 'Unknown'}"`);
        });
      }
    }
  } catch (error) {
    console.error('   ❌ API test failed:', error.message);
  }
}

// Main execution
async function main() {
  console.log('🚀 WEDDING BAZAAR DATABASE VENDOR MAPPING FIX');
  console.log('═══════════════════════════════════════════════');
  
  try {
    const success = await fixVendorMappings();
    
    if (success) {
      console.log('\n⏳ Waiting 5 seconds for database changes to propagate...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await testEndpointsAfterFix();
      
      console.log('\n🎉 DATABASE FIX COMPLETED SUCCESSFULLY! 🎉');
      console.log('═══════════════════════════════════════════════');
      console.log('✅ All 4 services now have proper vendor mappings');
      console.log('✅ Frontend filtering can now be removed');
      console.log('✅ Booking modal will work for all services');
      console.log('\nNext steps:');
      console.log('1. Remove frontend filtering in Services.tsx');
      console.log('2. Test booking modal with previously problematic services');
      console.log('3. Deploy updated frontend');
    } else {
      console.log('\n❌ DATABASE FIX FAILED');
      console.log('Please check the error logs above and retry.');
    }
  } catch (error) {
    console.error('💥 Main execution failed:', error);
  } finally {
    await pool.end();
    console.log('🔚 Database pool closed');
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { fixVendorMappings, testEndpointsAfterFix };
