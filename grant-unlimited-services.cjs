const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function grantUnlimitedServices() {
  console.log('🚀 Granting Unlimited Services to Vendors...\n');
  
  try {
    // Get all vendors
    const vendors = await sql`
      SELECT id, business_name 
      FROM vendors 
      WHERE id LIKE 'VEN-%'
      ORDER BY id
    `;
    
    console.log(`📊 Found ${vendors.length} vendors to upgrade\n`);
    
    // Grant Pro plan to all vendors
    const plan = 'pro'; // Options: 'premium', 'pro', 'enterprise'
    
    for (const vendor of vendors) {
      console.log(`✅ ${vendor.business_name} (${vendor.id})`);
      
      // Insert or update subscription
      await sql`
        INSERT INTO vendor_subscriptions (
          vendor_id,
          plan_name,
          billing_cycle,
          status,
          start_date,
          end_date
        ) VALUES (
          ${vendor.id},
          ${plan},
          'monthly',
          'active',
          NOW(),
          NOW() + INTERVAL '1 year'
        )
        ON CONFLICT (vendor_id) DO UPDATE SET
          plan_name = ${plan},
          status = 'active',
          start_date = NOW(),
          end_date = NOW() + INTERVAL '1 year',
          updated_at = NOW()
      `;
      
      console.log(`   → Granted ${plan.toUpperCase()} plan (unlimited services)\n`);
    }
    
    console.log('═'.repeat(80));
    console.log('\n✅ SUCCESS! All vendors now have unlimited services!\n');
    console.log('📋 Next Steps:');
    console.log('   1. Refresh your Services page (Ctrl+Shift+R)');
    console.log('   2. Clear localStorage in browser console:');
    console.log('      localStorage.removeItem("subscriptionCache");');
    console.log('   3. Click "Add Service" - it should now work!\n');
    
    // Verify the changes
    console.log('🔍 Verifying subscriptions...\n');
    const subs = await sql`
      SELECT vs.vendor_id, v.business_name, vs.plan_name, vs.status
      FROM vendor_subscriptions vs
      LEFT JOIN vendors v ON v.id = vs.vendor_id
      WHERE vs.vendor_id LIKE 'VEN-%'
      ORDER BY vs.vendor_id
    `;
    
    console.log('Current Subscriptions:');
    subs.forEach(sub => {
      console.log(`   ${sub.business_name}: ${sub.plan_name.toUpperCase()} (${sub.status})`);
    });
    
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

grantUnlimitedServices();
