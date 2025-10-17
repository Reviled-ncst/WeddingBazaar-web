const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function fixReviewCounts() {
  try {
    console.log('🔧 Starting review count fix...\n');

    // 1. Check current state
    console.log('📊 BEFORE FIX - Current services review counts:');
    const before = await sql`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.vendor_rating as cached_rating,
        s.vendor_review_count as cached_count,
        COUNT(r.id) as actual_count,
        AVG(r.rating) as actual_rating
      FROM services s
      LEFT JOIN reviews r ON r.service_id = s.id
      GROUP BY s.id, s.title, s.category, s.vendor_rating, s.vendor_review_count
      ORDER BY s.id
    `;
    
    console.table(before);

    // 2. Find mismatches
    const mismatches = before.filter(row => 
      parseInt(row.cached_count) !== parseInt(row.actual_count)
    );
    
    if (mismatches.length === 0) {
      console.log('\n✅ All review counts are accurate! No fixes needed.\n');
      return;
    }

    console.log(`\n⚠️  Found ${mismatches.length} services with incorrect review counts:\n`);
    mismatches.forEach(row => {
      console.log(`  ${row.id} (${row.title}): Cached=${row.cached_count}, Actual=${row.actual_count}`);
    });

    // 3. Fix services with reviews
    console.log('\n🔧 Fixing services that have reviews...');
    const servicesWithReviews = await sql`
      UPDATE services
      SET 
        vendor_review_count = subquery.review_count,
        vendor_rating = subquery.avg_rating::text,
        updated_at = NOW()
      FROM (
        SELECT 
          service_id,
          COUNT(*) as review_count,
          ROUND(AVG(rating)::numeric, 1) as avg_rating
        FROM reviews
        GROUP BY service_id
      ) AS subquery
      WHERE services.id = subquery.service_id
      RETURNING services.id, services.title, services.vendor_review_count, services.vendor_rating
    `;

    console.log(`✅ Updated ${servicesWithReviews.length} services with reviews:`);
    servicesWithReviews.forEach(s => {
      console.log(`  ${s.id}: ${s.vendor_review_count} reviews, ${s.vendor_rating}★ rating`);
    });

    // 4. Fix services without reviews (set to 0)
    console.log('\n🔧 Fixing services with no reviews...');
    const servicesWithoutReviews = await sql`
      UPDATE services
      SET 
        vendor_review_count = 0,
        vendor_rating = NULL,
        updated_at = NOW()
      WHERE id NOT IN (
        SELECT DISTINCT service_id FROM reviews
      )
      AND vendor_review_count != 0
      RETURNING id, title, vendor_review_count
    `;

    if (servicesWithoutReviews.length > 0) {
      console.log(`✅ Reset ${servicesWithoutReviews.length} services to 0 reviews:`);
      servicesWithoutReviews.forEach(s => {
        console.log(`  ${s.id} (${s.title}): Now shows 0 reviews`);
      });
    } else {
      console.log('✅ No services needed to be reset to 0');
    }

    // 5. Verify the fix
    console.log('\n📊 AFTER FIX - Verified review counts:');
    const after = await sql`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.vendor_rating as db_rating,
        s.vendor_review_count as db_count,
        COUNT(r.id) as actual_count,
        AVG(r.rating) as actual_rating
      FROM services s
      LEFT JOIN reviews r ON r.service_id = s.id
      GROUP BY s.id, s.title, s.category, s.vendor_rating, s.vendor_review_count
      ORDER BY s.id
    `;
    
    console.table(after);

    // 6. Final verification
    const stillWrong = after.filter(row => 
      parseInt(row.db_count) !== parseInt(row.actual_count)
    );

    if (stillWrong.length === 0) {
      console.log('\n🎉 SUCCESS! All review counts are now accurate!\n');
      console.log('✅ Database is now in sync with actual reviews');
      console.log('✅ Services with 0 reviews show 0 review count');
      console.log('✅ Services with reviews show correct count and rating');
    } else {
      console.log('\n❌ WARNING: Some mismatches still exist:\n');
      console.table(stillWrong);
    }

  } catch (error) {
    console.error('\n❌ Error fixing review counts:', error);
    throw error;
  }
}

// Run the fix
fixReviewCounts()
  .then(() => {
    console.log('\n✅ Review count fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Review count fix failed:', error);
    process.exit(1);
  });
