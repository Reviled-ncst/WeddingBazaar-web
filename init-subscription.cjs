// Initialize vendor subscription record
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);
const vendorId = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

async function initSubscription() {
  try {
    console.log('🔍 Checking if vendor has subscription...');
    console.log(`Looking for vendor: ${vendorId}`);
    
    // Check current state
    const check = await sql`
      SELECT 
        vp.id AS vendor_id,
        vp.business_name,
        vs.id AS subscription_id,
        vs.plan_name,
        vs.status
      FROM vendor_profiles vp
      LEFT JOIN vendor_subscriptions vs ON vp.id::text = vs.vendor_id::text
      WHERE vp.id::text = ${vendorId}
    `;
    
    console.log('Current state:', JSON.stringify(check, null, 2));
    
    if (!check[0]) {
      console.log('❌ Vendor not found in vendor_profiles!');
      return;
    }
    
    if (!check[0].subscription_id) {
      console.log('\n📝 Creating subscription record...');
      
      const insert = await sql`
        INSERT INTO vendor_subscriptions (
          vendor_id,
          plan_id,
          plan_name,
          billing_cycle,
          status,
          start_date,
          end_date,
          current_period_start,
          current_period_end,
          cancel_at_period_end
        ) VALUES (
          ${vendorId},
          'free',
          'free',
          'monthly',
          'active',
          NOW(),
          NOW() + INTERVAL '30 days',
          NOW(),
          NOW() + INTERVAL '30 days',
          false
        )
        RETURNING *
      `;
      
      console.log('✅ Subscription created:', JSON.stringify(insert, null, 2));
    } else {
      console.log('\n✅ Subscription already exists!');
    }
    
    // Verify final state
    const verify = await sql`
      SELECT 
        vp.id AS vendor_id,
        vp.business_name,
        vs.id AS subscription_id,
        vs.plan_name AS subscription_plan,
        vs.status,
        vs.start_date,
        vs.end_date
      FROM vendor_profiles vp
      LEFT JOIN vendor_subscriptions vs ON vp.id::text = vs.vendor_id::text
      WHERE vp.id::text = ${vendorId}
    `;
    
    console.log('\n🎯 Final state:', JSON.stringify(verify, null, 2));
    console.log('\n✅ Initialization complete! You can now test the upgrade flow.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error('Stack:', err.stack);
    process.exit(1);
  }
}

initSubscription();
