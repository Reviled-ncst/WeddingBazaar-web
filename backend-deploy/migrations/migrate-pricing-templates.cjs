#!/usr/bin/env node

/**
 * PRICING TEMPLATES DATA MIGRATION SCRIPT
 * ========================================
 * Migrates pricing data from static TypeScript file to database
 * 
 * Usage: node migrate-pricing-templates.cjs
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '../.env' });

const sql = neon(process.env.DATABASE_URL);

// =====================================================
// REALISTIC WEDDING PRICING DATA
// =====================================================

const PHOTOGRAPHY_PACKAGES = {
  bronze: {
    label: 'Bronze Package',
    price: 35000,
    description: 'Essential photography coverage for intimate weddings',
    inclusions: [
      { name: 'Full-day coverage', quantity: 8, unit: 'hours', description: 'Wedding day photography from preps to send-off' },
      { name: 'Professional photographer', quantity: 1, unit: 'photographer', description: 'Lead photographer with 3+ years experience' },
      { name: 'Edited digital photos', quantity: 300, unit: 'photos', description: 'High-resolution edited images' },
      { name: 'Online gallery', quantity: 1, unit: 'gallery', description: 'Password-protected online viewing and download' },
      { name: 'USB with all photos', quantity: 1, unit: 'piece', description: 'Custom-branded USB drive' }
    ]
  },
  silver: {
    label: 'Silver Package',
    price: 60000,
    description: 'Popular choice for most weddings with extended coverage',
    inclusions: [
      { name: 'Full-day coverage', quantity: 10, unit: 'hours', description: 'Extended wedding day coverage' },
      { name: 'Professional photographers', quantity: 2, unit: 'photographers', description: 'Lead photographer + assistant' },
      { name: 'Edited digital photos', quantity: 500, unit: 'photos', description: 'High-resolution edited images' },
      { name: 'Same-day edit slideshow', quantity: 1, unit: 'slideshow', description: '5-7 minute slideshow during reception', highlighted: true },
      { name: 'Online gallery', quantity: 1, unit: 'gallery', description: 'Password-protected online viewing' },
      { name: 'Printed photo album', quantity: 1, unit: 'album', description: '12x12 inch premium album (30 pages)', highlighted: true },
      { name: 'USB with all photos', quantity: 1, unit: 'piece', description: 'Custom-branded USB drive' }
    ]
  },
  gold: {
    label: 'Gold Package',
    price: 95000,
    description: 'Premium coverage with pre-wedding shoot and premium album',
    inclusions: [
      { name: 'Full-day coverage', quantity: 12, unit: 'hours', description: 'Full wedding day coverage including prep and after-party' },
      { name: 'Professional photographers', quantity: 2, unit: 'photographers', description: 'Lead photographer + assistant' },
      { name: 'Pre-wedding shoot', quantity: 1, unit: 'session', description: 'Half-day engagement or prenup shoot', highlighted: true },
      { name: 'Edited digital photos', quantity: 700, unit: 'photos', description: 'Wedding day + prenup photos' },
      { name: 'Same-day edit slideshow', quantity: 1, unit: 'slideshow', description: '8-10 minute cinematic slideshow' },
      { name: 'Online gallery', quantity: 1, unit: 'gallery', description: 'Password-protected online viewing' },
      { name: 'Printed photo albums', quantity: 2, unit: 'albums', description: '12x12 inch premium albums (40 pages each)', highlighted: true },
      { name: 'Printed photo canvas', quantity: 1, unit: 'canvas', description: '20x30 inch gallery-wrapped canvas' },
      { name: 'USB with all photos', quantity: 1, unit: 'piece', description: 'Luxury wooden USB box' }
    ]
  },
  platinum: {
    label: 'Platinum Package',
    price: 150000,
    description: 'Ultimate photography experience with full team and premium deliverables',
    inclusions: [
      { name: 'Unlimited coverage', quantity: 1, unit: 'day', description: 'Full day coverage from morning preps to send-off' },
      { name: 'Professional photographers', quantity: 3, unit: 'photographers', description: 'Lead photographer + 2 assistants' },
      { name: 'Pre-wedding shoot', quantity: 2, unit: 'sessions', description: 'Engagement + prenup shoots at multiple locations', highlighted: true },
      { name: 'Drone coverage', quantity: 1, unit: 'service', description: 'Aerial shots and videos with licensed drone pilot', highlighted: true },
      { name: 'Edited digital photos', quantity: 1000, unit: 'photos', description: 'Wedding + prenup + engagement photos' },
      { name: 'Same-day edit slideshow', quantity: 1, unit: 'slideshow', description: '10-15 minute cinematic slideshow with music' },
      { name: 'Online gallery', quantity: 1, unit: 'gallery', description: 'Lifetime online gallery access' },
      { name: 'Luxury photo albums', quantity: 3, unit: 'albums', description: '12x12 inch Italian leather albums (50 pages each)', highlighted: true },
      { name: 'Printed photo canvases', quantity: 3, unit: 'canvases', description: 'Three 20x30 inch gallery-wrapped canvases' },
      { name: 'Parent albums', quantity: 2, unit: 'albums', description: '8x10 inch parent albums (20 pages each)' },
      { name: 'USB with all photos', quantity: 2, unit: 'pieces', description: 'Luxury wooden USB boxes for couple and parents' }
    ]
  }
};

const CATERING_PACKAGES = {
  bronze: {
    label: 'Bronze Package',
    price: 550,
    description: 'Budget-friendly buffet package (per pax)',
    inclusions: [
      { name: 'Main dishes', quantity: 3, unit: 'dishes', description: 'Choice of Filipino or international cuisine' },
      { name: 'Side dishes', quantity: 2, unit: 'dishes', description: 'Vegetable and salad options' },
      { name: 'Rice', quantity: 2, unit: 'types', description: 'Plain and fried rice' },
      { name: 'Dessert', quantity: 1, unit: 'type', description: 'Simple dessert (fruit salad or buko pandan)' },
      { name: 'Beverages', quantity: 2, unit: 'types', description: 'Iced tea and water' },
      { name: 'Basic table setup', quantity: 1, unit: 'service', description: 'Standard buffet table and serving utensils' }
    ]
  },
  silver: {
    label: 'Silver Package',
    price: 850,
    description: 'Most popular buffet package with more variety (per pax)',
    inclusions: [
      { name: 'Main dishes', quantity: 5, unit: 'dishes', description: 'Mix of Filipino and international cuisines' },
      { name: 'Side dishes', quantity: 3, unit: 'dishes', description: 'Variety of vegetables and salads' },
      { name: 'Rice', quantity: 2, unit: 'types', description: 'Plain and special fried rice' },
      { name: 'Pasta station', quantity: 1, unit: 'station', description: 'Choice of carbonara or marinara', highlighted: true },
      { name: 'Desserts', quantity: 2, unit: 'types', description: 'Leche flan and fruit salad' },
      { name: 'Beverages', quantity: 3, unit: 'types', description: 'Iced tea, juice, and water' },
      { name: 'Premium table setup', quantity: 1, unit: 'service', description: 'Decorated buffet tables with linens', highlighted: true },
      { name: 'Service staff', quantity: 1, unit: 'staff per 50 pax', description: 'Professional waiters and servers' }
    ]
  },
  gold: {
    label: 'Gold Package',
    price: 1200,
    description: 'Premium buffet with live stations (per pax)',
    inclusions: [
      { name: 'Main dishes', quantity: 6, unit: 'dishes', description: 'Premium Filipino and international cuisines' },
      { name: 'Side dishes', quantity: 4, unit: 'dishes', description: 'Gourmet vegetables and salads' },
      { name: 'Rice', quantity: 3, unit: 'types', description: 'Plain, garlic, and special fried rice' },
      { name: 'Pasta station', quantity: 1, unit: 'station', description: 'Live pasta cooking with chef', highlighted: true },
      { name: 'Carving station', quantity: 1, unit: 'station', description: 'Roast beef or lechon carving station', highlighted: true },
      { name: 'Appetizer station', quantity: 1, unit: 'station', description: 'Canapes and hors d\'oeuvres' },
      { name: 'Desserts', quantity: 3, unit: 'types', description: 'Variety of Filipino desserts' },
      { name: 'Beverages', quantity: 4, unit: 'types', description: 'Premium drinks including coffee and tea' },
      { name: 'Luxury table setup', quantity: 1, unit: 'service', description: 'Themed decoration and premium linens', highlighted: true },
      { name: 'Service staff', quantity: 1, unit: 'staff per 40 pax', description: 'Professional service team' }
    ]
  },
  platinum: {
    label: 'Platinum Package',
    price: 1800,
    description: 'Ultimate dining experience with plated service option (per pax)',
    inclusions: [
      { name: 'Plated appetizer', quantity: 1, unit: 'course', description: 'Choice of soup or salad', highlighted: true },
      { name: 'Main course', quantity: 1, unit: 'course', description: 'Choice of premium beef, seafood, or specialty dish', highlighted: true },
      { name: 'Buffet extension', quantity: 8, unit: 'dishes', description: 'Additional buffet station with international cuisine' },
      { name: 'Rice', quantity: 3, unit: 'types', description: 'Plain, garlic, and special fried rice' },
      { name: 'Live cooking stations', quantity: 3, unit: 'stations', description: 'Pasta, carving, and Asian stir-fry stations', highlighted: true },
      { name: 'Seafood station', quantity: 1, unit: 'station', description: 'Fresh oysters, prawns, and sashimi' },
      { name: 'Dessert bar', quantity: 1, unit: 'station', description: 'Full dessert station with cakes and pastries', highlighted: true },
      { name: 'Welcome drinks', quantity: 1, unit: 'service', description: 'Cocktail reception with canapés' },
      { name: 'Beverages', quantity: 5, unit: 'types', description: 'Premium drinks including specialty coffee' },
      { name: 'Executive table setup', quantity: 1, unit: 'service', description: 'Complete event styling and decoration' },
      { name: 'Service staff', quantity: 1, unit: 'staff per 30 pax', description: 'Premium service team with captain waiter' },
      { name: 'Chef service', quantity: 1, unit: 'chef', description: 'Executive chef for live cooking stations' }
    ]
  }
};

const VENUE_PACKAGES = {
  bronze: {
    label: 'Basic Venue',
    price: 50000,
    description: 'Simple venue rental for intimate gatherings',
    inclusions: [
      { name: 'Venue rental', quantity: 6, unit: 'hours', description: 'Basic event space rental' },
      { name: 'Guest capacity', quantity: 50, unit: 'pax', description: 'Maximum guest capacity' },
      { name: 'Tables and chairs', quantity: 1, unit: 'set', description: 'Basic round tables and monobloc chairs' },
      { name: 'Basic lighting', quantity: 1, unit: 'set', description: 'Standard venue lighting' },
      { name: 'Airconditioning', quantity: 1, unit: 'service', description: 'Climate-controlled indoor space' },
      { name: 'Parking slots', quantity: 10, unit: 'slots', description: 'Limited parking spaces' }
    ]
  },
  silver: {
    label: 'Standard Venue',
    price: 100000,
    description: 'Popular venue choice with premium amenities',
    inclusions: [
      { name: 'Venue rental', quantity: 8, unit: 'hours', description: 'Extended event space rental' },
      { name: 'Guest capacity', quantity: 150, unit: 'pax', description: 'Maximum guest capacity' },
      { name: 'Tables and chairs', quantity: 1, unit: 'set', description: 'Premium banquet tables and Tiffany chairs', highlighted: true },
      { name: 'Stage and backdrop', quantity: 1, unit: 'set', description: 'Professional stage setup', highlighted: true },
      { name: 'Sound system', quantity: 1, unit: 'set', description: 'Basic PA system with microphones' },
      { name: 'Lighting package', quantity: 1, unit: 'set', description: 'Uplighting and pin spots' },
      { name: 'Airconditioning', quantity: 1, unit: 'service', description: 'Climate-controlled space' },
      { name: 'Bridal suite', quantity: 1, unit: 'room', description: 'Private preparation room for bride' },
      { name: 'Parking slots', quantity: 30, unit: 'slots', description: 'Ample parking with valet option' }
    ]
  },
  gold: {
    label: 'Premium Venue',
    price: 180000,
    description: 'Luxury venue with full amenities and decoration',
    inclusions: [
      { name: 'Venue rental', quantity: 10, unit: 'hours', description: 'Full-day event space rental' },
      { name: 'Guest capacity', quantity: 300, unit: 'pax', description: 'Maximum guest capacity' },
      { name: 'Premium tables and chairs', quantity: 1, unit: 'set', description: 'Luxury banquet setup with linens', highlighted: true },
      { name: 'Grand stage setup', quantity: 1, unit: 'set', description: 'Decorated stage with backdrop and flower arrangements', highlighted: true },
      { name: 'Professional sound system', quantity: 1, unit: 'set', description: 'Premium PA system with wireless mics' },
      { name: 'Intelligent lighting', quantity: 1, unit: 'set', description: 'Moving lights and LED uplighting', highlighted: true },
      { name: 'LED wall or projector', quantity: 1, unit: 'unit', description: 'Visual display for presentations' },
      { name: 'Airconditioning', quantity: 1, unit: 'service', description: 'Premium climate control' },
      { name: 'Bridal suite', quantity: 1, unit: 'room', description: 'Luxury preparation room with amenities' },
      { name: 'Groom\'s room', quantity: 1, unit: 'room', description: 'Separate preparation room for groom' },
      { name: 'Parking slots', quantity: 80, unit: 'slots', description: 'Extensive parking with valet service' },
      { name: 'Security personnel', quantity: 2, unit: 'guards', description: 'Professional event security' }
    ]
  },
  platinum: {
    label: 'Luxury Venue',
    price: 300000,
    description: 'Ultimate venue experience with complete event production',
    inclusions: [
      { name: 'Venue rental', quantity: 12, unit: 'hours', description: 'Extended rental with setup/teardown time' },
      { name: 'Guest capacity', quantity: 500, unit: 'pax', description: 'Grand ballroom capacity', highlighted: true },
      { name: 'Executive tables and chairs', quantity: 1, unit: 'set', description: 'Designer furniture with premium linens', highlighted: true },
      { name: 'Grand stage and backdrop', quantity: 1, unit: 'set', description: 'Custom-designed stage with floral arrangements' },
      { name: 'Concert-grade sound system', quantity: 1, unit: 'set', description: 'Professional audio setup', highlighted: true },
      { name: 'Full lighting production', quantity: 1, unit: 'package', description: 'Moving lights, LED walls, and special effects', highlighted: true },
      { name: 'Multiple LED walls', quantity: 2, unit: 'units', description: 'HD LED displays for presentations' },
      { name: 'Special effects', quantity: 1, unit: 'package', description: 'Cold sparks, fog machines, and bubble machines' },
      { name: 'Premium airconditioning', quantity: 1, unit: 'service', description: 'Central air conditioning system' },
      { name: 'Bridal suite', quantity: 1, unit: 'room', description: 'Luxury suite with bathroom and amenities' },
      { name: 'Groom\'s room', quantity: 1, unit: 'room', description: 'Separate luxury preparation room' },
      { name: 'VIP lounge', quantity: 1, unit: 'area', description: 'Private lounge for special guests' },
      { name: 'Parking slots', quantity: 150, unit: 'slots', description: 'Massive parking area with valet and security' },
      { name: 'Security personnel', quantity: 5, unit: 'guards', description: 'Full security team' },
      { name: 'Event coordinator', quantity: 1, unit: 'coordinator', description: 'Dedicated venue coordinator' }
    ]
  }
};

const MUSIC_PACKAGES = {
  bronze: {
    label: 'DJ Package',
    price: 15000,
    description: 'Professional DJ service for your reception',
    inclusions: [
      { name: 'Professional DJ', quantity: 1, unit: 'DJ', description: 'Experienced DJ with extensive music library' },
      { name: 'DJ performance', quantity: 5, unit: 'hours', description: 'Reception music and hosting' },
      { name: 'Sound system', quantity: 1, unit: 'set', description: 'PA system with speakers and mixer' },
      { name: 'Wireless microphones', quantity: 2, unit: 'pieces', description: 'For speeches and toasts' },
      { name: 'Music playlist consultation', quantity: 1, unit: 'session', description: 'Pre-event music planning' }
    ]
  },
  silver: {
    label: 'DJ Plus Package',
    price: 28000,
    description: 'DJ with upgraded sound and lighting',
    inclusions: [
      { name: 'Professional DJ', quantity: 1, unit: 'DJ', description: 'Premium DJ with MC services' },
      { name: 'DJ performance', quantity: 6, unit: 'hours', description: 'Extended reception coverage' },
      { name: 'Premium sound system', quantity: 1, unit: 'set', description: 'High-quality audio equipment', highlighted: true },
      { name: 'Wireless microphones', quantity: 4, unit: 'pieces', description: 'Multiple microphones for program' },
      { name: 'DJ lighting', quantity: 1, unit: 'set', description: 'Dance floor lighting effects', highlighted: true },
      { name: 'Music playlist consultation', quantity: 1, unit: 'session', description: 'Detailed music planning' },
      { name: 'Special song requests', quantity: 1, unit: 'service', description: 'Unlimited song requests' }
    ]
  },
  gold: {
    label: 'Live Band Package',
    price: 50000,
    description: 'Professional live band performance',
    inclusions: [
      { name: 'Live band', quantity: 1, unit: 'band', description: '5-piece professional band', highlighted: true },
      { name: 'Band performance', quantity: 4, unit: 'hours', description: 'Live music performance with breaks' },
      { name: 'Acoustic set', quantity: 1, unit: 'set', description: 'Acoustic performance during dinner', highlighted: true },
      { name: 'Professional sound system', quantity: 1, unit: 'set', description: 'Full PA system for band' },
      { name: 'Stage lighting', quantity: 1, unit: 'set', description: 'Professional stage lighting' },
      { name: 'Wireless microphones', quantity: 4, unit: 'pieces', description: 'For band and speeches' },
      { name: 'Song list consultation', quantity: 1, unit: 'session', description: 'Custom setlist planning' },
      { name: 'DJ for breaks', quantity: 1, unit: 'DJ', description: 'DJ during band breaks' }
    ]
  },
  platinum: {
    label: 'Band + DJ Full Package',
    price: 80000,
    description: 'Complete music entertainment package',
    inclusions: [
      { name: 'Live band', quantity: 1, unit: 'band', description: '7-piece premium band with vocalists', highlighted: true },
      { name: 'Band performance', quantity: 5, unit: 'hours', description: 'Extended live performance' },
      { name: 'Acoustic ceremony music', quantity: 1, unit: 'set', description: 'String quartet or acoustic duo for ceremony', highlighted: true },
      { name: 'Professional DJ', quantity: 1, unit: 'DJ', description: 'Premium DJ for cocktail hour and after-party' },
      { name: 'Concert-grade sound', quantity: 1, unit: 'set', description: 'Professional audio system', highlighted: true },
      { name: 'Full lighting production', quantity: 1, unit: 'set', description: 'Complete stage and dance floor lighting', highlighted: true },
      { name: 'Wireless microphones', quantity: 6, unit: 'pieces', description: 'Multiple mics for all program needs' },
      { name: 'Special song arrangements', quantity: 3, unit: 'songs', description: 'Custom arrangements for special songs' },
      { name: 'Full-day coverage', quantity: 1, unit: 'service', description: 'Music from ceremony to send-off' }
    ]
  }
};

// Add more categories as needed...

// =====================================================
// MIGRATION FUNCTIONS
// =====================================================

async function migratePackages(categoryName, packages) {
  console.log(`\n🔄 Migrating ${categoryName} packages...`);
  
  try {
    // 1. Get category ID
    const categoryResult = await sql`
      SELECT id, name, display_name 
      FROM categories 
      WHERE LOWER(name) = LOWER(${categoryName}) 
      LIMIT 1
    `;
    
    if (categoryResult.length === 0) {
      console.log(`⚠️  Category '${categoryName}' not found. Skipping...`);
      return;
    }
    
    const categoryId = categoryResult[0].id;
    console.log(`✅ Found category: ${categoryResult[0].display_name} (${categoryId})`);
    
    // 2. Insert pricing templates
    for (const [tierName, tierData] of Object.entries(packages)) {
      console.log(`  📦 Inserting ${tierData.label}...`);
      
      // Insert template
      const templateResult = await sql`
        INSERT INTO pricing_templates (
          category_id, tier_name, tier_label, base_price, description
        ) VALUES (
          ${categoryId}, 
          ${tierName}, 
          ${tierData.label}, 
          ${tierData.price}, 
          ${tierData.description}
        )
        ON CONFLICT (category_id, tier_name) 
        DO UPDATE SET 
          tier_label = EXCLUDED.tier_label,
          base_price = EXCLUDED.base_price,
          description = EXCLUDED.description,
          updated_at = NOW()
        RETURNING id
      `;
      
      const templateId = templateResult[0].id;
      
      // 3. Insert package inclusions
      for (const [index, inclusion] of tierData.inclusions.entries()) {
        await sql`
          INSERT INTO package_inclusions (
            template_id, item_name, quantity, unit, description, 
            is_highlighted, sort_order
          ) VALUES (
            ${templateId},
            ${inclusion.name},
            ${inclusion.quantity},
            ${inclusion.unit},
            ${inclusion.description || null},
            ${inclusion.highlighted || false},
            ${index + 1}
          )
        `;
      }
      
      console.log(`    ✅ Inserted ${tierData.inclusions.length} inclusions`);
    }
    
    console.log(`✅ ${categoryName} migration complete!`);
  } catch (error) {
    console.error(`❌ Error migrating ${categoryName}:`, error.message);
  }
}

// =====================================================
// MAIN MIGRATION RUNNER
// =====================================================

async function runMigration() {
  console.log('🚀 Starting pricing templates migration...\n');
  console.log('📊 Target Database:', process.env.DATABASE_URL ? 'Connected' : 'NOT CONFIGURED');
  
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ DATABASE_URL not found in environment variables!');
    console.error('Please set DATABASE_URL in your .env file or environment.');
    process.exit(1);
  }
  
  try {
    // Test database connection
    await sql`SELECT NOW()`;
    console.log('✅ Database connection successful\n');
    
    // Run migrations for each category
    await migratePackages('photography', PHOTOGRAPHY_PACKAGES);
    await migratePackages('catering', CATERING_PACKAGES);
    await migratePackages('venue', VENUE_PACKAGES);
    await migratePackages('music', MUSIC_PACKAGES);
    
    // Add more categories as implemented...
    
    console.log('\n\n🎉 Migration completed successfully!');
    console.log('\n📋 Summary:');
    
    const summary = await sql`
      SELECT 
        c.display_name as category,
        COUNT(pt.id) as template_count,
        MIN(pt.base_price) as min_price,
        MAX(pt.base_price) as max_price
      FROM categories c
      LEFT JOIN pricing_templates pt ON c.id = pt.category_id
      WHERE pt.id IS NOT NULL
      GROUP BY c.id, c.display_name
      ORDER BY c.display_name
    `;
    
    console.table(summary);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run migration if executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n✅ All done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
