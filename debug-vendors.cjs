const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function debugVendors() {
  try {
    console.log('🔍 Debugging vendors...');
    
    // Check if vendors table exists and has data
    const vendors = await sql`SELECT * FROM vendors LIMIT 5`;
    console.log(`📊 Found ${vendors.length} vendors in database`);
    
    if (vendors.length > 0) {
      console.log('First vendor data:', vendors[0]);
      
      // Check data types and values
      vendors.forEach((vendor, index) => {
        console.log(`\nVendor ${index + 1}:`);
        console.log(`  - business_name: ${vendor.business_name}`);
        console.log(`  - business_type: ${vendor.business_type}`);
        console.log(`  - rating: ${vendor.rating} (type: ${typeof vendor.rating})`);
        console.log(`  - review_count: ${vendor.review_count} (type: ${typeof vendor.review_count})`);
        console.log(`  - verified: ${vendor.verified} (type: ${typeof vendor.verified})`);
      });
      
      // Test different query conditions
      console.log('\n🧪 Testing query conditions...');
      
      const verifiedCheck = await sql`SELECT COUNT(*) as count FROM vendors WHERE verified = true`;
      console.log(`Verified vendors: ${verifiedCheck[0].count}`);
      
      const ratingCheck = await sql`SELECT COUNT(*) as count FROM vendors WHERE rating >= 4.0`;
      console.log(`Vendors with rating >= 4.0: ${ratingCheck[0].count}`);
      
      const reviewCheck = await sql`SELECT COUNT(*) as count FROM vendors WHERE review_count >= 10`;
      console.log(`Vendors with review_count >= 10: ${reviewCheck[0].count}`);
      
      const combinedCheck = await sql`
        SELECT COUNT(*) as count FROM vendors 
        WHERE verified = true AND rating >= 4.0 AND review_count >= 10
      `;
      console.log(`Vendors meeting all criteria: ${combinedCheck[0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugVendors().then(() => {
  console.log('🏁 Debug complete');
  process.exit(0);
});
