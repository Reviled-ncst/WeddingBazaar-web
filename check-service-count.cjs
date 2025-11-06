const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkServiceCount() {
  console.log('🔍 Checking Service Counts by Vendor...\n');
  
  try {
    // Get all vendors with their service counts
    const vendorCounts = await sql`
      SELECT 
        v.id as vendor_id,
        v.business_name,
        COUNT(s.id) as service_count,
        v.created_at
      FROM vendors v
      LEFT JOIN services s ON s.vendor_id = v.id
      GROUP BY v.id, v.business_name, v.created_at
      ORDER BY service_count DESC, v.business_name ASC
    `;
    
    console.log('📊 VENDOR SERVICE COUNTS:');
    console.log('═'.repeat(100));
    console.log('');
    
    vendorCounts.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.business_name}`);
      console.log(`   Vendor ID: ${vendor.vendor_id}`);
      console.log(`   Services: ${vendor.service_count}`);
      console.log(`   Joined: ${new Date(vendor.created_at).toLocaleDateString()}`);
      console.log('');
    });
    
    console.log('═'.repeat(100));
    console.log('');
    
    // Get subscription info for each vendor
    console.log('📦 SUBSCRIPTION STATUS:');
    console.log('═'.repeat(100));
    console.log('');
    
    const subscriptions = await sql`
      SELECT 
        vs.vendor_id,
        v.business_name,
        vs.plan_name,
        vs.status,
        vs.start_date,
        vs.end_date
      FROM vendor_subscriptions vs
      LEFT JOIN vendors v ON v.id = vs.vendor_id
      ORDER BY v.business_name ASC
    `;
    
    if (subscriptions.length === 0) {
      console.log('⚠️  No subscriptions found in database.');
      console.log('   All vendors are on FREE plan (5 service limit by default)');
      console.log('');
    } else {
      subscriptions.forEach((sub, index) => {
        console.log(`${index + 1}. ${sub.business_name}`);
        console.log(`   Vendor ID: ${sub.vendor_id}`);
        console.log(`   Plan: ${sub.plan_name.toUpperCase()}`);
        console.log(`   Status: ${sub.status}`);
        console.log(`   Period: ${new Date(sub.start_date).toLocaleDateString()} - ${new Date(sub.end_date).toLocaleDateString()}`);
        console.log('');
      });
    }
    
    console.log('═'.repeat(100));
    console.log('');
    
    // Check default limits
    console.log('🎯 PLAN LIMITS:');
    console.log('═'.repeat(100));
    console.log('');
    console.log('Free Plan:       5 services');
    console.log('Basic Plan:     15 services');
    console.log('Premium Plan:   50 services');
    console.log('Pro Plan:       Unlimited');
    console.log('Enterprise:     Unlimited');
    console.log('');
    console.log('═'.repeat(100));
    console.log('');
    
    // Find vendors at or over limit
    const defaultLimit = 5; // Free plan default
    const vendorsAtLimit = vendorCounts.filter(v => v.service_count >= defaultLimit);
    
    if (vendorsAtLimit.length > 0) {
      console.log('⚠️  VENDORS AT OR OVER FREE PLAN LIMIT (5 services):');
      console.log('═'.repeat(100));
      console.log('');
      
      vendorsAtLimit.forEach((vendor) => {
        const subscription = subscriptions.find(s => s.vendor_id === vendor.vendor_id);
        const planName = subscription?.plan_name || 'free';
        const planLimits = {
          free: 5,
          basic: 15,
          premium: 50,
          pro: -1,
          enterprise: -1
        };
        const limit = planLimits[planName] || 5;
        const limitText = limit === -1 ? 'Unlimited' : limit;
        
        console.log(`${vendor.business_name}`);
        console.log(`   Vendor ID: ${vendor.vendor_id}`);
        console.log(`   Current Services: ${vendor.service_count}`);
        console.log(`   Current Plan: ${planName.toUpperCase()}`);
        console.log(`   Plan Limit: ${limitText}`);
        console.log(`   Can Add More? ${limit === -1 ? 'YES (Unlimited)' : vendor.service_count < limit ? 'YES' : 'NO - AT LIMIT!'}`);
        console.log('');
      });
      
      console.log('═'.repeat(100));
      console.log('');
      console.log('💡 These vendors will see the upgrade modal when clicking "Add Service"');
    } else {
      console.log('✅ All vendors are below the free plan limit');
    }
    
    console.log('');
    console.log('📝 SUMMARY:');
    console.log('═'.repeat(100));
    console.log(`Total Vendors: ${vendorCounts.length}`);
    console.log(`Total Services: ${vendorCounts.reduce((sum, v) => sum + parseInt(v.service_count), 0)}`);
    console.log(`Vendors at Limit: ${vendorsAtLimit.length}`);
    console.log(`Active Subscriptions: ${subscriptions.length}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

checkServiceCount();
