/**
 * Check and fix vendor_profiles table
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function checkVendorProfiles() {
  console.log('\n🔍 CHECKING VENDOR_PROFILES TABLE\n');
  console.log('='.repeat(60));
  
  const userId = '2-2025-003';
  
  // Check vendor_profiles
  const profiles = await sql`
    SELECT * FROM vendor_profiles WHERE user_id = ${userId}
  `;

  console.log(`\nVendor profiles for user ${userId}:`);
  console.log(`Found: ${profiles.length} record(s)\n`);

  if (profiles.length > 0) {
    profiles.forEach((profile, i) => {
      console.log(`Profile ${i + 1}:`);
      console.log(`   ID (UUID): ${profile.id}`);
      console.log(`   User ID: ${profile.user_id}`);
      console.log(`   Business Name: ${profile.business_name || 'N/A'}`);
      console.log('');
    });

    const wrongId = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa';
    if (profiles[0].id === wrongId) {
      console.log('⚠️  PROBLEM: vendor_profiles.id is the wrong UUID!');
      console.log(`   Current: ${wrongId}`);
      console.log(`   This is causing the subscription lookup to fail`);
      console.log('');
      console.log('💡 SOLUTION:');
      console.log(`   We need to use the vendors table (id='2-2025-003') instead`);
      console.log(`   OR update the subscription to use this UUID`);
    }
  } else {
    console.log('❌ No vendor_profiles found for this user!');
  }

  // Check vendors table
  console.log('\n' + '='.repeat(60));
  console.log('\n🔍 CHECKING VENDORS TABLE\n');
  
  const vendors = await sql`
    SELECT * FROM vendors WHERE user_id = ${userId} OR id = ${userId}
  `;

  console.log(`Vendors for user ${userId}:`);
  console.log(`Found: ${vendors.length} record(s)\n`);

  if (vendors.length > 0) {
    vendors.forEach((vendor, i) => {
      console.log(`Vendor ${i + 1}:`);
      console.log(`   ID: ${vendor.id}`);
      console.log(`   User ID: ${vendor.user_id}`);
      console.log(`   Business Name: ${vendor.business_name || 'N/A'}`);
      console.log('');
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 RECOMMENDATION:');
  console.log('   The backend auth.cjs returns vendorId from vendor_profiles.id (UUID)');
  console.log('   But the subscription is now linked to vendors.id (2-2025-003)');
  console.log('   ');
  console.log('   OPTION 1: Use vendors.id instead of vendor_profiles.id in auth');
  console.log('   OPTION 2: Keep using vendor_profiles.id but update subscription lookup');
  console.log('');
}

checkVendorProfiles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
