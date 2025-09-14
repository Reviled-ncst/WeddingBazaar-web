const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function seedVendors() {
  try {
    console.log('🌱 Seeding featured vendors data...');

    // First, let's check if we have any vendors
    const existingVendors = await sql`SELECT COUNT(*) as count FROM vendors`;
    console.log(`📊 Current vendors count: ${existingVendors[0].count}`);

    // Seed some featured vendors with the required criteria (ratings 3-5)
    const vendorsToInsert = [
      {
        business_name: 'Elegant Photography Studio',
        business_type: 'Photography',
        description: 'Capturing your special moments with artistic elegance and professional expertise.',
        years_experience: 8,
        portfolio_url: 'https://elegantphoto.com/portfolio',
        instagram_url: 'https://instagram.com/elegantphoto',
        website_url: 'https://elegantphoto.com',
        service_areas: ['Los Angeles', 'Orange County', 'Ventura'],
        location: 'Los Angeles, CA',
        rating: 4.8,
        review_count: 45,
        starting_price: 2500,
        price_range: '$2,500 - $5,000',
        verified: true
      },
      {
        business_name: 'Gourmet Catering Co.',
        business_type: 'Catering',
        description: 'Exquisite culinary experiences tailored for your perfect wedding celebration.',
        years_experience: 12,
        portfolio_url: 'https://gourmetcatering.com/gallery',
        instagram_url: 'https://instagram.com/gourmetcatering',
        website_url: 'https://gourmetcatering.com',
        service_areas: ['San Francisco', 'San Jose', 'Oakland'],
        location: 'San Francisco, CA',
        rating: 4.9,
        review_count: 67,
        starting_price: 75,
        price_range: '$75 - $150 per person',
        verified: true
      },
      {
        business_name: 'Dream Venues & Events',
        business_type: 'Venue',
        description: 'Stunning wedding venues with full-service event planning and coordination.',
        years_experience: 15,
        portfolio_url: 'https://dreamvenues.com/spaces',
        instagram_url: 'https://instagram.com/dreamvenues',
        website_url: 'https://dreamvenues.com',
        service_areas: ['San Diego', 'La Jolla', 'Del Mar'],
        location: 'San Diego, CA',
        rating: 4.2,
        review_count: 89,
        starting_price: 5000,
        price_range: '$5,000 - $15,000',
        verified: true
      },
      {
        business_name: 'Blooming Florals',
        business_type: 'Florist',
        description: 'Beautiful floral arrangements and decorations to make your day bloom.',
        years_experience: 6,
        portfolio_url: 'https://bloomingflorals.com/gallery',
        instagram_url: 'https://instagram.com/bloomingflorals',
        website_url: 'https://bloomingflorals.com',
        service_areas: ['Sacramento', 'Davis', 'Folsom'],
        location: 'Sacramento, CA',
        rating: 4.1,
        review_count: 34,
        starting_price: 800,
        price_range: '$800 - $3,000',
        verified: true
      },
      {
        business_name: 'Harmonic Wedding Music',
        business_type: 'Music',
        description: 'Professional DJs and live music to create the perfect wedding atmosphere.',
        years_experience: 10,
        portfolio_url: 'https://harmonicmusic.com/samples',
        instagram_url: 'https://instagram.com/harmonicmusic',
        website_url: 'https://harmonicmusic.com',
        service_areas: ['Fresno', 'Clovis', 'Madera'],
        location: 'Fresno, CA',
        rating: 4.3,
        review_count: 52,
        starting_price: 1200,
        price_range: '$1,200 - $2,500',
        verified: true
      },
      {
        business_name: 'Perfect Planning Co.',
        business_type: 'Planning',
        description: 'Full-service wedding planning to make your dream wedding a reality.',
        years_experience: 9,
        portfolio_url: 'https://perfectplanning.com/weddings',
        instagram_url: 'https://instagram.com/perfectplanning',
        website_url: 'https://perfectplanning.com',
        service_areas: ['Santa Barbara', 'Ventura', 'Oxnard'],
        location: 'Santa Barbara, CA',
        rating: 4.5,
        review_count: 78,
        starting_price: 3000,
        price_range: '$3,000 - $8,000',
        verified: true
      },
      {
        business_name: 'Sunset Beach Weddings',
        business_type: 'Venue',
        description: 'Breathtaking oceanfront wedding ceremonies with stunning sunset views.',
        years_experience: 7,
        portfolio_url: 'https://sunsetbeachweddings.com/gallery',
        instagram_url: 'https://instagram.com/sunsetbeachweddings',
        website_url: 'https://sunsetbeachweddings.com',
        service_areas: ['Malibu', 'Santa Monica', 'Manhattan Beach'],
        location: 'Malibu, CA',
        rating: 4.7,
        review_count: 63,
        starting_price: 8000,
        price_range: '$8,000 - $20,000',
        verified: true
      },
      {
        business_name: 'Classic Cake Creations',
        business_type: 'Bakery',
        description: 'Custom wedding cakes and desserts that taste as amazing as they look.',
        years_experience: 11,
        portfolio_url: 'https://classiccakes.com/weddings',
        instagram_url: 'https://instagram.com/classiccakes',
        website_url: 'https://classiccakes.com',
        service_areas: ['Pasadena', 'Glendale', 'Burbank'],
        location: 'Pasadena, CA',
        rating: 4.4,
        review_count: 41,
        starting_price: 450,
        price_range: '$450 - $1,200',
        verified: true
      }
    ];

    // Insert vendors if they don't exist
    for (const vendor of vendorsToInsert) {
      try {
        // Check if vendor already exists
        const existing = await sql`
          SELECT id FROM vendors WHERE business_name = ${vendor.business_name}
        `;

        if (existing.length === 0) {
          await sql`
            INSERT INTO vendors (
              business_name, business_type, description, years_experience,
              portfolio_url, instagram_url, website_url, service_areas,
              location, rating, review_count, starting_price, price_range, verified
            ) VALUES (
              ${vendor.business_name}, ${vendor.business_type}, ${vendor.description}, ${vendor.years_experience},
              ${vendor.portfolio_url}, ${vendor.instagram_url}, ${vendor.website_url}, ${JSON.stringify(vendor.service_areas)},
              ${vendor.location}, ${vendor.rating}, ${vendor.review_count}, ${vendor.starting_price}, ${vendor.price_range}, ${vendor.verified}
            )
          `;
          console.log(`✅ Inserted vendor: ${vendor.business_name}`);
        } else {
          console.log(`⏭️  Vendor already exists: ${vendor.business_name}`);
        }
      } catch (error) {
        console.error(`❌ Error inserting vendor ${vendor.business_name}:`, error.message);
      }
    }

    // Check final count
    const finalVendors = await sql`SELECT COUNT(*) as count FROM vendors`;
    console.log(`📊 Final vendors count: ${finalVendors[0].count}`);

    // Test the featured vendors query
    const featuredVendors = await sql`
      SELECT 
        v.id, v.business_name, v.business_type, v.location, 
        v.rating, v.review_count, v.description
      FROM vendors v
      WHERE v.verified = true 
        AND v.rating >= 4.0 
        AND v.review_count >= 10
      ORDER BY v.rating DESC, v.review_count DESC
      LIMIT 6
    `;

    console.log(`🌟 Featured vendors found: ${featuredVendors.length}`);
    featuredVendors.forEach(vendor => {
      console.log(`  - ${vendor.business_name} (${vendor.business_type}) - Rating: ${vendor.rating}/5.0`);
    });

  } catch (error) {
    console.error('❌ Error seeding vendors:', error);
  }
}

seedVendors().then(() => {
  console.log('🎉 Vendor seeding completed!');
  process.exit(0);
});
