const { sql } = require('./backend-deploy/config/database.cjs');

async function debugReviewsQuery() {
  try {
    console.log('🔍 Debugging reviews query for vendor 2-2025-003...\n');
    
    // Check reviews for this vendor (simple query)
    const simpleReviews = await sql`
      SELECT * FROM reviews 
      WHERE vendor_id = '2-2025-003'
      LIMIT 3
    `;
    
    console.log('📊 Simple Reviews Query:');
    console.log('Count:', simpleReviews.length);
    if (simpleReviews.length > 0) {
      console.log('\nSample Review:');
      console.log(JSON.stringify(simpleReviews[0], null, 2));
    }
    
    // Check what user_id looks like
    console.log('\n👤 Checking user data...');
    const users = await sql`
      SELECT id, email, first_name, last_name FROM users LIMIT 3
    `;
    console.log('Sample Users:');
    console.table(users);
    
    // Try the same query as the API with debugging
    console.log('\n🔍 Trying API query...');
    const apiQuery = await sql`
      SELECT 
        r.id,
        r.rating,
        r.comment,
        r.created_at,
        r.images,
        r.user_id,
        r.vendor_id,
        r.booking_id,
        CONCAT(u.first_name, ' ', u.last_name) as reviewer_name,
        u.profile_image_url as reviewer_image,
        b.service_type,
        b.event_date
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN bookings b ON r.booking_id = b.id
      WHERE r.vendor_id = '2-2025-003'
      ORDER BY r.created_at DESC
      LIMIT 3
    `;
    
    console.log('API Query Results:');
    console.log('Count:', apiQuery.length);
    if (apiQuery.length > 0) {
      console.log('\nSample Result:');
      console.log(JSON.stringify(apiQuery[0], null, 2));
    }
    
    // Check if there's a type mismatch
    console.log('\n🔍 Checking data types...');
    const typeCheck = await sql`
      SELECT 
        r.id as review_id,
        r.user_id,
        r.vendor_id,
        u.id as user_table_id,
        pg_typeof(r.user_id) as review_user_id_type,
        pg_typeof(u.id) as user_id_type
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.vendor_id = '2-2025-003'
      LIMIT 1
    `;
    
    console.log('Type Check:');
    console.table(typeCheck);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

debugReviewsQuery();
