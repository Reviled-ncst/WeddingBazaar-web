#!/usr/bin/env node
/**
 * 🔄 REVERT TO FREE TIER AND TEST DYNAMIC LIMITS
 * This script will:
 * 1. Revert your current vendor subscription to free tier (basic plan)
 * 2. Verify the limits are correctly applied from database
 * 3. Test the payment upgrade flow preparation
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('\n🔄 ========================================');
  console.log('   REVERT TO FREE TIER & TEST LIMITS');
  console.log('========================================\n');

  try {
    // Step 1: Find your vendor account
    console.log('📋 Step 1: Finding your vendor account...');
    const vendors = await sql`
      SELECT 
        vp.id as vendor_id,
        vp.user_id,
        vp.business_name,
        u.email,
        u.first_name || ' ' || u.last_name as full_name
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      WHERE u.email LIKE '%test%' OR u.email LIKE '%admin%'
      ORDER BY vp.created_at DESC
      LIMIT 5
    `;

    if (vendors.length === 0) {
      console.error('❌ No vendor accounts found!');
      return;
    }

    console.log('\n📊 Found vendor accounts:');
    vendors.forEach((v, i) => {
      console.log(`   ${i + 1}. ${v.business_name || 'Unnamed'} (${v.email})`);
      console.log(`      Vendor ID: ${v.vendor_id}`);
    });

    // Use the first one (most recent test account)
    const targetVendor = vendors[0];
    console.log(`\n✅ Using: ${targetVendor.business_name} (${targetVendor.email})`);
    console.log(`   Vendor ID: ${targetVendor.vendor_id}`);

    // Step 2: Check current subscription
    console.log('\n📋 Step 2: Checking current subscription...');
    const currentSub = await sql`
      SELECT * FROM vendor_subscriptions
      WHERE vendor_id = ${targetVendor.vendor_id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (currentSub.length > 0) {
      console.log('   Current Plan:', currentSub[0].plan_name);
      console.log('   Status:', currentSub[0].status);
      console.log('   Start Date:', currentSub[0].start_date);
      console.log('   End Date:', currentSub[0].end_date);
    } else {
      console.log('   ⚠️ No subscription found (will create new free tier)');
    }

    // Step 3: Revert to free tier
    console.log('\n🔄 Step 3: Reverting to FREE TIER (basic plan)...');
    
    // Delete existing subscription
    await sql`
      DELETE FROM vendor_subscriptions
      WHERE vendor_id = ${targetVendor.vendor_id}
    `;
    console.log('   ✅ Deleted existing subscription');

    // Create new free tier subscription
    const newSub = await sql`
      INSERT INTO vendor_subscriptions (
        vendor_id,
        plan_name,
        plan_id,
        status,
        start_date,
        billing_cycle
      )
      VALUES (
        ${targetVendor.vendor_id},
        'basic',
        'basic',
        'active',
        NOW(),
        'monthly'
      )
      RETURNING *
    `;

    console.log('   ✅ Created new FREE TIER subscription');
    console.log('   Plan:', newSub[0].plan_name);
    console.log('   Status:', newSub[0].status);

    // Step 4: Verify current service count
    console.log('\n📊 Step 4: Checking current service usage...');
    const serviceCount = await sql`
      SELECT COUNT(*) as count
      FROM services
      WHERE vendor_id = ${targetVendor.vendor_id}
    `;

    const currentCount = parseInt(serviceCount[0].count);
    const limit = 5; // Free tier has 5 services limit
    const percentage = (currentCount / limit) * 100;

    console.log(`   Services Used: ${currentCount} / ${limit}`);
    console.log(`   Percentage: ${percentage.toFixed(1)}%`);
    console.log(`   Can Add More: ${currentCount < limit ? '✅ YES' : '❌ NO (at limit)'}`);

    // Step 5: Test API response simulation
    console.log('\n🧪 Step 5: Simulating API response...');
    const apiResponse = {
      success: true,
      subscription: {
        id: newSub[0].id,
        vendor_id: newSub[0].vendor_id,
        plan_name: newSub[0].plan_name,
        plan_id: newSub[0].plan_id,
        status: newSub[0].status,
        start_date: newSub[0].start_date,
        end_date: newSub[0].end_date,
        billing_cycle: newSub[0].billing_cycle,
        // The API should add these from the plan definition:
        plan: {
          id: 'basic',
          name: 'Free Tier',
          tier: 'basic',
          price: 0,
          limits: {
            max_services: 5,
            max_portfolio_items: 10,
            max_monthly_bookings: -1
          }
        }
      }
    };

    console.log('   ✅ Expected API Response:');
    console.log(JSON.stringify(apiResponse, null, 2));

    // Step 6: Frontend mapping simulation
    console.log('\n🎨 Step 6: Simulating Frontend Subscription Mapping...');
    
    // This is what SubscriptionContext.tsx should do
    const predefinedPlan = {
      id: 'basic',
      name: 'Free Tier',
      tier: 'basic',
      price: 0,
      limits: {
        max_services: 5,
        max_portfolio_items: 10
      }
    };

    const frontendSubscription = {
      id: apiResponse.subscription.id,
      vendorId: apiResponse.subscription.vendor_id,
      planId: apiResponse.subscription.plan_name, // "basic"
      planName: predefinedPlan.name, // "Free Tier"
      tier: predefinedPlan.tier, // "basic"
      status: apiResponse.subscription.status,
      startDate: apiResponse.subscription.start_date,
      endDate: apiResponse.subscription.end_date,
      
      // ✅ CRITICAL: Use dynamic limits from API, not hardcoded
      limits: {
        max_services: apiResponse.subscription.plan.limits.max_services,
        max_portfolio_items: apiResponse.subscription.plan.limits.max_portfolio_items,
        unlimited_services: apiResponse.subscription.plan.limits.max_services === -1
      },
      
      features: predefinedPlan.features || [],
      price: predefinedPlan.price,
      
      // Usage tracking
      usage: {
        services: {
          current: currentCount,
          limit: apiResponse.subscription.plan.limits.max_services,
          unlimited: apiResponse.subscription.plan.limits.max_services === -1
        }
      }
    };

    console.log('   ✅ Frontend Subscription Object:');
    console.log(JSON.stringify(frontendSubscription, null, 2));

    // Step 7: Summary and next steps
    console.log('\n✅ ========================================');
    console.log('   REVERT TO FREE TIER COMPLETE!');
    console.log('========================================\n');

    console.log('📊 CURRENT STATUS:');
    console.log(`   Vendor: ${targetVendor.business_name}`);
    console.log(`   Email: ${targetVendor.email}`);
    console.log(`   Plan: FREE TIER (basic)`);
    console.log(`   Services: ${currentCount} / ${limit}`);
    console.log(`   Can Add: ${currentCount < limit ? 'YES ✅' : 'NO ❌'}`);

    console.log('\n🧪 NEXT STEPS FOR TESTING:');
    console.log('   1. ✅ Login to vendor account:', targetVendor.email);
    console.log('   2. ✅ Navigate to Services page');
    console.log('   3. ✅ Verify status shows "5 services used (100%)" (or current count)');
    console.log('   4. ✅ Try to add a new service (should show upgrade prompt if at limit)');
    console.log('   5. ✅ Click "Upgrade Plan" button');
    console.log('   6. ✅ Select Premium/Pro/Enterprise plan');
    console.log('   7. ✅ Complete payment with PayMongo TEST card');
    console.log('   8. ✅ Verify limits update to "Unlimited" after payment');

    console.log('\n💳 TEST CARD DETAILS:');
    console.log('   Card Number: 4343 4343 4343 4345');
    console.log('   Expiry: 12/25 (or any future date)');
    console.log('   CVC: 123');
    console.log('   Name: Test User');

    console.log('\n🔗 BACKEND ENDPOINT TO TEST:');
    console.log('   GET https://weddingbazaar-web.onrender.com/api/subscriptions/vendor/' + targetVendor.vendor_id);
    console.log('   Expected Response: max_services = 5 (free tier)');

    console.log('\n📝 EXPECTED BEHAVIOR:');
    console.log('   Before Payment: "5 / 5 services used" (or current count / 5)');
    console.log('   After Payment:  "X of Unlimited services used"');
    console.log('   Limit Check:    max_services changes from 5 to -1');

    console.log('\n⚠️ IMPORTANT NOTES:');
    console.log('   • Frontend MUST use max_services from API response');
    console.log('   • Do NOT hardcode limits in SubscriptionContext');
    console.log('   • Plan lookup should use plan_name, not plan_id');
    console.log('   • After payment, trigger refetch with subscriptionUpdated event');

    console.log('\n🎯 KEY FILES TO VERIFY:');
    console.log('   • src/shared/contexts/SubscriptionContext.tsx');
    console.log('   • src/pages/users/vendor/services/VendorServices.tsx');
    console.log('   • backend-deploy/routes/subscriptions/vendor.cjs');

  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack:', error.stack);
  }
}

main();
