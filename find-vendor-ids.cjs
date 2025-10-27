/**
 * Find the correct vendor ID to use for testing
 */
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function findVendorIds() {
  console.log('\n🔍 FINDING VENDOR IDS\n');
  
  // Get subscriptions with their vendor info
  const result = await sql`
    SELECT 
      vs.id as sub_id,
      vs.vendor_id as sub_vendor_id,
      vs.plan_name,
      vs.status,
      v.id as vendor_table_id,
      v.user_id as vendor_user_id,
      v.business_name
    FROM vendor_subscriptions vs
    LEFT JOIN vendors v ON vs.vendor_id = v.id
    WHERE vs.status = 'active'
    LIMIT 5
  `;

  console.log('Subscriptions found:', result.length);
  console.log('');

  result.forEach((row, i) => {
    console.log(`${i + 1}. Subscription: ${row.sub_id}`);
    console.log(`   └─ plan: ${row.plan_name}`);
    console.log(`   └─ subscription.vendor_id: ${row.sub_vendor_id} (UUID)`);
    console.log(`   └─ vendors.id: ${row.vendor_table_id || 'NOT FOUND'}`);
    console.log(`   └─ vendors.user_id: ${row.vendor_user_id || 'NOT FOUND'}`);
    console.log(`   └─ business: ${row.business_name || 'NOT FOUND'}`);
    console.log('');
  });

  // Show which vendor_id to use for API testing
  if (result.length > 0) {
    const firstSub = result[0];
    console.log('✅ TO TEST API, USE:');
    console.log(`   Vendor ID (UUID from subscription): ${firstSub.sub_vendor_id}`);
    console.log(`   User ID (if needed): ${firstSub.vendor_user_id}`);
  }
}

findVendorIds()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
