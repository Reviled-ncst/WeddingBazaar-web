/**
 * 🔍 Check Vendor Subscription in Database
 * Verifies if vendor subscription was actually saved to database
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorSubscription() {
  console.log('🔍 Checking Vendor Subscription in Database');
  console.log('==========================================\n');

  const vendorId = '2-2025-003'; // Your vendor ID from the logs

  try {
    console.log(`📊 Looking for vendor: ${vendorId}\n`);

    // Check if vendor exists
    const vendor = await sql`
      SELECT id, user_id, business_name, business_type
      FROM vendors
      WHERE user_id = ${vendorId}
      LIMIT 1
    `;

    if (vendor.length === 0) {
      console.log('❌ Vendor not found in vendors table');
      console.log('   This might be the issue - check if vendor_id is correct\n');
      return;
    }

    console.log('✅ Vendor found:');
    console.log(`   ID: ${vendor[0].id}`);
    console.log(`   User ID: ${vendor[0].user_id}`);
    console.log(`   Business: ${vendor[0].business_name}`);
    console.log(`   Type: ${vendor[0].business_type}\n`);

    // Check vendor_subscriptions table with this user_id
    console.log('🔍 Checking subscriptions with user_id...');
    const subscriptionsByUserId = await sql`
      SELECT *
      FROM vendor_subscriptions
      WHERE vendor_id = ${vendorId}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    if (subscriptionsByUserId.length > 0) {
      console.log(`✅ Found ${subscriptionsByUserId.length} subscription(s) for user_id: ${vendorId}\n`);
      subscriptionsByUserId.forEach((sub, index) => {
        console.log(`Subscription ${index + 1}:`);
        console.log(`   ID: ${sub.id}`);
        console.log(`   Plan ID: ${sub.plan_id}`);
        console.log(`   Plan Name: ${sub.plan_name}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Billing: ${sub.billing_cycle}`);
        console.log(`   Start: ${sub.start_date}`);
        console.log(`   End: ${sub.end_date}`);
        console.log(`   Created: ${sub.created_at}`);
        console.log(`   Updated: ${sub.updated_at}\n`);
      });
    } else {
      console.log(`❌ No subscriptions found for user_id: ${vendorId}`);
      console.log('   This means the upgrade didn\'t save to database\n');
    }

    // Also check with vendor UUID (just in case)
    console.log('🔍 Checking subscriptions with vendor UUID...');
    const subscriptionsByUUID = await sql`
      SELECT *
      FROM vendor_subscriptions
      WHERE vendor_id = ${vendor[0].id}
      ORDER BY created_at DESC
      LIMIT 5
    `;

    if (subscriptionsByUUID.length > 0) {
      console.log(`✅ Found ${subscriptionsByUUID.length} subscription(s) for vendor UUID: ${vendor[0].id}\n`);
      subscriptionsByUUID.forEach((sub, index) => {
        console.log(`Subscription ${index + 1}:`);
        console.log(`   ID: ${sub.id}`);
        console.log(`   Plan ID: ${sub.plan_id}`);
        console.log(`   Plan Name: ${sub.plan_name}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Billing: ${sub.billing_cycle}`);
        console.log(`   Created: ${sub.created_at}\n`);
      });
    } else {
      console.log(`❌ No subscriptions found for vendor UUID: ${vendor[0].id}\n`);
    }

    // Check all subscriptions in the table
    console.log('📊 All subscriptions in database:');
    const allSubs = await sql`
      SELECT vendor_id, plan_id, plan_name, status, created_at
      FROM vendor_subscriptions
      ORDER BY created_at DESC
      LIMIT 10
    `;

    if (allSubs.length > 0) {
      console.log(`   Total: ${allSubs.length} subscriptions\n`);
      allSubs.forEach((sub, index) => {
        console.log(`   ${index + 1}. Vendor: ${sub.vendor_id} | Plan: ${sub.plan_name} | Status: ${sub.status}`);
      });
    } else {
      console.log('   ❌ No subscriptions found in entire table!');
      console.log('   The table might be empty or not created yet\n');
    }

    console.log('\n==========================================');
    console.log('🎯 Summary:');
    console.log('==========================================\n');

    if (subscriptionsByUserId.length > 0) {
      console.log('✅ SUBSCRIPTION SYSTEM IS WORKING');
      console.log(`   - Vendor has ${subscriptionsByUserId.length} active subscription(s)`);
      console.log(`   - Latest plan: ${subscriptionsByUserId[0].plan_name}`);
      console.log(`   - Status: ${subscriptionsByUserId[0].status}`);
      console.log('\n💡 If frontend still shows wrong plan:');
      console.log('   1. Check SubscriptionContext is using correct vendor_id');
      console.log('   2. Check API endpoint URL has /api/ prefix');
      console.log('   3. Clear browser cache and reload');
    } else {
      console.log('❌ NO SUBSCRIPTION FOUND');
      console.log('\n🔧 Possible issues:');
      console.log('   1. Upgrade API not saving to database');
      console.log('   2. Wrong vendor_id being used (user_id vs UUID)');
      console.log('   3. Database connection issue');
      console.log('   4. Table doesn\'t exist yet');
      console.log('\n💡 Next steps:');
      console.log('   1. Try upgrading again in production');
      console.log('   2. Check backend logs for database errors');
      console.log('   3. Verify vendor_id format in upgrade request');
    }

  } catch (error) {
    console.error('\n❌ Database Error:', error.message);
    console.error('   Details:', error);
  }
}

checkVendorSubscription().catch(console.error);
