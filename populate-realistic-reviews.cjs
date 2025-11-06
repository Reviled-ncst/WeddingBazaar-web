const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * Realistic review population script
 * - Ratings: 3-5 stars (randomized, not all same)
 * - Dates: October-November 2024 only (no future dates)
 * - Location: Dasmariñas City, Cavite, Philippines only
 * - Varied ratings based on couple names
 */

// Diverse review templates with varied ratings
const reviewTemplates = {
  5: [
    "Absolutely amazing service! They went above and beyond our expectations. The attention to detail was incredible and everything was perfect on our special day in Dasmariñas. Highly recommend!",
    "Outstanding work! They were so easy to work with and made everything stress-free. The final result was breathtaking in our Dasmariñas wedding. Cannot thank them enough!",
    "Exceeded all our expectations! So professional and talented. They captured every special moment perfectly at our Cavite wedding. Best decision we made!",
    "Simply perfect! From our first meeting to the final delivery, everything was handled with care and professionalism in Dasmariñas. Worth every penny!",
    "Top-notch quality and service! They were amazing to work with. Everything was seamless and the results were stunning at our Cavite wedding. 10/10 would recommend!",
    "Incredible experience! They made our dream wedding in Dasmariñas come true. So creative and attentive to every detail. Forever grateful!",
    "Best vendor we hired! Professional, punctual, and the quality was exceptional. Our Dasmariñas wedding was perfect because of them!",
    "Beyond amazing! They understood our vision perfectly and delivered even better results. Our Cavite wedding was magical thanks to them!",
  ],
  4: [
    "Very good service overall. There were a few minor hiccups but they handled everything professionally in Dasmariñas. Great value for money and wonderful results.",
    "Great experience from start to finish. Very accommodating to our requests and delivered quality work. A few small issues but overall very satisfied with our Cavite wedding.",
    "Very pleased with the service. They were punctual, professional, and the quality was excellent. Minor communication issues but nothing major at our Dasmariñas event.",
    "Really good vendor! Some minor delays but they made up for it with quality work. Would recommend for Dasmariñas weddings.",
    "Solid service with good results. Had a few concerns but they addressed them quickly. Happy with our Cavite wedding outcome.",
    "Good experience overall. Professional team with quality output. Some small improvements could be made but still satisfied.",
    "Very competent vendor! Delivered as promised with minor adjustments needed. Good value for our Dasmariñas wedding.",
  ],
  3: [
    "Decent service but had some issues with communication and timing in Dasmariñas. Final results were acceptable but not as polished as we hoped. Room for improvement.",
    "Average experience. They delivered what was promised but nothing exceptional. Some delays and miscommunication during our Cavite wedding planning.",
    "Okay service overall. Met basic expectations but lacked the wow factor we were hoping for at our Dasmariñas wedding. Could have been better.",
    "Fair service with room for improvement. Had several issues with coordination but they eventually sorted things out. Results were satisfactory.",
    "Adequate service but not outstanding. Some aspects were good while others needed more attention. Our Dasmariñas wedding went okay overall.",
    "Basic service provided. Had to follow up multiple times for updates. Final result was acceptable but could have been better executed.",
  ]
};

// Filipino couple names from Dasmariñas, Cavite
const coupleNames = [
  { first: 'Maria', last: 'Santos' },
  { first: 'Juan', last: 'Dela Cruz' },
  { first: 'Ana', last: 'Reyes' },
  { first: 'Miguel', last: 'Garcia' },
  { first: 'Sofia', last: 'Mendoza' },
  { first: 'Carlos', last: 'Ramos' },
  { first: 'Isabella', last: 'Torres' },
  { first: 'Jose', last: 'Rivera' },
  { first: 'Gabriela', last: 'Flores' },
  { first: 'Rafael', last: 'Morales' },
  { first: 'Camila', last: 'Gutierrez' },
  { first: 'Diego', last: 'Herrera' },
  { first: 'Valentina', last: 'Castillo' },
  { first: 'Andres', last: 'Jimenez' },
  { first: 'Lucia', last: 'Diaz' },
  { first: 'Fernando', last: 'Romero' },
  { first: 'Carmen', last: 'Navarro' },
  { first: 'Ricardo', last: 'Cruz' },
  { first: 'Elena', last: 'Vargas' },
  { first: 'Manuel', last: 'Alvarez' },
];

// Generate random date in October or November 2024 only
function getRandomPastDate() {
  const year = 2024;
  const month = Math.random() < 0.5 ? 9 : 10; // 9 = October, 10 = November
  const day = Math.floor(Math.random() * 28) + 1; // 1-28 to avoid month-end issues
  
  return new Date(year, month, day);
}

// Generate rating based on couple name (for consistency)
function getRatingForCouple(firstName, lastName) {
  // Use name hash to determine rating (3-5 stars)
  const hash = (firstName + lastName).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const ratings = [3, 3, 4, 4, 4, 5, 5, 5]; // More 4-5 stars, some 3 stars
  return ratings[hash % ratings.length];
}

