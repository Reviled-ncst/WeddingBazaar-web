/**
 * Seed Subcategories for Wedding Services
 * Populates the service_subcategories table with realistic subcategories
 */
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function seedSubcategories() {
  console.log('🌱 Seeding subcategories...\n');

  try {
    // First, get all category IDs
    const categories = await sql`
      SELECT id, name, display_name 
      FROM service_categories 
      WHERE is_active = true
      ORDER BY sort_order;
    `;

    console.log(`Found ${categories.length} categories\n`);

    // Define subcategories for each category
    const subcategoriesData = {
      'Photography': [
        { name: 'Wedding Photography', display_name: 'Wedding Photography', description: 'Full wedding day photography coverage' },
        { name: 'Engagement Photography', display_name: 'Engagement Photography', description: 'Pre-wedding engagement shoots' },
        { name: 'Drone Photography', display_name: 'Drone Photography & Aerial Shots', description: 'Aerial drone photography and videography' },
        { name: 'Photo Booth', display_name: 'Photo Booth Services', description: 'Interactive photo booth for guests' }
      ],
      'Videography': [
        { name: 'Wedding Videography', display_name: 'Wedding Videography', description: 'Professional wedding video coverage' },
        { name: 'Same Day Edit', display_name: 'Same Day Edit (SDE)', description: 'Edited video highlights shown on the same day' },
        { name: 'Cinematic Video', display_name: 'Cinematic Wedding Films', description: 'Movie-style wedding cinematography' }
      ],
      'Planning': [
        { name: 'Full Planning', display_name: 'Full Wedding Planning', description: 'Complete wedding planning from start to finish' },
        { name: 'Partial Planning', display_name: 'Partial Planning', description: 'Planning assistance for specific aspects' },
        { name: 'Day Coordination', display_name: 'Day-of Coordination', description: 'Coordination on the wedding day only' },
        { name: 'Destination Planning', display_name: 'Destination Wedding Planning', description: 'Planning for destination weddings' }
      ],
      'Florist': [
        { name: 'Bridal Bouquet', display_name: 'Bridal Bouquets', description: 'Custom bridal and bridesmaid bouquets' },
        { name: 'Centerpieces', display_name: 'Centerpieces & Table Arrangements', description: 'Floral table decorations' },
        { name: 'Ceremony Flowers', display_name: 'Ceremony Flowers', description: 'Altar and aisle flower arrangements' },
        { name: 'Reception Decor', display_name: 'Reception Floral Decor', description: 'Full reception flower decoration' }
      ],
      'Hair_Makeup': [
        { name: 'Bridal Makeup', display_name: 'Bridal Makeup', description: 'Professional bridal makeup services' },
        { name: 'Bridal Hair', display_name: 'Bridal Hair Styling', description: 'Wedding day hairstyling' },
        { name: 'Airbrush Makeup', display_name: 'Airbrush Makeup', description: 'Long-lasting airbrush makeup' },
        { name: 'Party Makeup', display_name: 'Bridal Party Makeup', description: 'Makeup for bridesmaids and family' }
      ],
      'Catering': [
        { name: 'Filipino Cuisine', display_name: 'Filipino Cuisine', description: 'Traditional Filipino dishes' },
        { name: 'International Cuisine', display_name: 'International Cuisine', description: 'Western and international menu options' },
        { name: 'Buffet Service', display_name: 'Buffet Service', description: 'Buffet-style catering' },
        { name: 'Plated Dining', display_name: 'Plated Dining Service', description: 'Formal plated meal service' },
        { name: 'Cocktail Reception', display_name: 'Cocktail Reception', description: 'Cocktail hour catering' }
      ],
      'DJ_Band': [
        { name: 'DJ Services', display_name: 'DJ Services', description: 'Professional wedding DJ' },
        { name: 'Live Band', display_name: 'Live Band', description: 'Live music band performance' },
        { name: 'Acoustic', display_name: 'Acoustic Performance', description: 'Acoustic musicians for ceremony or cocktail' },
        { name: 'String Quartet', display_name: 'String Quartet', description: 'Classical string quartet' }
      ],
      'Officiant': [
        { name: 'Catholic Priest', display_name: 'Catholic Priest', description: 'Catholic wedding ceremony' },
        { name: 'Christian Pastor', display_name: 'Christian Pastor', description: 'Christian wedding ceremony' },
        { name: 'Civil Officiant', display_name: 'Civil Wedding Officiant', description: 'Non-religious civil ceremony' },
        { name: 'Non-denominational', display_name: 'Non-denominational Officiant', description: 'Interfaith or non-denominational ceremony' }
      ],
      'Venue': [
        { name: 'Hotel Ballroom', display_name: 'Hotel Ballrooms', description: 'Hotel wedding venues' },
        { name: 'Garden Venue', display_name: 'Garden & Outdoor Venues', description: 'Outdoor garden wedding locations' },
        { name: 'Beach Venue', display_name: 'Beach Venues', description: 'Beachfront wedding locations' },
        { name: 'Church Hall', display_name: 'Church Halls & Parish Centers', description: 'Church-affiliated reception venues' },
        { name: 'Restaurant', display_name: 'Restaurants', description: 'Restaurant wedding venues' }
      ],
      'Rentals': [
        { name: 'Table Chairs', display_name: 'Tables & Chairs', description: 'Event seating and tables' },
        { name: 'Linens', display_name: 'Linens & Table Covers', description: 'Table linens and decorative covers' },
        { name: 'Tents', display_name: 'Tents & Canopies', description: 'Outdoor event tents' },
        { name: 'Stage Backdrop', display_name: 'Stage & Backdrop', description: 'Stage setup and backdrops' }
      ],
      'Cake': [
        { name: 'Wedding Cake', display_name: 'Multi-tier Wedding Cakes', description: 'Traditional tiered wedding cakes' },
        { name: 'Cupcakes', display_name: 'Wedding Cupcakes', description: 'Cupcake towers and displays' },
        { name: 'Dessert Table', display_name: 'Dessert Tables', description: 'Full dessert table setup' },
        { name: 'Custom Cakes', display_name: 'Custom Designed Cakes', description: 'Fully custom cake designs' }
      ],
      'Attire': [
        { name: 'Wedding Gown', display_name: 'Wedding Gowns', description: 'Bridal gown design and fitting' },
        { name: 'Barong', display_name: 'Barong Tagalog', description: 'Traditional Filipino groom attire' },
        { name: 'Suit Rental', display_name: 'Suit Rental & Purchase', description: 'Groom and groomsmen suits' },
        { name: 'Alterations', display_name: 'Dress Alterations', description: 'Professional dress alterations' }
      ],
      'Security': [
        { name: 'Event Security', display_name: 'Event Security Guards', description: 'Professional event security' },
        { name: 'Parking Management', display_name: 'Parking & Valet Service', description: 'Parking and valet management' },
        { name: 'Guest Registration', display_name: 'Guest Registration & Check-in', description: 'Guest management services' }
      ],
      'Sounds_Lights': [
        { name: 'Sound System', display_name: 'Sound System', description: 'Professional audio equipment' },
        { name: 'Stage Lighting', display_name: 'Stage & Uplighting', description: 'Event lighting setup' },
        { name: 'LED Wall', display_name: 'LED Wall & Projector', description: 'Visual display systems' },
        { name: 'Special Effects', display_name: 'Special Effects (Fog, Sparklers)', description: 'Event special effects' }
      ],
      'Stationery': [
        { name: 'Invitations', display_name: 'Wedding Invitations', description: 'Custom wedding invitation design' },
        { name: 'Programs', display_name: 'Ceremony Programs', description: 'Wedding ceremony programs' },
        { name: 'Thank You Cards', display_name: 'Thank You Cards', description: 'Post-wedding thank you cards' },
        { name: 'Signage', display_name: 'Wedding Signage', description: 'Custom event signage' }
      ],
      'Transportation': [
        { name: 'Bridal Car', display_name: 'Bridal Car Service', description: 'Luxury car for bride and groom' },
        { name: 'Guest Transportation', display_name: 'Guest Transportation', description: 'Shuttle services for guests' },
        { name: 'Vintage Cars', display_name: 'Vintage & Classic Cars', description: 'Classic and vintage car rentals' }
      ]
    };

    let totalInserted = 0;
    let sortOrder = 1;

    // Insert subcategories for each category
    for (const category of categories) {
      const subcats = subcategoriesData[category.name] || [];
      
      if (subcats.length === 0) {
        console.log(`⚠️  No subcategories defined for ${category.display_name}`);
        continue;
      }

      console.log(`📁 ${category.display_name}: Inserting ${subcats.length} subcategories`);

      let subcatIndex = 1;
      for (const subcat of subcats) {
        const subcategoryId = `SUB-${category.id.replace('CAT-', '')}-${String(subcatIndex).padStart(3, '0')}`;
        
        await sql`
          INSERT INTO service_subcategories (
            id, category_id, name, display_name, description, sort_order, is_active
          ) VALUES (
            ${subcategoryId},
            ${category.id},
            ${subcat.name},
            ${subcat.display_name},
            ${subcat.description},
            ${sortOrder},
            true
          )
          ON CONFLICT (category_id, name) DO NOTHING
        `;
        sortOrder++;
        subcatIndex++;
        totalInserted++;
      }
    }

    console.log(`\n✅ Successfully seeded ${totalInserted} subcategories!`);

    // Verify
    const count = await sql`SELECT COUNT(*) as count FROM service_subcategories WHERE is_active = true`;
    console.log(`\n📊 Total active subcategories in database: ${count[0].count}`);

  } catch (error) {
    console.error('❌ Error seeding subcategories:', error);
    throw error;
  }
}

seedSubcategories()
  .then(() => {
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
