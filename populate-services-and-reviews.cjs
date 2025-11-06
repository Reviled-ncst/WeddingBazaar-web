const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * Comprehensive script to populate services with category-specific data and reviews
 * Creates realistic services with images, pricing, and details based on business category
 */

// Category-specific service templates
const serviceTemplates = {
  'Photography': [
    {
      title: 'Wedding Day Coverage Package',
      description: 'Full day photography coverage capturing every special moment of your wedding. Includes pre-ceremony preparations, ceremony, reception, and candid moments throughout the day.',
      price_range: '₱35,000 - ₱80,000',
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
      ],
      inclusions: ['Full day coverage (8-12 hours)', 'Professional photographer', 'High-resolution edited photos (300-500 images)', 'Online gallery', 'USB with all photos', 'Print release'],
      years_in_business: 5
    },
    {
      title: 'Pre-Wedding Photoshoot',
      description: 'Romantic and creative engagement or pre-wedding photoshoot at your choice of location. Perfect for save-the-dates and wedding invitations.',
      price_range: '₱15,000 - ₱35,000',
      images: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
        'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800'
      ],
      inclusions: ['4-6 hours coverage', 'Up to 2 locations', '100-150 edited photos', 'Professional photographer', 'Online gallery', 'Print release'],
      years_in_business: 5
    },
    {
      title: 'Same Day Edit Video',
      description: 'Cinematic same-day edit video that captures the highlights of your wedding day, ready to be shown at your reception.',
      price_range: '₱25,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800'
      ],
      inclusions: ['Full day coverage', 'Professional videographer', '3-5 minute SDE video', 'Same day delivery', 'Background music', 'Digital file'],
      years_in_business: 5
    }
  ],
  'Catering': [
    {
      title: 'Premium Wedding Buffet Package',
      description: 'Luxurious buffet setup featuring Filipino, International, and fusion cuisines. Includes appetizers, main courses, desserts, and beverage station.',
      price_range: '₱800 - ₱1,500 per person',
      images: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
        'https://images.unsplash.com/photo-1519671845924-1fd18db430b8?w=800',
        'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'
      ],
      inclusions: ['5-course meal', 'Appetizers and soup', '3 main course options', 'Dessert station', 'Beverage station', 'Service staff', 'Table setup', 'Minimum 100 pax'],
      years_in_business: 8
    },
    {
      title: 'Cocktail Reception Package',
      description: 'Elegant cocktail-style reception with passed hors d\'oeuvres and stationed appetizers. Perfect for intimate gatherings.',
      price_range: '₱600 - ₱1,000 per person',
      images: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800',
        'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800'
      ],
      inclusions: ['Passed hors d\'oeuvres', '3 food stations', 'Beverage bar', 'Service staff', 'Setup and cleanup', 'Minimum 50 pax'],
      years_in_business: 8
    },
    {
      title: 'Intimate Plated Dinner',
      description: 'Sophisticated plated dinner service with gourmet multi-course meals. Ideal for formal wedding receptions.',
      price_range: '₱1,200 - ₱2,500 per person',
      images: [
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
        'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'
      ],
      inclusions: ['5-course plated meal', 'Appetizer, soup, salad', 'Choice of entree', 'Dessert', 'Wine pairing option', 'Formal service staff', 'Fine china and silverware'],
      years_in_business: 8
    }
  ],
  'Venue': [
    {
      title: 'Garden Wedding Venue',
      description: 'Beautiful outdoor garden setting with lush greenery and romantic ambiance. Perfect for ceremonies and receptions under the stars.',
      price_range: '₱80,000 - ₱150,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800'
      ],
      inclusions: ['Venue rental (8 hours)', 'Garden ceremony area', 'Reception pavilion', 'Bridal suite', 'Parking for 50 cars', 'Tables and chairs', 'Basic lighting', 'Accommodates 150-200 guests'],
      years_in_business: 10
    },
    {
      title: 'Grand Ballroom Package',
      description: 'Elegant indoor ballroom with crystal chandeliers and sophisticated decor. Climate-controlled comfort for your special day.',
      price_range: '₱120,000 - ₱250,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800'
      ],
      inclusions: ['Ballroom rental (10 hours)', 'Climate control', 'Stage and dance floor', 'Audio-visual equipment', 'Bridal and groom suites', 'Valet parking', 'Tables and chairs', 'Accommodates 200-300 guests'],
      years_in_business: 10
    },
    {
      title: 'Beachfront Ceremony Package',
      description: 'Stunning beachfront location with ocean views and sunset backdrop. Unforgettable seaside wedding experience.',
      price_range: '₱100,000 - ₱200,000',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
      ],
      inclusions: ['Beach access (8 hours)', 'Ceremony setup', 'Reception area', 'Tents/canopies', 'Sound system', 'Parking', 'Accommodates 100-150 guests'],
      years_in_business: 10
    }
  ],
  'DJ': [
    {
      title: 'Wedding Reception DJ Package',
      description: 'Professional DJ service with extensive music library and state-of-the-art sound system. Keep your guests dancing all night!',
      price_range: '₱15,000 - ₱35,000',
      images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
      ],
      inclusions: ['Professional DJ (6 hours)', 'Sound system', 'Wireless microphones (2)', 'Music library', 'Uplighting option', 'Consultation included'],
      years_in_business: 6
    },
    {
      title: 'Premium DJ + Emcee Package',
      description: 'Complete entertainment package with DJ and professional emcee to host your wedding reception seamlessly.',
      price_range: '₱25,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800'
      ],
      inclusions: ['DJ + Emcee services (8 hours)', 'Premium sound system', 'Wireless microphones (4)', 'Stage lighting', 'Program coordination', 'Music curation'],
      years_in_business: 6
    }
  ],
  'Florist': [
    {
      title: 'Bridal Bouquet & Boutonniere',
      description: 'Custom-designed bridal bouquet with matching boutonnieres. Fresh flowers arranged to complement your wedding theme.',
      price_range: '₱5,000 - ₱15,000',
      images: [
        'https://images.unsplash.com/photo-1535398089889-dd807df1dfaa?w=800',
        'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800'
      ],
      inclusions: ['Bridal bouquet', '5 boutonnieres', 'Fresh seasonal flowers', 'Custom design', 'Ribbon and embellishments', 'Consultation included'],
      years_in_business: 7
    },
    {
      title: 'Complete Venue Floral Decor',
      description: 'Full venue transformation with stunning floral arrangements, centerpieces, and ceremony decorations.',
      price_range: '₱50,000 - ₱150,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800',
        'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800'
      ],
      inclusions: ['Ceremony arch flowers', 'Aisle decorations', 'Reception centerpieces (10-15 tables)', 'Entrance arrangements', 'Head table backdrop', 'Fresh flowers', 'Setup and teardown'],
      years_in_business: 7
    }
  ],
  'Planning': [
    {
      title: 'Full Wedding Planning Service',
      description: 'Comprehensive wedding planning from engagement to reception. We handle every detail so you can enjoy your special day stress-free.',
      price_range: '₱80,000 - ₱200,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800',
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
      ],
      inclusions: ['Complete planning (12+ months)', 'Vendor coordination', 'Budget management', 'Timeline creation', 'Design consultation', 'Day-of coordination', 'Unlimited meetings', 'Emergency kit'],
      years_in_business: 12
    },
    {
      title: 'Day-of Coordination Package',
      description: 'Professional coordination on your wedding day to ensure everything runs smoothly according to plan.',
      price_range: '₱25,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
      ],
      inclusions: ['Day-of coordination (12 hours)', 'Vendor management', 'Timeline execution', 'Guest assistance', 'Problem solving', '2 coordinators', 'Pre-wedding consultation'],
      years_in_business: 12
    }
  ],
  'Cake': [
    {
      title: 'Custom Wedding Cake',
      description: 'Beautifully designed multi-tier wedding cake customized to your theme. Delicious and Instagram-worthy!',
      price_range: '₱8,000 - ₱25,000',
      images: [
        'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800',
        'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=800'
      ],
      inclusions: ['3-tier custom cake', 'Serves 100-150 guests', 'Custom design', 'Flavor consultation', 'Fresh flowers/decorations', 'Delivery and setup', 'Cake topper included'],
      years_in_business: 9
    },
    {
      title: 'Dessert Bar Package',
      description: 'Elaborate dessert station featuring cupcakes, cake pops, macarons, and other sweet treats.',
      price_range: '₱15,000 - ₱40,000',
      images: [
        'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800',
        'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800'
      ],
      inclusions: ['100 assorted desserts', 'Display setup', '2-tier centerpiece cake', 'Variety of flavors', 'Decorative presentation', 'Service staff', 'Setup and cleanup'],
      years_in_business: 9
    }
  ],
  'Officiant': [
    {
      title: 'Wedding Ceremony Officiant',
      description: 'Professional and warm officiant to conduct your wedding ceremony. Personalized script and meaningful delivery.',
      price_range: '₱8,000 - ₱20,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800'
      ],
      inclusions: ['Ceremony officiation', 'Personalized script', 'Pre-wedding consultation', 'Rehearsal attendance', 'Marriage certificate signing', 'Travel within Metro Manila'],
      years_in_business: 15
    }
  ],
  'Rentals': [
    {
      title: 'Complete Event Furniture Rental',
      description: 'Elegant furniture rental including tables, chairs, linens, and decorative pieces for your wedding venue.',
      price_range: '₱30,000 - ₱80,000',
      images: [
        'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800',
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800'
      ],
      inclusions: ['Tables and chairs (150 guests)', 'Premium linens', 'Decorative pillows', 'Lounge furniture', 'Delivery and setup', 'Pickup and teardown', 'Damage waiver'],
      years_in_business: 6
    },
    {
      title: 'Lighting & Sound Equipment',
      description: 'Professional lighting and sound equipment rental to create the perfect ambiance and ensure crystal-clear audio.',
      price_range: '₱20,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
      ],
      inclusions: ['Uplighting (20 units)', 'String lights', 'Sound system', 'Wireless microphones (4)', 'Projector and screen', 'Technical staff', 'Setup and operation'],
      years_in_business: 6
    }
  ]
};

