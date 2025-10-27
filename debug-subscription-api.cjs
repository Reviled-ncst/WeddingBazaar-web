/**
 * 🔍 Debug Subscription API Response
 * This script will show exactly what the API is returning
 */

const apiUrl = 'https://weddingbazaarph-web.onrender.com';

async function debugSubscriptionAPI() {
  console.log('\n🔍 DEBUGGING SUBSCRIPTION API RESPONSE\n');
  console.log('='.repeat(60));

  // Get all active subscriptions to find a vendor ID
  const { neon } = require('@neondatabase/serverless');
  require('dotenv').config();
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get active enterprise subscriptions
    const subscriptions = await sql`
      SELECT 
        vs.id,
        vs.vendor_id,
        vs.plan_name,
        vs.status,
        v.business_name,
        u.email
      FROM vendor_subscriptions vs
      LEFT JOIN vendors v ON vs.vendor_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      WHERE vs.status = 'active' 
      AND vs.plan_name = 'enterprise'
      LIMIT 1
    `;

    if (subscriptions.length === 0) {
      console.log('❌ No enterprise subscriptions found!');
      return;
    }

    const sub = subscriptions[0];
    console.log('\n📋 Testing subscription for:');
    console.log(`   Vendor ID: ${sub.vendor_id}`);
    console.log(`   Business: ${sub.business_name || 'Unknown'}`);
    console.log(`   Email: ${sub.email || 'Unknown'}`);
    console.log(`   Plan: ${sub.plan_name}`);

    // Call the API endpoint
    console.log('\n🌐 Making API request...');
    console.log(`   URL: ${apiUrl}/api/subscriptions/vendor/${sub.vendor_id}`);

    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${apiUrl}/api/subscriptions/vendor/${sub.vendor_id}`);
    
    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();

    console.log('\n📄 RAW API RESPONSE:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success && data.subscription) {
      console.log('\n🔍 ANALYZING SUBSCRIPTION DATA:');
      console.log('─'.repeat(60));
      
      console.log('\n1️⃣ Plan Information:');
      console.log(`   plan_name: ${data.subscription.plan_name}`);
      console.log(`   plan_id: ${data.subscription.plan_id || 'NOT SET'}`);
      
      if (data.subscription.plan) {
        console.log('\n2️⃣ Plan Object (if exists):');
        console.log(`   plan.id: ${data.subscription.plan.id}`);
        console.log(`   plan.name: ${data.subscription.plan.name}`);
        console.log(`   plan.tier: ${data.subscription.plan.tier}`);
        
        if (data.subscription.plan.limits) {
          console.log('\n3️⃣ Plan Limits:');
          console.log(`   max_services: ${data.subscription.plan.limits.max_services}`);
          console.log(`   max_portfolio_items: ${data.subscription.plan.limits.max_portfolio_items}`);
          console.log(`   max_service_images: ${data.subscription.plan.limits.max_service_images}`);
          
          if (data.subscription.plan.limits.max_services === -1) {
            console.log('\n   ✅ CORRECT: max_services is -1 (unlimited)');
          } else {
            console.log(`\n   ❌ WRONG: max_services is ${data.subscription.plan.limits.max_services} (should be -1)`);
          }
        } else {
          console.log('\n   ❌ ERROR: plan.limits is missing!');
        }
      } else {
        console.log('\n   ❌ ERROR: plan object is missing from response!');
      }

      console.log('\n4️⃣ What Frontend Will See:');
      const predefinedPlan = {
        basic: { max_services: 5 },
        premium: { max_services: -1 },
        pro: { max_services: -1 },
        enterprise: { max_services: -1 }
      };
      
      const planLimits = predefinedPlan[data.subscription.plan_name] || predefinedPlan.basic;
      console.log(`   Frontend will use: ${planLimits.max_services === -1 ? 'Unlimited' : planLimits.max_services}`);
      console.log(`   Display text: "X of ${planLimits.max_services === -1 ? 'Unlimited' : planLimits.max_services} services used"`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ DEBUG COMPLETE!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run debug
debugSubscriptionAPI()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
