/**
 * SAFE CLEANUP: Remove Duplicate OLD Format Vendor Entries
 * 
 * This script SAFELY removes the old VEN-XXXXX format vendor entries
 * and keeps the new user_id format entries (where vendors.id = vendors.user_id)
 * 
 * SAFETY:
 * - All existing services use user_id format (2-2025-XXX)
 * - We're only deleting entries where vendors.id starts with 'VEN-'
 * - The new format entries will remain intact
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function cleanupDuplicateVendors() {
  console.log('\n🧹 CLEANING UP DUPLICATE VENDOR ENTRIES\n');
  console.log('=' .repeat(80));

  try {
    // Step 1: Show what will be deleted
    console.log('📊 STEP 1: Identifying entries to DELETE');
    console.log('-'.repeat(80));
    
    const toDelete = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        business_type,
        created_at
      FROM vendors
      WHERE id LIKE 'VEN-%'
      AND id != user_id
      ORDER BY user_id
    `;
    
    console.log(`Found ${toDelete.length} OLD format entries to delete:\n`);
    
    toDelete.forEach((v, idx) => {
      console.log(`  ${idx + 1}. vendors.id: "${v.id}" (will be DELETED)`);
      console.log(`     user_id: "${v.user_id}"`);
      console.log(`     business_name: "${v.business_name}"`);
      console.log('');
    });

    // Step 2: Show what will be kept
    console.log('📊 STEP 2: Entries to KEEP (new format)');
    console.log('-'.repeat(80));
    
    const toKeep = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        business_type
      FROM vendors
      WHERE id = user_id
      ORDER BY user_id
    `;
    
    console.log(`Found ${toKeep.length} NEW format entries to keep:\n`);
    
    toKeep.forEach((v, idx) => {
      console.log(`  ${idx + 1}. vendors.id: "${v.id}" (will be KEPT)`);
      console.log(`     user_id: "${v.user_id}"`);
      console.log(`     business_name: "${v.business_name}"`);
      console.log('');
    });

    // Step 3: Verify no services reference the old format
    console.log('📊 STEP 3: Safety check - verify no services reference VEN-XXXXX');
    console.log('-'.repeat(80));
    
    const servicesUsingOldFormat = await sql`
      SELECT COUNT(*) as count
      FROM services
      WHERE vendor_id LIKE 'VEN-%'
    `;
    
    if (servicesUsingOldFormat[0].count > 0) {
      console.log(`❌ ERROR: Found ${servicesUsingOldFormat[0].count} services using VEN-XXXXX format!`);
      console.log('⚠️  Cannot safely delete old vendor entries!');
      process.exit(1);
    }
    
    console.log('✅ No services reference VEN-XXXXX format - safe to delete\n');

    // Step 4: Perform the deletion
    console.log('📊 STEP 4: Deleting old format entries');
    console.log('-'.repeat(80));
    console.log('⚠️  Deleting entries where vendors.id LIKE \'VEN-%\' AND vendors.id != vendors.user_id\n');
    
    const deleteResult = await sql`
      DELETE FROM vendors
      WHERE id LIKE 'VEN-%'
      AND id != user_id
      RETURNING id, user_id, business_name
    `;
    
    console.log(`✅ Deleted ${deleteResult.length} old format entries:\n`);
    
    deleteResult.forEach((v, idx) => {
      console.log(`  ${idx + 1}. Deleted vendors.id: "${v.id}" | user_id: "${v.user_id}"`);
    });

    // Step 5: Verify no duplicates remain
    console.log('\n📊 STEP 5: Verifying no duplicates remain');
    console.log('-'.repeat(80));
    
    const remainingDuplicates = await sql`
      SELECT user_id, COUNT(*) as count
      FROM vendors
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `;
    
    if (remainingDuplicates.length > 0) {
      console.log('❌ ERROR: Duplicates still exist:');
      remainingDuplicates.forEach(d => {
        console.log(`  - user_id: "${d.user_id}" appears ${d.count} times`);
      });
      process.exit(1);
    }
    
    console.log('✅ No duplicates remain - vendors.user_id is now unique!\n');

    console.log('=' .repeat(80));
    console.log('🎉 SUCCESS! Cleanup complete!');
    console.log('\nNext steps:');
    console.log('  1. Run: node add-vendor-user-id-unique-constraint.cjs');
    console.log('  2. Run: node add-services-foreign-key-safe.cjs');
    console.log('=' .repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error cleaning up duplicates:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

cleanupDuplicateVendors();
