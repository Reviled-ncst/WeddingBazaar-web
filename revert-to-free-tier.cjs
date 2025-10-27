/**
 * 🔄 Revert User to Free Tier (Basic Plan)
 * This will downgrade the current user from Enterprise to Basic
 * so they can test the payment upgrade flow
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function revertToFreeTier() {
  console.log('\n🔄 REVERTING USER TO FREE TIER (BASIC PLAN)\n');
  console.log('='.repeat(60));

  const vendorId = 'daf1dd71-b5c7-44a1-bf88-36d41e73a7fa'; // Your vendor UUID
  
  try {
    // Step 1: Check current subscription
    console.log('\n📋 Step 1: Checking current subscription...');
    const current = await sql`
      SELECT id, vendor_id, plan_name, status
      FROM vendor_subscriptions
      WHERE vendor_id = ${vendorId}
      AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (current.length > 0) {
      console.log(`   Current plan: ${current[0].plan_name}`);
      console.log(`   Subscription ID: ${current[0].id}`);
    } else {
      console.log('   No active subscription found');
    }

    // Step 2: Update to basic plan
    console.log('\n🔄 Step 2: Updating to basic plan...');
    const result = await sql`
      UPDATE vendor_subscriptions
      SET 
        plan_name = 'basic',
        billing_cycle = 'monthly',
        updated_at = NOW()
      WHERE vendor_id = ${vendorId}
      AND status = 'active'
      RETURNING id, vendor_id, plan_name, status
    `;

    if (result.length > 0) {
      console.log('\n✅ SUCCESSFULLY DOWNGRADED TO FREE TIER!');
      console.log('');
      console.log('Updated subscription:');
      console.log(`   ID: ${result[0].id}`);
      console.log(`   Vendor ID: ${result[0].vendor_id}`);
      console.log(`   Plan: ${result[0].plan_name}`);
      console.log(`   Status: ${result[0].status}`);
      console.log('');
      console.log('='.repeat(60));
      console.log('\n🎯 YOU CAN NOW TEST THE PAYMENT UPGRADE FLOW!');
      console.log('');
      console.log('Next steps:');
      console.log('   1. Hard refresh your browser (Ctrl+Shift+R)');
      console.log('   2. Go to Vendor Services page');
      console.log('   3. Should see "1 of 5 services used" (basic plan)');
      console.log('   4. Click "Upgrade Plan" button');
      console.log('   5. Complete payment flow to upgrade to Premium/Pro');
      console.log('');
      console.log('After upgrade, the limit will automatically change to:');
      console.log('   Premium: Unlimited services');
      console.log('   Pro: Unlimited services');
      console.log('   Enterprise: Unlimited everything');
    } else {
      console.log('❌ No subscription was updated');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run downgrade
revertToFreeTier()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
