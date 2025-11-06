const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorSubscription() {
  console.log('🔍 Checking Subscription Detection Issue...\n');
  
  try {
    // Get the vendor you're logged in as
    console.log('📋 Enter your vendor email to check:');
    console.log('   (Or we\'ll check all vendors with the VEN-00001, VEN-00002, and 2-2025-xxx IDs)\n');
    
    // Check the test vendors from your database
    const testVendorIds = ['VEN-00001', 'VEN-00002', '2-2025-003', '2-2025-002', '2-2025-004'];
    
    for (const vendorId of testVendorIds) {
      console.log('═'.repeat(100));
      console.log(`\n🔍 Checking Vendor ID: ${vendorId}\n`);
      
      // 1. Check if vendor exists
      const vendor = await sql`
        SELECT id, business_name, user_id, created_at 
        FROM vendors 
        WHERE id = ${vendorId}
        LIMIT 1
      `;
      
      if (vendor.length === 0) {
        console.log('❌ Vendor not found in database\n');
        continue;
      }
      
      console.log('✅ Vendor Found:');
      console.log(`   Business Name: ${vendor[0].business_name}`);
      console.log(`   Vendor ID: ${vendor[0].id}`);
      console.log(`   User ID: ${vendor[0].user_id || 'NULL'}`);
      console.log('');
      
      // 2. Check for subscription using vendor.id
      const subByVendorId = await sql`
        SELECT * FROM vendor_subscriptions 
        WHERE vendor_id = ${vendor[0].id}
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      console.log('🔍 Subscription Search (by vendor.id):');
      if (subByVendorId.length > 0) {
        console.log(`   ✅ FOUND! Plan: ${subByVendorId[0].plan_name.toUpperCase()}`);
        console.log(`   Status: ${subByVendorId[0].status}`);
        console.log(`   Period: ${new Date(subByVendorId[0].start_date).toLocaleDateString()} - ${new Date(subByVendorId[0].end_date).toLocaleDateString()}`);
        console.log(`   ID: ${subByVendorId[0].id}`);
      } else {
        console.log('   ❌ No subscription found');
      }
      console.log('');
      
      // 3. Check for subscription using user_id
      if (vendor[0].user_id) {
        const subByUserId = await sql`
          SELECT * FROM vendor_subscriptions 
          WHERE vendor_id = ${vendor[0].user_id}
          ORDER BY created_at DESC
          LIMIT 1
        `;
        
        console.log('🔍 Subscription Search (by user_id):');
        if (subByUserId.length > 0) {
          console.log(`   ✅ FOUND! Plan: ${subByUserId[0].plan_name.toUpperCase()}`);
          console.log(`   Status: ${subByUserId[0].status}`);
          console.log(`   Period: ${new Date(subByUserId[0].start_date).toLocaleDateString()} - ${new Date(subByUserId[0].end_date).toLocaleDateString()}`);
          console.log(`   ID: ${subByUserId[0].id}`);
        } else {
          console.log('   ❌ No subscription found');
        }
        console.log('');
      }
      
      // 4. Check what API endpoint would return
      console.log('🌐 What API /api/subscriptions/vendor/:id would return:');
      const apiUrl = 'https://weddingbazaar-web.onrender.com';
      try {
        const response = await fetch(`${apiUrl}/api/subscriptions/vendor/${vendor[0].id}`);
        const data = await response.json();
        
        if (data.success && data.subscription) {
          console.log(`   ✅ API Returns: ${data.subscription.plan_name.toUpperCase()} plan`);
          console.log(`   Status: ${data.subscription.status}`);
          console.log(`   Max Services: ${data.subscription.plan?.limits?.max_services || 'Not specified'}`);
        } else {
          console.log(`   ❌ API Error: ${data.error || 'No subscription found'}`);
          console.log(`   ⚠️  Will default to FREE plan (5 service limit)`);
        }
      } catch (e) {
        console.log(`   ❌ API Error: ${e.message}`);
        console.log(`   ⚠️  Will default to FREE plan (5 service limit)`);
      }
      console.log('');
      
      // 5. Check service count
      const services = await sql`
        SELECT COUNT(*) as count 
        FROM services 
        WHERE vendor_id = ${vendor[0].id}
      `;
      
      console.log('📊 Service Count:');
      console.log(`   Current Services: ${services[0].count}`);
      console.log('');
      
      // 6. Determine if can add services
      const planLimits = {
        free: 5,
        basic: 15,
        premium: 50,
        pro: -1,
        enterprise: -1
      };
      
      let planName = 'free';
      let limit = 5;
      
      if (subByVendorId.length > 0) {
        planName = subByVendorId[0].plan_name.toLowerCase();
        limit = planLimits[planName] || 5;
      } else if (vendor[0].user_id) {
        const subByUserId = await sql`
          SELECT * FROM vendor_subscriptions 
          WHERE vendor_id = ${vendor[0].user_id}
          ORDER BY created_at DESC
          LIMIT 1
        `;
        if (subByUserId.length > 0) {
          planName = subByUserId[0].plan_name.toLowerCase();
          limit = planLimits[planName] || 5;
        }
      }
      
      console.log('🎯 Button Behavior Prediction:');
      console.log(`   Detected Plan: ${planName.toUpperCase()}`);
      console.log(`   Service Limit: ${limit === -1 ? 'Unlimited' : limit}`);
      console.log(`   Current Count: ${services[0].count}`);
      
      if (limit === -1) {
        console.log('   ✅ CAN ADD: Unlimited plan');
      } else if (parseInt(services[0].count) < limit) {
        console.log(`   ✅ CAN ADD: ${limit - parseInt(services[0].count)} slots remaining`);
      } else {
        console.log('   ❌ BLOCKED: Service limit reached → Shows upgrade modal');
      }
      
      console.log('\n');
    }
    
    console.log('═'.repeat(100));
    console.log('\n💡 DIAGNOSIS:\n');
    console.log('If you see "❌ BLOCKED" but you have an unlimited subscription:');
    console.log('   1. Your subscription exists but vendor_id doesn\'t match');
    console.log('   2. API endpoint returns wrong data or defaults to FREE');
    console.log('   3. Frontend SubscriptionContext is not loading the subscription\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkVendorSubscription();
