const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorIDsAndServices() {
  try {
    console.log('🔍 CHECKING VENDOR IDs vs SERVICE VENDOR_IDs\n');
    console.log('='.repeat(70));
    
    // Check what vendor IDs we have in vendors table
    const vendors = await sql`
      SELECT id, user_id, business_name, business_type
      FROM vendors
      ORDER BY id
    `;
    
    console.log('\n📊 VENDORS TABLE (id vs user_id):\n');
    vendors.forEach(v => {
      console.log(`Vendor ID: ${v.id.padEnd(20)} | User ID: ${v.user_id?.padEnd(20) || 'NULL'.padEnd(20)} | ${v.business_name}`);
    });
    
    // Check what vendor_ids are used in services
    const serviceVendors = await sql`
      SELECT DISTINCT vendor_id, COUNT(*) as service_count
      FROM services
      GROUP BY vendor_id
      ORDER BY vendor_id
    `;
    
    console.log('\n📦 VENDOR IDs USED IN SERVICES:\n');
    serviceVendors.forEach(sv => {
      console.log(`${sv.vendor_id.padEnd(20)} | ${sv.service_count} services`);
    });
    
    // Check if there are mismatches
    console.log('\n⚠️  CHECKING FOR MISMATCHES:\n');
    
    const vendorIds = vendors.map(v => v.id);
    const serviceVendorIds = serviceVendors.map(sv => sv.vendor_id);
    
    const servicesWithInvalidVendors = serviceVendorIds.filter(svId => !vendorIds.includes(svId));
    
    if (servicesWithInvalidVendors.length > 0) {
      console.log('❌ BROKEN LINKS FOUND:');
      servicesWithInvalidVendors.forEach(vid => {
        console.log(`   - Vendor ID ${vid} used in services but doesn't exist in vendors table`);
      });
    } else {
      console.log('✅ All service vendor_ids match existing vendors!');
    }
    
    console.log('\n💡 IMPORTANT:');
    console.log('   • Vendor table uses: vendor.id (can be VEN-XXXXX or 2-2025-XXX)');
    console.log('   • Services reference: vendor.id (NOT user_id)');
    console.log('   • This is CORRECT - services should reference vendor.id');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkVendorIDsAndServices();
