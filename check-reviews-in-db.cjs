const { sql } = require('./backend-deploy/config/database.cjs');

async function checkReviewsInDatabase() {
  try {
    console.log('🔍 Checking reviews in database...\n');
    
    // Check total reviews
    const totalReviews = await sql`SELECT COUNT(*) as count FROM reviews`;
    console.log(`📊 Total Reviews: ${totalReviews[0].count}`);
    
    // Check reviews by vendor
    const reviewsByVendor = await sql`
      SELECT 
        vendor_id, 
        COUNT(*) as review_count 
      FROM reviews 
      GROUP BY vendor_id 
      ORDER BY review_count DESC
    `;
    
    console.log('\n📋 Reviews by Vendor:');
    console.table(reviewsByVendor);
    
    // Check a sample review
    const sampleReview = await sql`
      SELECT * FROM reviews LIMIT 1
    `;
    
    console.log('\n🔎 Sample Review:');
    console.log(JSON.stringify(sampleReview[0], null, 2));
    
    // Check vendors table
    const vendors = await sql`
      SELECT id, business_name FROM vendors LIMIT 10
    `;
    
    console.log('\n🏢 Sample Vendors:');
    console.table(vendors);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkReviewsInDatabase();
