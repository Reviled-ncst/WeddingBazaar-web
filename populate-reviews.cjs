const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * Script to populate reviews for existing services
 * Based on vendor 2-2025-003's 5 services
 */

async function populateReviews() {
  console.log('🎯 Starting review population process...\n');

  try {
    // First, get all services
    console.log('📋 Step 1: Fetching existing services...');
    const services = await sql`
      SELECT 
        s.id,
        s.title,
        s.category,
        s.vendor_id,
        v.business_name
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `;
    
    console.log(`✅ Found ${services.length} services\n`);
    services.forEach((service, idx) => {
      console.log(`${idx + 1}. ${service.title} (${service.category})`);
      console.log(`   Service ID: ${service.id}, Vendor: ${service.business_name}\n`);
    });

    // Get existing users to use as reviewers
    console.log('\n👥 Step 2: Fetching existing users (potential reviewers)...');
    const users = await sql`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE role = 'individual'
      LIMIT 10
    `;
    
    console.log(`✅ Found ${users.length} potential reviewers\n`);

    // Get or create completed bookings for each service
    console.log('📝 Step 3: Creating completed bookings (required for reviews)...\n');
    
    const sampleReviews = [
      {
        rating: 5,
        comment: "Absolutely amazing service! They went above and beyond our expectations. The attention to detail was incredible and everything was perfect on our special day. Highly recommend!",
        images: []
      },
      {
        rating: 5,
        comment: "Professional, responsive, and delivered exactly what we wanted. The quality exceeded our expectations. Would definitely book again for future events!",
        images: []
      },
      {
        rating: 4,
        comment: "Very good service overall. There were a few minor hiccups but they handled everything professionally. Great value for money and wonderful results.",
        images: []
      },
      {
        rating: 5,
        comment: "Outstanding work! They were so easy to work with and made everything stress-free. The final result was breathtaking. Cannot thank them enough!",
        images: []
      },
      {
        rating: 4,
        comment: "Great experience from start to finish. Very accommodating to our requests and delivered quality work. A few small issues but overall very satisfied.",
        images: []
      },
      {
        rating: 5,
        comment: "Exceeded all our expectations! So professional and talented. They captured every special moment perfectly. Best decision we made for our wedding!",
        images: []
      },
      {
        rating: 5,
        comment: "Simply perfect! From our first meeting to the final delivery, everything was handled with care and professionalism. Worth every penny!",
        images: []
      },
      {
        rating: 4,
        comment: "Very pleased with the service. They were punctual, professional, and the quality was excellent. Minor communication issues but nothing major.",
        images: []
      },
      {
        rating: 5,
        comment: "Incredible service! They made our dream wedding come true. So creative and attentive to every detail. Highly recommend to all couples!",
        images: []
      },
      {
        rating: 5,
        comment: "Top-notch quality and service! They were amazing to work with. Everything was seamless and the results were stunning. 10/10 would recommend!",
        images: []
      }
    ];

    let reviewsCreated = 0;
    let bookingsCreated = 0;

    // For EVERY service, create multiple reviews (3-5 reviews per service)
    for (const service of services) {
      const numReviews = Math.floor(Math.random() * 3) + 3; // 3-5 reviews per service
      console.log(`\n📝 Creating ${numReviews} reviews for: ${service.title}`);
      
      for (let i = 0; i < numReviews && i < users.length; i++) {
        const user = users[i % users.length];
        const reviewData = sampleReviews[reviewsCreated % sampleReviews.length];
        
        try {
          // Create a completed booking first (bookings.id is auto-generated serial)
          const eventDate = new Date();
          eventDate.setMonth(eventDate.getMonth() - Math.floor(Math.random() * 3)); // 0-3 months ago
          
          const booking = await sql`
            INSERT INTO bookings (
              couple_id,
              vendor_id,
              service_id,
              service_type,
              event_date,
              event_location,
              status,
              amount,
              booking_reference,
              created_at,
              updated_at
            ) VALUES (
              ${user.id},
              ${service.vendor_id},
              ${service.id},
              ${service.category},
              ${eventDate.toISOString().split('T')[0]},
              'Manila, Philippines',
              'completed',
              15000,
              ${`REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`},
              NOW(),
              NOW()
            )
            RETURNING id
          `;
          
          bookingsCreated++;
          console.log(`  ✅ Created booking: ${booking[0].id}`);
          
          // Now create the review (reviews.id is VARCHAR - generate unique ID)
          const reviewId = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          const review = await sql`
            INSERT INTO reviews (
              id,
              booking_id,
              vendor_id,
              user_id,
              rating,
              comment,
              images,
              verified,
              created_at,
              updated_at
            ) VALUES (
              ${reviewId},
              ${booking[0].id},
              ${service.vendor_id},
              ${user.id},
              ${reviewData.rating},
              ${reviewData.comment},
              ${reviewData.images.length > 0 ? `{${reviewData.images.join(',')}}` : '{}'}::text[],
              true,
              NOW(),
              NOW()
            )
            RETURNING id, rating
          `;
          
          reviewsCreated++;
          console.log(`  ⭐ Created review: ${review[0].id} (${review[0].rating} stars)`);
          console.log(`     Reviewer: ${user.first_name} ${user.last_name}`);
          console.log(`     Comment: "${reviewData.comment.substring(0, 60)}..."`);
          
          // Small delay to ensure unique timestamps
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`  ❌ Error creating review for ${service.title}:`, error.message);
        }
      }
    }

    // Update vendor ratings based on reviews
    console.log('\n\n📊 Step 4: Updating vendor ratings...');
    const vendors = await sql`
      SELECT DISTINCT vendor_id FROM reviews
    `;
    
    for (const vendor of vendors) {
      const stats = await sql`
        SELECT 
          AVG(rating)::numeric(3,2) as avg_rating,
          COUNT(*) as review_count
        FROM reviews
        WHERE vendor_id = ${vendor.vendor_id}
      `;
      
      await sql`
        UPDATE vendors
        SET 
          rating = ${stats[0].avg_rating},
          review_count = ${stats[0].review_count},
          updated_at = NOW()
        WHERE id = ${vendor.vendor_id}
      `;
      
      console.log(`  ✅ Updated vendor ${vendor.vendor_id}:`);
      console.log(`     Average Rating: ${stats[0].avg_rating} ⭐`);
      console.log(`     Total Reviews: ${stats[0].review_count}`);
    }

    // Final summary
    console.log('\n\n🎉 ==========================================');
    console.log('✅ REVIEW POPULATION COMPLETE!');
    console.log('==========================================');
    console.log(`📊 Summary:`);
    console.log(`   • Services processed: ${services.length}`);
    console.log(`   • Bookings created: ${bookingsCreated}`);
    console.log(`   • Reviews created: ${reviewsCreated}`);
    console.log(`   • Vendors updated: ${vendors.length}`);
    console.log('==========================================\n');

    // Show final review stats
    console.log('📈 Final Review Statistics:');
    const finalStats = await sql`
      SELECT 
        v.business_name,
        v.rating,
        v.review_count,
        COUNT(r.id) as actual_reviews
      FROM vendors v
      LEFT JOIN reviews r ON v.id = r.vendor_id
      WHERE v.review_count > 0
      GROUP BY v.id, v.business_name, v.rating, v.review_count
      ORDER BY v.rating DESC, v.review_count DESC
    `;
    
    console.log('\nVendor Rating Summary:');
    console.log('─────────────────────────────────────────────────────────');
    finalStats.forEach((stat, idx) => {
      console.log(`${idx + 1}. ${stat.business_name}`);
      console.log(`   Rating: ${stat.rating} ⭐ | Reviews: ${stat.review_count} | Actual in DB: ${stat.actual_reviews}`);
    });
    console.log('─────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the script
populateReviews()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