// Sample review templates
const reviewTemplates = [
  {
    rating: 5,
    comment: "Absolutely amazing service! They went above and beyond our expectations. The attention to detail was incredible and everything was perfect on our special day. Highly recommend!",
  },
  {
    rating: 5,
    comment: "Professional, responsive, and delivered exactly what we wanted. The quality exceeded our expectations. Would definitely book again for future events!",
  },
  {
    rating: 4,
    comment: "Very good service overall. There were a few minor hiccups but they handled everything professionally. Great value for money and wonderful results.",
  },
  {
    rating: 5,
    comment: "Outstanding work! They were so easy to work with and made everything stress-free. The final result was breathtaking. Cannot thank them enough!",
  },
  {
    rating: 4,
    comment: "Great experience from start to finish. Very accommodating to our requests and delivered quality work. A few small issues but overall very satisfied.",
  },
  {
    rating: 5,
    comment: "Exceeded all our expectations! So professional and talented. They captured every special moment perfectly. Best decision we made for our wedding!",
  },
  {
    rating: 5,
    comment: "Simply perfect! From our first meeting to the final delivery, everything was handled with care and professionalism. Worth every penny!",
  },
  {
    rating: 4,
    comment: "Very pleased with the service. They were punctual, professional, and the quality was excellent. Minor communication issues but nothing major.",
  },
  {
    rating: 5,
    comment: "Incredible service! They made our dream wedding come true. So creative and attentive to every detail. Highly recommend to all couples!",
  },
  {
    rating: 5,
    comment: "Top-notch quality and service! They were amazing to work with. Everything was seamless and the results were stunning. 10/10 would recommend!",
  }
];

