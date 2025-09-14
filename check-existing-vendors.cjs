const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkExistingVendors() {
  try {
    console.log('🔍 Checking existing vendors in database...');

    // Check all vendors
    const allVendors = await sql`
      SELECT 
        id, business_name, business_type, location, 
        rating, review_count, verified, description
      FROM vendors
      ORDER BY id
    `;

    console.log(`📊 Total vendors in database: ${allVendors.length}`);
    console.log('\n📋 All vendors:');
    allVendors.forEach(vendor => {
      console.log(`  ${vendor.id}. ${vendor.business_name} (${vendor.business_type})`);
      console.log(`     Rating: ${vendor.rating}/5.0, Reviews: ${vendor.review_count}, Verified: ${vendor.verified}`);
      console.log(`     Location: ${vendor.location || 'Not set'}`);
      console.log('');
    });

    // Check featured vendors query
    console.log('🌟 Testing featured vendors query...');
    const featuredVendors = await sql`
      SELECT 
        v.id, v.business_name, v.business_type, v.location, 
        v.rating, v.review_count, v.description, v.verified
      FROM vendors v
      WHERE v.verified = true 
        AND v.rating >= 4.0 
        AND v.review_count >= 10
      ORDER BY v.rating DESC, v.review_count DESC
      LIMIT 6
    `;

    console.log(`✨ Featured vendors matching criteria: ${featuredVendors.length}`);
    if (featuredVendors.length > 0) {
      featuredVendors.forEach(vendor => {
        console.log(`  - ${vendor.business_name} (${vendor.business_type}) - Rating: ${vendor.rating}/5.0 (${vendor.review_count} reviews)`);
      });
    } else {
      console.log('❌ No vendors match the featured criteria');
      
      // Check what criteria are failing
      const unverified = await sql`SELECT COUNT(*) as count FROM vendors WHERE verified != true OR verified IS NULL`;
      const lowRating = await sql`SELECT COUNT(*) as count FROM vendors WHERE rating < 4.0 OR rating IS NULL`;
      const lowReviews = await sql`SELECT COUNT(*) as count FROM vendors WHERE review_count < 10 OR review_count IS NULL`;
      
      console.log('\n🔍 Criteria analysis:');
      console.log(`  - Unverified vendors: ${unverified[0].count}`);
      console.log(`  - Vendors with rating < 4.0: ${lowRating[0].count}`);
      console.log(`  - Vendors with < 10 reviews: ${lowReviews[0].count}`);
    }

    // Check services too
    const services = await sql`
      SELECT 
        s.id, s.name, s.category, s.vendor_id,
        v.business_name
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      LIMIT 10
    `;

    console.log(`\n📋 Services in database: ${services.length}`);
    if (services.length > 0) {
      services.forEach(service => {
        console.log(`  - ${service.name || 'Unnamed'} (${service.category || 'No category'}) by ${service.business_name || 'Unknown vendor'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking vendors:', error);
  }
}

checkExistingVendors().then(() => {
  console.log('\n🎉 Vendor check completed!');
  process.exit(0);
});
