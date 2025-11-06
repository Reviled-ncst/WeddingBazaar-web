#!/usr/bin/env node
/**
 * DIRECT SQL FIX - Vendor Services ID Migration
 * 
 * This script updates all services with vendor_id = 'VEN-00002' 
 * to use the UUID vendor_id = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6'
 * 
 * ⚠️ THIS WILL UPDATE 19 SERVICES IN PRODUCTION DATABASE
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

const LEGACY_VENDOR_ID = 'VEN-00002';
const UUID_VENDOR_ID = '6fe3dc77-6774-4de8-ae2e-81a8ffb258f6';

async function fixVendorServices() {
  console.log('\n🔧 VENDOR SERVICES ID MIGRATION');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Converting vendor_id: "${LEGACY_VENDOR_ID}" → "${UUID_VENDOR_ID}"`);
  console.log('Database:', process.env.DATABASE_URL ? '✅ Connected' : '❌ Not configured');
  console.log('Timestamp:', new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Count affected services BEFORE update
    console.log('1️⃣ CHECKING AFFECTED SERVICES...');
    const beforeCount = await sql`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE vendor_id = ${LEGACY_VENDOR_ID}
    `;
    console.log(`   Found ${beforeCount[0].count} services with legacy vendor_id\n`);

    if (beforeCount[0].count === 0) {
      console.log('✅ No services need updating. Migration already complete or vendor_id not found.');
      return;
    }

    // Step 2: Show sample services before update
    console.log('2️⃣ SAMPLE SERVICES (Before):\n');
    const sampleBefore = await sql`
      SELECT id, name, category, vendor_id 
      FROM services 
      WHERE vendor_id = ${LEGACY_VENDOR_ID}
      LIMIT 5
    `;
    sampleBefore.forEach((service, i) => {
      console.log(`   ${i + 1}. [${service.id}] ${service.name || 'Untitled'}`);
      console.log(`      Category: ${service.category || 'N/A'}`);
      console.log(`      Current vendor_id: ${service.vendor_id}\n`);
    });

    // Step 3: Execute UPDATE
    console.log('3️⃣ EXECUTING SQL UPDATE...');
    console.log(`   SQL: UPDATE services SET vendor_id = '${UUID_VENDOR_ID}' WHERE vendor_id = '${LEGACY_VENDOR_ID}';\n`);
    
    const updateResult = await sql`
      UPDATE services 
      SET vendor_id = ${UUID_VENDOR_ID}
      WHERE vendor_id = ${LEGACY_VENDOR_ID}
    `;
    
    console.log(`   ✅ Updated ${updateResult.length || beforeCount[0].count} services\n`);

    // Step 4: Verify update
    console.log('4️⃣ VERIFYING UPDATE...');
    const afterCount = await sql`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE vendor_id = ${UUID_VENDOR_ID}
    `;
    console.log(`   Services with UUID vendor_id: ${afterCount[0].count}`);

    const remainingLegacy = await sql`
      SELECT COUNT(*) as count 
      FROM services 
      WHERE vendor_id = ${LEGACY_VENDOR_ID}
    `;
    console.log(`   Services with legacy vendor_id: ${remainingLegacy[0].count}\n`);

    // Step 5: Show sample services after update
    console.log('5️⃣ SAMPLE SERVICES (After):\n');
    const sampleAfter = await sql`
      SELECT id, name, category, vendor_id 
      FROM services 
      WHERE vendor_id = ${UUID_VENDOR_ID}
      LIMIT 5
    `;
    sampleAfter.forEach((service, i) => {
      console.log(`   ${i + 1}. [${service.id}] ${service.name || 'Untitled'}`);
      console.log(`      Category: ${service.category || 'N/A'}`);
      console.log(`      Updated vendor_id: ${service.vendor_id}\n`);
    });

    // Step 6: Final status
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✅ Services migrated: ${beforeCount[0].count}`);
    console.log(`✅ Remaining legacy IDs: ${remainingLegacy[0].count}`);
    console.log(`✅ Total services with UUID: ${afterCount[0].count}`);
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 NEXT STEPS:');
    console.log('1. Test vendor services page: https://weddingbazaarph.web.app/vendor/services');
    console.log('2. Login as vendor (bltrn.michael@gmail.com)');
    console.log('3. Verify all 19 services are visible');
    console.log('4. Test "Add Service" form');
    console.log('5. Verify service cards display correctly\n');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED');
    console.error('═══════════════════════════════════════════════════════');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('═══════════════════════════════════════════════════════\n');
    process.exit(1);
  }
}

// Execute migration
if (require.main === module) {
  fixVendorServices()
    .then(() => {
      console.log('✅ Script completed successfully\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error.message);
      process.exit(1);
    });
}

module.exports = { fixVendorServices };