const locations = [
  'Manila, Metro Manila',
  'Quezon City, Metro Manila',
  'Makati City, Metro Manila',
  'Taguig City, Metro Manila',
  'Pasig City, Metro Manila',
  'Mandaluyong City, Metro Manila',
  'Tagaytay City, Cavite',
  'Antipolo City, Rizal',
  'Las Piñas City, Metro Manila',
  'Parañaque City, Metro Manila'
];

async function populateServicesAndReviews() {
  console.log('🎯 Starting comprehensive population process...\n');

  try {
    // Step 1: Get all vendors
    console.log('📋 Step 1: Fetching all vendors...');
    const vendors = await sql`
      SELECT id, business_name, business_type
      FROM vendors
      WHERE business_type IS NOT NULL
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${vendors.length} vendors\n`);

    // Step 2: Get users for reviews
    console.log('👥 Step 2: Fetching users for reviews...');
    const users = await sql`
      SELECT id, email, first_name, last_name
      FROM users
      WHERE role = 'individual'
      LIMIT 20
    `;
    console.log(`✅ Found ${users.length} users\n`);

    // Get the highest existing service number
    const maxService = await sql`
      SELECT id FROM services 
      WHERE id LIKE 'SRV-%'
      ORDER BY id DESC 
      LIMIT 1
    `;
    
    let serviceCounter = 0;
    if (maxService.length > 0) {
      const lastId = maxService[0].id;
      const lastNum = parseInt(lastId.split('-')[1]);
      serviceCounter = lastNum;
      console.log(`   Last service ID: ${lastId}, starting from ${serviceCounter + 1}\n`);
    }

    let servicesCreated = 0;
    let reviewsCreated = 0;
    let bookingsCreated = 0;

    // Step 3: For each vendor, create services based on their category
    console.log('📝 Step 3: Creating services for each vendor...\n');
    
    for (const vendor of vendors) {
      const category = vendor.business_type;
      const templates = serviceTemplates[category] || serviceTemplates['Rentals']; // Fallback
      
      console.log(`\n🏢 Vendor: ${vendor.business_name} (${category})`);
      console.log(`   Creating ${templates.length} services...`);
      
      for (const template of templates) {
        try {
          serviceCounter++;
          const serviceId = `SRV-${String(serviceCounter).padStart(5, '0')}`;
          const location = locations[Math.floor(Math.random() * locations.length)];
          
          // Create service
          const service = await sql`
            INSERT INTO services (
              id,
              vendor_id,
              title,
              category,
              description,
              price_range,
              images,
              location,
              years_in_business,
              contact_info,
              is_active,
              created_at,
              updated_at
            ) VALUES (
              ${serviceId},
              ${vendor.id},
              ${template.title},
              ${category},
              ${template.description},
              ${template.price_range},
              ${`{${template.images.join(',')}}`}::text[],
              ${location},
              ${template.years_in_business},
              ${'{}'}::jsonb,
              true,
              NOW(),
              NOW()
            )
            RETURNING id, title
          `;
          
          servicesCreated++;
          console.log(`   ✅ Created service: ${service[0].title}`);
          
          // Create 3-5 reviews for this service
          const numReviews = Math.floor(Math.random() * 3) + 3;
          console.log(`      Creating ${numReviews} reviews...`);
          
          for (let i = 0; i < numReviews && i < users.length; i++) {
            const user = users[i % users.length];
            const reviewData = reviewTemplates[reviewsCreated % reviewTemplates.length];
            
            try {
              // Create completed booking
              const eventDate = new Date();
              eventDate.setMonth(eventDate.getMonth() - Math.floor(Math.random() * 3));
              
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
                  ${vendor.id},
                  ${serviceId},
                  ${category},
                  ${eventDate.toISOString().split('T')[0]},
                  ${location},
                  'completed',
                  ${15000 + Math.floor(Math.random() * 35000)},
                  ${`REF-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`},
                  NOW(),
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
                  ${vendor.id},
                  ${user.id},
                  ${reviewData.rating},
                  ${reviewData.comment},
                  '{}'::text[],
                  true,
                  NOW(),
                  NOW()
                )
              `;
              
              reviewsCreated++;
              console.log(`      ⭐ Review ${i + 1}: ${reviewData.rating} stars by ${user.first_name}`);
              
              await new Promise(resolve => setTimeout(resolve, 50));
              
            } catch (error) {
              console.error(`      ❌ Error creating review:`, error.message);
            }
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`   ❌ Error creating service:`, error.message);
        }
      }
    }

    // Step 4: Update vendor ratings
    console.log('\n\n📊 Step 4: Updating vendor ratings...');
    const vendorsWithReviews = await sql`
      SELECT DISTINCT vendor_id FROM reviews
    `;
    
    for (const vendor of vendorsWithReviews) {
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
      
      const vendorInfo = await sql`
        SELECT business_name FROM vendors WHERE id = ${vendor.vendor_id}
      `;
      
      console.log(`  ✅ ${vendorInfo[0].business_name}: ${stats[0].avg_rating}⭐ (${stats[0].review_count} reviews)`);
    }

    // Final Summary
    console.log('\n\n🎉 ==========================================');
    console.log('✅ POPULATION COMPLETE!');
    console.log('==========================================');
    console.log(`📊 Summary:`);
    console.log(`   • Vendors processed: ${vendors.length}`);
    console.log(`   • Services created: ${servicesCreated}`);
    console.log(`   • Bookings created: ${bookingsCreated}`);
    console.log(`   • Reviews created: ${reviewsCreated}`);
    console.log(`   • Vendors rated: ${vendorsWithReviews.length}`);
    console.log('==========================================\n');

    // Show final statistics
    console.log('📈 Final Statistics:');
    const finalStats = await sql`
      SELECT 
        v.business_name,
        v.business_type,
        v.rating,
        v.review_count,
        COUNT(DISTINCT s.id) as service_count
      FROM vendors v
      LEFT JOIN services s ON v.id = s.vendor_id
      LEFT JOIN reviews r ON v.id = r.vendor_id
      WHERE s.id IS NOT NULL
      GROUP BY v.id, v.business_name, v.business_type, v.rating, v.review_count
      ORDER BY v.rating DESC, v.review_count DESC
    `;
    
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    VENDOR SUMMARY                              ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    finalStats.forEach((stat, idx) => {
      console.log(`${idx + 1}. ${stat.business_name} (${stat.business_type})`);
      console.log(`   Rating: ${stat.rating || 'N/A'} ⭐ | Reviews: ${stat.review_count || 0} | Services: ${stat.service_count}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Run the script
populateServicesAndReviews()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
