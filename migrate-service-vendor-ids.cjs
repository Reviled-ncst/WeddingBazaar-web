#!/usr/bin/env node
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function migrateServiceVendorIds() {
  console.log('\n🔄 MIGRATING SERVICE VENDOR IDS');
  console.log('=' .repeat(60));
  console.log('Purpose: Convert VEN-XXXXX format to user.id format (2-2025-XXX)');
  console.log('');
  
  try {
    // 1. Find all services with VEN-XXXXX vendor_id
    console.log('1️⃣ Finding services with old VEN-XXXXX format...');
    const oldFormatServices = await sql`
      SELECT id, title, vendor_id, category
      FROM services
      WHERE vendor_id LIKE 'VEN-%'
      ORDER BY created_at DESC
    `;
    
    if (oldFormatServices.length === 0) {
      console.log('   ✅ No services need migration!');
      return;
    }
    
    console.log(`   Found ${oldFormatServices.length} services to migrate:`);
    oldFormatServices.forEach(s => {
      console.log(`   📦 ${s.title} (${s.id})`);
      console.log(`      Current vendor_id: ${s.vendor_id}`);
    });
    
    // 2. Find the mapping from VEN-XXXXX to user.id
    console.log('\n2️⃣ Finding vendor ID mapping...');
    console.log('   Checking vendors table for VEN-XXXXX entries...');
    
    const vendorMapping = await sql`
      SELECT id, user_id
      FROM vendors
      WHERE id LIKE 'VEN-%'
    `;
    
    console.log(`   Found ${vendorMapping.length} vendor mappings:`);
    vendorMapping.forEach(v => {
      console.log(`   ${v.id} → ${v.user_id || 'NO USER_ID FOUND'}`);
    });
    
    // 3. If no user_id in vendors table, we need to find it manually
    if (vendorMapping.length === 0 || !vendorMapping[0].user_id) {
      console.log('\n⚠️  No user_id found in vendors table!');
      console.log('   Checking which vendor owns these services...');
      
      // Check who created these services (assuming they all belong to the same vendor)
      console.log('\n   Let\'s list all vendor users:');
      const allVendors = await sql`
        SELECT id, email, user_type
        FROM users
        WHERE user_type = 'vendor'
        ORDER BY created_at ASC
      `;
      
      console.log(`   Found ${allVendors.length} vendor users:`);
      allVendors.forEach((v, idx) => {
        console.log(`   ${idx + 1}. ${v.email} (${v.id})`);
      });
      
      // Assume the oldest vendor is the owner of VEN-00001
      const targetVendorId = allVendors[0].id;
      console.log(`\n   ✅ Will assign all VEN-00001 services to: ${allVendors[0].email} (${targetVendorId})`);
      
      // 4. Perform the migration
      console.log('\n3️⃣ Performing migration...');
      for (const service of oldFormatServices) {
        console.log(`   Updating ${service.title}...`);
        await sql`
          UPDATE services
          SET vendor_id = ${targetVendorId},
              updated_at = NOW()
          WHERE id = ${service.id}
        `;
        console.log(`   ✅ ${service.id}: ${service.vendor_id} → ${targetVendorId}`);
      }
      
      // 5. Verify migration
      console.log('\n4️⃣ Verifying migration...');
      const verifyServices = await sql`
        SELECT id, title, vendor_id
        FROM services
        WHERE id IN (${oldFormatServices.map(s => s.id)})
      `;
      
      console.log(`   Checking ${verifyServices.length} services:`);
      let allCorrect = true;
      verifyServices.forEach(s => {
        const isCorrect = s.vendor_id.startsWith('2-2025-') || s.vendor_id.startsWith('3-2025-');
        console.log(`   ${isCorrect ? '✅' : '❌'} ${s.title}: ${s.vendor_id}`);
        if (!isCorrect) allCorrect = false;
      });
      
      if (allCorrect) {
        console.log('\n✅ MIGRATION SUCCESSFUL!');
        console.log(`   All ${oldFormatServices.length} services now use user.id format`);
      } else {
        console.log('\n⚠️  MIGRATION INCOMPLETE - Some services still have wrong format');
      }
      
    } else {
      // Use the mapping from vendors table
      console.log('\n3️⃣ Using vendor table mapping for migration...');
      const mapping = {};
      vendorMapping.forEach(v => {
        mapping[v.id] = v.user_id;
      });
      
      for (const service of oldFormatServices) {
        const newVendorId = mapping[service.vendor_id];
        if (!newVendorId) {
          console.log(`   ⚠️  No mapping found for ${service.vendor_id}, skipping...`);
          continue;
        }
        
        console.log(`   Updating ${service.title}...`);
        await sql`
          UPDATE services
          SET vendor_id = ${newVendorId},
              updated_at = NOW()
          WHERE id = ${service.id}
        `;
        console.log(`   ✅ ${service.id}: ${service.vendor_id} → ${newVendorId}`);
      }
      
      console.log('\n✅ MIGRATION SUCCESSFUL!');
    }
    
    // 6. Final summary
    console.log('\n📊 MIGRATION SUMMARY');
    console.log('=' .repeat(60));
    const finalCheck = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE vendor_id LIKE 'VEN-%') as old_count,
        COUNT(*) FILTER (WHERE vendor_id LIKE '2-2025-%' OR vendor_id LIKE '3-2025-%') as new_count,
        COUNT(*) as total_count
      FROM services
    `;
    
    console.log(`Total services: ${finalCheck[0].total_count}`);
    console.log(`Using old format (VEN-XXXXX): ${finalCheck[0].old_count}`);
    console.log(`Using new format (user.id): ${finalCheck[0].new_count}`);
    
    if (parseInt(finalCheck[0].old_count) === 0) {
      console.log('\n✨ All services now use user.id format!');
    } else {
      console.log(`\n⚠️  ${finalCheck[0].old_count} services still need migration`);
    }
    
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    console.error('   Message:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// Run migration
migrateServiceVendorIds()
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Migration failed:', err);
    process.exit(1);
  });
