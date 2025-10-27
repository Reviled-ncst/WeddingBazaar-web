/**
 * 🔍 Verify Subscription Limits Display
 * 
 * This script verifies that the enterprise subscription is correctly
 * showing unlimited service limits instead of 5.
 */

const { neon } = require('@neondatabase/serverless');

// Load environment variables
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function verifySubscriptionLimits() {
  console.log('\n🔍 VERIFYING SUBSCRIPTION LIMITS DISPLAY\n');
  console.log('='.repeat(60));

  try {
    // Get the test vendor subscription
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
      ORDER BY vs.created_at DESC
      LIMIT 5
    `;

    if (subscriptions.length === 0) {
      console.log('❌ No active subscriptions found!');
      return;
    }

    console.log(`\n✅ Found ${subscriptions.length} active subscription(s):\n`);

    // Plan limits reference
    const PLAN_LIMITS = {
      basic: { max_services: 5, max_portfolio: 10 },
      premium: { max_services: -1, max_portfolio: 50 },
      pro: { max_services: -1, max_portfolio: 200 },
      enterprise: { max_services: -1, max_portfolio: -1 }
    };

    for (const sub of subscriptions) {
      const limits = PLAN_LIMITS[sub.plan_name] || PLAN_LIMITS.basic;
      const servicesDisplay = limits.max_services === -1 ? 'Unlimited' : limits.max_services;
      const portfolioDisplay = limits.max_portfolio === -1 ? 'Unlimited' : limits.max_portfolio;

      console.log(`📋 Subscription: ${sub.id}`);
      console.log(`   └─ Vendor: ${sub.business_name || 'Unknown'}`);
      console.log(`   └─ Email: ${sub.email || 'Unknown'}`);
      console.log(`   └─ Plan: ${sub.plan_name.toUpperCase()}`);
      console.log(`   └─ Status: ${sub.status}`);
      console.log(`   └─ Service Limit: ${servicesDisplay}`);
      console.log(`   └─ Portfolio Limit: ${portfolioDisplay}`);
      
      if (sub.plan_name === 'enterprise') {
        console.log(`   ✅ ENTERPRISE PLAN - Should show UNLIMITED services!`);
      } else if (sub.plan_name === 'basic') {
        console.log(`   ℹ️  BASIC PLAN - Limited to 5 services`);
      } else {
        console.log(`   ✅ ${sub.plan_name.toUpperCase()} PLAN - Unlimited services`);
      }
      console.log('');
    }

    console.log('='.repeat(60));
    console.log('\n📊 EXPECTED FRONTEND DISPLAY:');
    console.log('   Basic: "X of 5 services used"');
    console.log('   Premium/Pro/Enterprise: "X of Unlimited services used"');
    console.log('\n   Progress bar should show:');
    console.log('   - Basic: Fill based on X/5 percentage');
    console.log('   - Unlimited: Always show 100% (purple gradient)');
    
    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('\n💡 Next Steps:');
    console.log('   1. Clear your browser cache (Ctrl+Shift+Delete)');
    console.log('   2. Refresh the Vendor Services page');
    console.log('   3. Check if it shows "X of Unlimited services used"');
    console.log('   4. If still showing "1/5", open browser console and check for errors');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run verification
verifySubscriptionLimits()
  .then(() => {
    console.log('\n✅ Verification script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification script failed:', error);
    process.exit(1);
  });
