/**
 * Link the enterprise subscription to the real vendor
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function linkSubscription() {
  console.log('\n🔗 LINKING ENTERPRISE SUBSCRIPTION TO REAL VENDOR\n');
  console.log('='.repeat(60));
  
  const vendorId = '2-2025-003'; // Boutique
  const subscriptionId = 'c84c82f4-7bd1-47d6-bef4-4b0e10693ffa'; // Enterprise subscription
  
  console.log(`\n📋 Operation Details:`);
  console.log(`   Vendor: Boutique (ID: ${vendorId})`);
  console.log(`   Subscription: ${subscriptionId}`);
  console.log(`   Plan: Enterprise`);
  console.log('');

  // Update the subscription
  const result = await sql`
    UPDATE vendor_subscriptions
    SET 
      vendor_id = ${vendorId},
      updated_at = NOW()
    WHERE id = ${subscriptionId}
    RETURNING id, vendor_id, plan_name, status
  `;

  if (result.length > 0) {
    console.log('✅ SUBSCRIPTION LINKED SUCCESSFULLY!');
    console.log('');
    console.log('Updated subscription:');
    console.log(`   ID: ${result[0].id}`);
    console.log(`   Vendor ID: ${result[0].vendor_id}`);
    console.log(`   Plan: ${result[0].plan_name}`);
    console.log(`   Status: ${result[0].status}`);
    console.log('');
    console.log('='.repeat(60));
    console.log('\n🎉 DONE! Now test the API:');
    console.log(`   URL: https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/${vendorId}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Clear browser cache (Ctrl+Shift+Delete)');
    console.log('   2. Refresh your Vendor Services page');
    console.log('   3. Should now show "X of Unlimited services used"!');
  } else {
    console.log('❌ Update failed!');
  }
}

linkSubscription()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
