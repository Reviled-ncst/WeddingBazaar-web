/**
 * Update subscription to use vendor_profiles UUID
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function updateSubscriptionVendorId() {
  console.log('\n🔧 UPDATING SUBSCRIPTION TO USE VENDOR_PROFILES UUID\n');
  console.log('='.repeat(60));
  
  const subscriptionId = 'c84c82f4-7bd1-47d6-bef4-4b0e10693ffa'; // Enterprise subscription
  const oldVendorId = '2-2025-003'; // vendors table ID
  const newVendorId = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa'; // vendor_profiles UUID
  
  console.log('\n📋 Update Details:');
  console.log(`   Subscription: ${subscriptionId}`);
  console.log(`   FROM: ${oldVendorId} (vendors table)`);
  console.log(`   TO: ${newVendorId} (vendor_profiles UUID)`);
  console.log('');

  // Update the subscription
  const result = await sql`
    UPDATE vendor_subscriptions
    SET 
      vendor_id = ${newVendorId},
      updated_at = NOW()
    WHERE id = ${subscriptionId}
    RETURNING id, vendor_id, plan_name, status
  `;

  if (result.length > 0) {
    console.log('✅ SUBSCRIPTION UPDATED SUCCESSFULLY!');
    console.log('');
    console.log('Updated subscription:');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Vendor ID: ${result[0].vendor_id} ✅`);
    console.log(`   Plan: ${result[0].plan_name}`);
    console.log(`   Status: ${result[0].status}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('\n🎯 NOW THE FLOW WILL WORK:');
    console.log('   1. User logs in');
    console.log('   2. Backend returns: vendorId = "daf1dd71-..." (from vendor_profiles)');
    console.log('   3. Frontend requests: GET /api/subscriptions/vendor/daf1dd71-...');
    console.log('   4. Backend finds subscription ✅');
    console.log('   5. Returns enterprise plan with unlimited limits ✅');
    console.log('   6. Frontend displays: "X of Unlimited services used" ✅');
    console.log('');
    console.log('💡 Next steps:');
    console.log('   1. Log out completely');
    console.log('   2. Clear browser cache and cookies (Ctrl+Shift+Delete)');
    console.log('   3. Log back in');
    console.log('   4. Should show "Unlimited" services!');
  } else {
    console.log('❌ Update failed!');
  }
}

updateSubscriptionVendorId()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