async function populateRealisticReviews() {
  console.log('🎯 Populating realistic reviews with proper randomization...\n');
  console.log('📍 Location: Dasmariñas City, Cavite, Philippines');
  console.log('📅 Dates: October-November 2024 only');
  console.log('⭐ Ratings: 3-5 stars (varied by couple)\n');

  try {
    // Step 1: Clear existing reviews and bookings
    console.log('🗑️  Step 1: Clearing existing reviews and related bookings...');
    await sql`DELETE FROM reviews`;
    await sql`DELETE FROM bookings WHERE status = 'completed'`;
    console.log('✅ Cleared existing data\n');

    // Step 2: Get all services
    console.log('📋 Step 2: Fetching all services...');
    const services = await sql`
      SELECT s.id, s.title, s.vendor_id, s.category, v.business_name
      FROM services s
      JOIN vendors v ON s.vendor_id = v.id
      WHERE s.is_active = true
      ORDER BY s.created_at DESC
    `;
    
    console.log(`✅ Found ${services.length} services\n`);

    if (services.length === 0) {
      console.log('❌ No services found. Please run populate-services-and-reviews.cjs first.');
      return;
    }

    // Step 3: Get or create users
    console.log('👥 Step 3: Setting up couple users...');
    const existingUsers = await sql`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE role = 'individual'
      LIMIT ${coupleNames.length}
    `;
    
    console.log(`   Found ${existingUsers.length} existing users`);
    
    const users = [];
    
    // Use existing users first
    for (const user of existingUsers) {
      users.push(user);
    }
    
    // Create new users for missing couples
    for (let i = existingUsers.length; i < coupleNames.length; i++) {
      const couple = coupleNames[i];
      const email = `${couple.first.toLowerCase()}.${couple.last.toLowerCase()}@example.com`;
      
      try {
        const newUser = await sql`
          INSERT INTO users (
            email,
            password_hash,
            first_name,
            last_name,
            role,
            phone,
            created_at,
            updated_at
          ) VALUES (
            ${email},
            '$2b$10$dummyhashforexampleonly12345678901234567890123456',
            ${couple.first},
            ${couple.last},
            'individual',
            '+639171234567',
            NOW(),
            NOW()
          )
          ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
          RETURNING id, email, first_name, last_name
        `;
        
        users.push(newUser[0]);
        console.log(`   ✅ Created user: ${couple.first} ${couple.last}`);
      } catch (error) {
        console.error(`   ❌ Error creating user ${couple.first}:`, error.message);
      }
    }
    
    console.log(`✅ Total users ready: ${users.length}\n`);

    let reviewsCreated = 0;
    let bookingsCreated = 0;

    // Step 4: Create reviews for each service
    console.log('📝 Step 4: Creating reviews for each service...\n');
    
    const location = 'Dasmariñas City, Cavite, Philippines';
    
    for (const service of services) {
      console.log(`\n📦 Service: ${service.title}`);
      console.log(`   Vendor: ${service.business_name}`);
      
      // Create 3-5 reviews per service
      const numReviews = Math.floor(Math.random() * 3) + 3; // 3-5 reviews
      console.log(`   Creating ${numReviews} reviews...`);
      
      // Shuffle users to get random selection
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
      
      for (let i = 0; i < numReviews && i < shuffledUsers.length; i++) {
        const user = shuffledUsers[i];
        const rating = getRatingForCouple(user.first_name, user.last_name);
        const reviewText = reviewTemplates[rating][Math.floor(Math.random() * reviewTemplates[rating].length)];
        const eventDate = getRandomPastDate();
        
        try {
          // Create completed booking
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
              ${location},
              'completed',
              ${15000 + Math.floor(Math.random() * 85000)},
              ${`REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`},
              ${eventDate.toISOString()},
              NOW()
            )
            RETURNING id
          `;
          
          bookingsCreated++;
          
          // Create review
          const reviewId = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          
          await sql`
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
              ${rating},
              ${reviewText},
              '{}'::text[],
              true,
              ${eventDate.toISOString()},
              NOW()
            )
          `;
          
          reviewsCreated++;
          const stars = '⭐'.repeat(rating);
          console.log(`   ${stars} ${rating} stars - ${user.first_name} ${user.last_name} - ${eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`);
          
          // Small delay to ensure unique timestamps
          await new Promise(resolve => setTimeout(resolve, 50));
          
        } catch (error) {
          console.error(`   ❌ Error creating review:`, error.message);
        }
      }
    }

    // Step 5: Update vendor ratings based on actual reviews
    console.log('\n\n📊 Step 5: Updating vendor ratings...');
    const vendorsWithReviews = await sql`
      SELECT DISTINCT vendor_id FROM reviews
    `;
    
    for (const { vendor_id } of vendorsWithReviews) {
      const avgRating = await sql`
        SELECT 
          AVG(rating)::numeric(3,1) as avg_rating,
          COUNT(*) as review_count
        FROM reviews
        WHERE vendor_id = ${vendor_id}
      `;
      
      await sql`
        UPDATE vendors
        SET 
          rating = ${avgRating[0].avg_rating},
          updated_at = NOW()
        WHERE id = ${vendor_id}
      `;
      
      console.log(`   ✅ Updated vendor ${vendor_id}: ${avgRating[0].avg_rating} stars (${avgRating[0].review_count} reviews)`);
    }

    // Final summary
    console.log('\n\n✅ Population Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Bookings created: ${bookingsCreated}`);
    console.log(`   - Reviews created: ${reviewsCreated}`);
    console.log(`   - Vendors updated: ${vendorsWithReviews.length}`);
    console.log(`   - Location: Dasmariñas City, Cavite, Philippines`);
    console.log(`   - Date range: October-November 2024`);
    console.log(`   - Rating distribution:`);
    
    const ratingDist = await sql`
      SELECT rating, COUNT(*) as count
      FROM reviews
      GROUP BY rating
      ORDER BY rating DESC
    `;
    
    for (const { rating, count } of ratingDist) {
      const stars = '⭐'.repeat(rating);
      const percentage = ((count / reviewsCreated) * 100).toFixed(1);
      console.log(`     ${stars} ${rating} stars: ${count} reviews (${percentage}%)`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

populateRealisticReviews();
