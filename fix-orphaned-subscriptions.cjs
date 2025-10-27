/**
 * Find the real vendor and fix the subscription
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function fixSubscriptions() {
  console.log('\n🔧 FIXING ORPHANED SUBSCRIPTIONS\n');
  
  // Find all vendors
  const vendors = await sql`
    SELECT id, user_id, business_name
    FROM vendors
    ORDER BY created_at DESC
    LIMIT 10
  `;

  console.log(`Found ${vendors.length} vendors:\n`);
  vendors.forEach((v, i) => {
    console.log(`${i + 1}. ID: ${v.id}`);
    console.log(`   └─ User ID: ${v.user_id}`);
    console.log(`   └─ Business: ${v.business_name || 'Unnamed'}\n`);
  });

  if (vendors.length === 0) {
    console.log('❌ No vendors found! You need to create a vendor profile first.');
    return;
  }

  // Get orphaned subscriptions
  const orphanedSubs = await sql`
    SELECT 
      vs.id,
      vs.vendor_id,
      vs.plan_name
    FROM vendor_subscriptions vs
    WHERE vs.status = 'active'
    AND NOT EXISTS (
      SELECT 1 FROM vendors v WHERE v.id = vs.vendor_id
    )
  `;

  console.log(`Found ${orphanedSubs.length} orphaned subscriptions:\n`);
  orphanedSubs.forEach((s, i) => {
    console.log(`${i + 1}. Subscription ID: ${s.id}`);
    console.log(`   └─ Plan: ${s.plan_name}`);
    console.log(`   └─ Broken vendor_id: ${s.vendor_id}`);
    console.log(`   └─ Status: ORPHANED (vendor doesn't exist)\n`);
  });

  if (orphanedSubs.length > 0 && vendors.length > 0) {
    console.log('💡 SUGGESTED FIX:');
    console.log(`   Update subscription to point to real vendor:`);
    console.log(`   \n   UPDATE vendor_subscriptions`);
    console.log(`   SET vendor_id = '${vendors[0].id}'`);
    console.log(`   WHERE id = '${orphanedSubs[0].id}';`);
    console.log('');
    console.log(`   This will link your ${orphanedSubs[0].plan_name} subscription to ${vendors[0].business_name || 'your vendor'}`);
  }
}

fixSubscriptions()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
