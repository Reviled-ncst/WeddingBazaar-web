const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkSubscription() {
  console.log('🔍 Checking YOUR Subscription Status...\n');
  
  try {
    // First, let's find YOUR vendor account
    console.log('Step 1: Finding your vendor account...');
    const vendors = await sql`
      SELECT id, business_name, user_id, created_at
      FROM vendors 
      WHERE id LIKE 'VEN-%' OR id LIKE '2-2025-%'
      ORDER BY created_at DESC
      LIMIT 20
    `;
    
    console.log('\n📋 Recent Vendor Accounts:');
    console.log('═'.repeat(100));
    vendors.forEach((v, i) => {
      console.log(`${i + 1}. ${v.business_name}`);
      console.log(`   Vendor ID: ${v.id}`);
      console.log(`   User ID: ${v.user_id || 'None'}`);
      console.log(`   Created: ${new Date(v.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Check all subscriptions in database
    console.log('Step 2: Checking ALL subscriptions in database...');
    const allSubs = await sql`
      SELECT 
        vs.*,
        v.business_name,
        v.id as actual_vendor_id
      FROM vendor_subscriptions vs
      LEFT JOIN vendors v ON v.id = vs.vendor_id OR v.user_id = vs.vendor_id
      ORDER BY vs.created_at DESC
    `;
    
    console.log('\n📦 ALL Subscriptions in Database:');
    console.log('═'.repeat(100));
    
    if (allSubs.length === 0) {
      console.log('⚠️  NO SUBSCRIPTIONS FOUND IN DATABASE!');
      console.log('   This explains why you\'re getting default FREE plan limits.');
    } else {
      allSubs.forEach((sub, i) => {
        console.log(`\n${i + 1}. Subscription ID: ${sub.id}`);
        console.log(`   Vendor ID in DB: ${sub.vendor_id}`);
        console.log(`   Actual Vendor ID: ${sub.actual_vendor_id || 'NOT FOUND'}`);
        console.log(`   Business Name: ${sub.business_name || 'NOT LINKED'}`);
        console.log(`   Plan: ${sub.plan_name.toUpperCase()}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Start: ${new Date(sub.start_date).toLocaleDateString()}`);
        console.log(`   End: ${new Date(sub.end_date).toLocaleDateString()}`);
        console.log(`   Created: ${new Date(sub.created_at).toLocaleString()}`);
        
        // Check if this is a Pro plan
        if (sub.plan_name.toLowerCase() === 'pro') {
          console.log('   ⭐ THIS IS YOUR PRO PLAN!');
          if (!sub.actual_vendor_id) {
            console.log('   ❌ BUT IT\'S NOT LINKED TO ANY VENDOR!');
            console.log(`   🔧 Need to update vendor_id from "${sub.vendor_id}" to actual VEN-xxxxx`);
          }
        }
      });
    }
    
    // Check which vendor IDs exist in subscriptions table
    console.log('\n\nStep 3: Analyzing vendor ID mismatch...');
    console.log('═'.repeat(100));
    
    const subVendorIds = allSubs.map(s => s.vendor_id);
    const actualVendorIds = vendors.map(v => v.id);
    
    console.log('\n🔑 Vendor IDs in Subscriptions Table:');
    subVendorIds.forEach(id => {
      const match = actualVendorIds.includes(id);
      console.log(`   ${match ? '✅' : '❌'} ${id} ${match ? '(FOUND)' : '(NOT FOUND IN VENDORS TABLE)'}`);
    });
    
    console.log('\n🔑 Actual Vendor IDs in Vendors Table:');
    actualVendorIds.slice(0, 10).forEach(id => {
      const hasSub = subVendorIds.includes(id);
      console.log(`   ${hasSub ? '✅' : '❌'} ${id} ${hasSub ? '(HAS SUBSCRIPTION)' : '(NO SUBSCRIPTION)'}`);
    });
    
    // Count services for vendors
    console.log('\n\nStep 4: Checking service counts...');
    console.log('═'.repeat(100));
    
    for (const vendor of vendors.slice(0, 5)) {
      const services = await sql`
        SELECT COUNT(*) as count
        FROM services
        WHERE vendor_id = ${vendor.id}
      `;
      
      const sub = allSubs.find(s => s.vendor_id === vendor.id || s.vendor_id === vendor.user_id);
      const planName = sub?.plan_name || 'free';
      const limits = {
        free: 5,
        basic: 15,
        premium: 50,
        pro: -1,
        enterprise: -1
      };
      const limit = limits[planName];
      const serviceCount = parseInt(services[0].count);
      
      console.log(`\n${vendor.business_name}`);
      console.log(`   Vendor ID: ${vendor.id}`);
      console.log(`   Services: ${serviceCount}`);
      console.log(`   Plan: ${planName.toUpperCase()}`);
      console.log(`   Limit: ${limit === -1 ? 'Unlimited' : limit}`);
      console.log(`   Status: ${limit === -1 ? '✅ Can add unlimited' : serviceCount >= limit ? '❌ AT LIMIT' : '✅ Can add more'}`);
      
      if (serviceCount > 5 && planName === 'free') {
        console.log(`   ⚠️  WARNING: Has ${serviceCount} services but on FREE plan (limit 5)!`);
        console.log(`   🐛 This indicates subscription not properly linked`);
      }
    }
    
    // Final diagnosis
    console.log('\n\n🎯 DIAGNOSIS:');
    console.log('═'.repeat(100));
    
    const proPlan = allSubs.find(s => s.plan_name.toLowerCase() === 'pro');
    
    if (!proPlan) {
      console.log('❌ NO PRO PLAN FOUND IN DATABASE');
      console.log('   Either:');
      console.log('   1. You don\'t actually have a Pro subscription in the database');
      console.log('   2. It\'s in a different table or under a different name');
    } else {
      console.log('✅ PRO PLAN FOUND!');
      console.log(`   Subscription ID: ${proPlan.id}`);
      console.log(`   Vendor ID in subscription: ${proPlan.vendor_id}`);
      console.log(`   Linked to vendor: ${proPlan.business_name || 'NO - THIS IS THE PROBLEM!'}`);
      
      if (!proPlan.actual_vendor_id) {
        console.log('\n❌ ROOT CAUSE IDENTIFIED:');
        console.log(`   Your Pro subscription has vendor_id = "${proPlan.vendor_id}"`);
        console.log(`   But no vendor exists with that ID in the vendors table!`);
        console.log(`   This causes the API to return DEFAULT FREE PLAN instead.`);
        console.log('\n💡 SOLUTION:');
        console.log(`   Update the subscription's vendor_id to your actual VEN-xxxxx ID`);
        console.log(`   Or create a user_id link so the API can find it`);
      } else {
        console.log('\n✅ Subscription is properly linked!');
        console.log('   The issue might be in how the API fetches it.');
      }
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkSubscription();
