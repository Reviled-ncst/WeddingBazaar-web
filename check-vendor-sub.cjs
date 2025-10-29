// Check vendor_profiles for our vendor
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);
const vendorId = 'eb5c47b9-6442-4ded-8a9a-cd98bfb7bca1';

(async () => {
  try {
    console.log('Checking vendor_profiles...');
    const vendor = await sql`
      SELECT * FROM vendor_profiles 
      WHERE id::text = ${vendorId} 
      LIMIT 1
    `;
    
    if (vendor.length > 0) {
      console.log('\n✅ Vendor found in vendor_profiles:');
      console.log(JSON.stringify(vendor[0], null, 2));
    } else {
      console.log('\n❌ Vendor NOT found in vendor_profiles');
    }
    
    console.log('\n\nChecking vendor_subscriptions...');
    const subscription = await sql`
      SELECT * FROM vendor_subscriptions 
      WHERE vendor_id::text = ${vendorId}
    `;
    
    if (subscription.length > 0) {
      console.log('\n✅ Subscription found:');
      console.log(JSON.stringify(subscription, null, 2));
    } else {
      console.log('\n❌ No subscription found - NEED TO CREATE ONE');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
