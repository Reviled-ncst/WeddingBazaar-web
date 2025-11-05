const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * Comprehensive service population across ALL 15 categories
 * Each category gets at least 3 services from real vendors
 * Location: Dasmariñas City, Cavite, Philippines only
 */

// Comprehensive service templates for ALL 15 categories
const serviceTemplatesByCategory = {
  'Photography': [
    {
      title: 'Wedding Day Full Coverage',
      description: 'Complete photography coverage for your Dasmariñas wedding. Includes pre-ceremony, ceremony, reception, and candid moments.',
      price_range: '₱35,000 - ₱80,000',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']
    },
    {
      title: 'Pre-Wedding Photoshoot Cavite',
      description: 'Romantic pre-wedding photoshoot at scenic Cavite locations. Perfect for save-the-dates.',
      price_range: '₱15,000 - ₱35,000',
      images: ['https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800']
    },
    {
      title: 'Same Day Edit Video',
      description: 'Cinematic same-day edit video for your Dasmariñas reception.',
      price_range: '₱25,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800']
    }
  ],
  'Planning': [
    {
      title: 'Full Wedding Planning Package',
      description: 'Complete wedding planning from concept to execution in Dasmariñas City.',
      price_range: '₱80,000 - ₱200,000',
      images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800']
    },
    {
      title: 'Day-of Coordination Service',
      description: 'Professional coordination on your Cavite wedding day to ensure everything runs smoothly.',
      price_range: '₱25,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800']
    },
    {
      title: 'Partial Planning Service',
      description: 'Assistance with specific aspects of your Dasmariñas wedding planning.',
      price_range: '₱40,000 - ₱100,000',
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']
    }
  ],
  'Florist': [
    {
      title: 'Bridal Bouquet & Arrangements',
      description: 'Stunning bridal bouquet and floral arrangements for your Dasmariñas wedding.',
      price_range: '₱15,000 - ₱40,000',
      images: ['https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800']
    },
    {
      title: 'Ceremony Floral Decoration',
      description: 'Complete floral decoration for church and venue in Cavite.',
      price_range: '₱40,000 - ₱100,000',
      images: ['https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800']
    },
    {
      title: 'Reception Centerpieces Package',
      description: 'Beautiful table centerpieces for your Dasmariñas reception.',
      price_range: '₱20,000 - ₱60,000',
      images: ['https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800']
    }
  ],
  'Beauty': [
    {
      title: 'Bridal Hair & Makeup',
      description: 'Professional bridal hair and makeup services for Dasmariñas weddings. Includes trial.',
      price_range: '₱15,000 - ₱35,000',
      images: ['https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800']
    },
    {
      title: 'Bridal Party Makeup',
      description: 'Hair and makeup for entire bridal party in Cavite.',
      price_range: '₱25,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800']
    },
    {
      title: 'Pre-Wedding Beauty Service',
      description: 'Beauty package for engagement photos and pre-wedding events.',
      price_range: '₱8,000 - ₱20,000',
      images: ['https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800']
    }
  ],
  'Catering': [
    {
      title: 'Premium Filipino Buffet',
      description: 'Luxurious Filipino buffet for Dasmariñas weddings with authentic local flavors.',
      price_range: '₱800 - ₱1,500 per person',
      images: ['https://images.unsplash.com/photo-1555244162-803834f70033?w=800']
    },
    {
      title: 'Cocktail Reception Package',
      description: 'Elegant cocktail-style reception for intimate Cavite gatherings.',
      price_range: '₱600 - ₱1,000 per person',
      images: ['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800']
    },
    {
      title: 'Plated Dinner Service',
      description: 'Sophisticated plated dinner for formal Dasmariñas receptions.',
      price_range: '₱1,200 - ₱2,500 per person',
      images: ['https://images.unsplash.com/photo-1544025162-d76694265947?w=800']
    }
  ],
  'Music': [
    {
      title: 'Professional DJ Services',
      description: 'Experienced DJ for your Dasmariñas wedding with extensive music library.',
      price_range: '₱15,000 - ₱30,000',
      images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800']
    },
    {
      title: 'Live Band Performance',
      description: 'Professional live band for Cavite weddings. Versatile repertoire.',
      price_range: '₱35,000 - ₱80,000',
      images: ['https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800']
    },
    {
      title: 'Acoustic Duo for Ceremony',
      description: 'Intimate acoustic performance for ceremony in Dasmariñas.',
      price_range: '₱10,000 - ₱25,000',
      images: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800']
    }
  ],
  'Officiant': [
    {
      title: 'Wedding Ceremony Officiant',
      description: 'Professional officiant for your Dasmariñas wedding ceremony.',
      price_range: '₱5,000 - ₱15,000',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']
    },
    {
      title: 'Non-Religious Ceremony Service',
      description: 'Personalized non-religious ceremony in Cavite.',
      price_range: '₱8,000 - ₱20,000',
      images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800']
    },
    {
      title: 'Renewal of Vows Officiant',
      description: 'Special ceremony for vow renewals in Dasmariñas.',
      price_range: '₱6,000 - ₱18,000',
      images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800']
    }
  ],
  'Venue': [
    {
      title: 'Garden Wedding Venue',
      description: 'Beautiful outdoor garden setting in Dasmariñas City with lush greenery.',
      price_range: '₱80,000 - ₱150,000',
      images: ['https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800']
    },
    {
      title: 'Grand Ballroom Package',
      description: 'Elegant indoor ballroom in Cavite with crystal chandeliers.',
      price_range: '₱120,000 - ₱250,000',
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']
    },
    {
      title: 'Beachfront Venue Cavite',
      description: 'Stunning beachfront location near Dasmariñas for intimate weddings.',
      price_range: '₱100,000 - ₱200,000',
      images: ['https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800']
    }
  ],
  'Rentals': [
    {
      title: 'Complete Event Furniture Rental',
      description: 'Comprehensive furniture rental for Dasmariñas weddings. Chairs, tables, tents.',
      price_range: '₱30,000 - ₱80,000',
      images: ['https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800']
    },
    {
      title: 'Elegant Chair & Table Package',
      description: 'Premium seating and tables for Cavite receptions.',
      price_range: '₱20,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']
    },
    {
      title: 'Tent & Canopy Rental',
      description: 'Weather protection tents and canopies for outdoor Dasmariñas events.',
      price_range: '₱25,000 - ₱60,000',
      images: ['https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800']
    }
  ],
  'Cake': [
    {
      title: 'Custom Wedding Cake Design',
      description: 'Beautifully designed custom wedding cakes for Cavite weddings.',
      price_range: '₱8,000 - ₱25,000',
      images: ['https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800']
    },
    {
      title: 'Multi-Tier Wedding Cake',
      description: 'Stunning multi-tier cakes for grand Dasmariñas receptions.',
      price_range: '₱15,000 - ₱40,000',
      images: ['https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800']
    },
    {
      title: 'Dessert Table Package',
      description: 'Complete dessert table with cake and assorted sweets for Cavite weddings.',
      price_range: '₱20,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800']
    }
  ],
  'Fashion': [
    {
      title: 'Custom Wedding Gown Design',
      description: 'Bespoke wedding gown design and tailoring for Dasmariñas brides.',
      price_range: '₱50,000 - ₱150,000',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']
    },
    {
      title: 'Groom Suit Tailoring',
      description: 'Custom-fit suits and barongs for Cavite grooms.',
      price_range: '₱20,000 - ₱60,000',
      images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800']
    },
    {
      title: 'Bridal Party Dress Coordination',
      description: 'Coordinated dresses for entire bridal party in Dasmariñas.',
      price_range: '₱30,000 - ₱80,000',
      images: ['https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800']
    }
  ],
  'Security': [
    {
      title: 'Wedding Security Services',
      description: 'Professional security for your Dasmariñas wedding venue.',
      price_range: '₱10,000 - ₱30,000',
      images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800']
    },
    {
      title: 'Guest Management Service',
      description: 'Comprehensive guest coordination and management for Cavite events.',
      price_range: '₱15,000 - ₱40,000',
      images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800']
    },
    {
      title: 'Valet Parking Service',
      description: 'Professional valet parking for wedding guests in Dasmariñas.',
      price_range: '₱12,000 - ₱35,000',
      images: ['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800']
    }
  ],
  'AV_Equipment': [
    {
      title: 'Complete Sounds & Lights Package',
      description: 'Professional audio and lighting equipment for Dasmariñas weddings.',
      price_range: '₱20,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800']
    },
    {
      title: 'LED Wall & Projection Service',
      description: 'LED walls and projectors for Cavite reception presentations.',
      price_range: '₱30,000 - ₱80,000',
      images: ['https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800']
    },
    {
      title: 'Stage Lighting Design',
      description: 'Custom stage lighting design for Dasmariñas wedding venues.',
      price_range: '₱25,000 - ₱60,000',
      images: ['https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800']
    }
  ],
  'Stationery': [
    {
      title: 'Wedding Invitation Design',
      description: 'Custom wedding invitations for Dasmariñas couples.',
      price_range: '₱8,000 - ₱25,000',
      images: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800']
    },
    {
      title: 'Complete Stationery Package',
      description: 'Full stationery suite including invites, programs, menus for Cavite weddings.',
      price_range: '₱15,000 - ₱40,000',
      images: ['https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800']
    },
    {
      title: 'Save the Date Cards',
      description: 'Creative save-the-date cards for Dasmariñas weddings.',
      price_range: '₱5,000 - ₱15,000',
      images: ['https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800']
    }
  ],
  'Transport': [
    {
      title: 'Luxury Wedding Car Service',
      description: 'Luxury wedding car rental with professional chauffeur in Dasmariñas.',
      price_range: '₱15,000 - ₱40,000',
      images: ['https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800']
    },
    {
      title: 'Guest Transportation Service',
      description: 'Shuttle service for wedding guests in Cavite.',
      price_range: '₱25,000 - ₱60,000',
      images: ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800']
    },
    {
      title: 'Classic Car Rental',
      description: 'Vintage classic cars for Dasmariñas wedding photography.',
      price_range: '₱20,000 - ₱50,000',
      images: ['https://images.unsplash.com/photo-1494905998402-395d579af36f?w=800']
    }
  ]
};

async function populateServicesAcrossAllCategories() {
  console.log('🎯 Populating services across ALL 15 categories...\n');
  console.log('📍 Location: Dasmariñas City, Cavite, Philippines\n');

  try {
    // Step 1: Get all categories
    console.log('📋 Step 1: Fetching service categories...');
    const categories = await sql`
      SELECT id, name, display_name
      FROM service_categories
      WHERE is_active = true
      ORDER BY sort_order
    `;
    
    console.log(`✅ Found ${categories.length} categories\n`);

    // Step 2: Get all vendors
    console.log('👥 Step 2: Fetching vendors...');
    const vendors = await sql`
      SELECT id, business_name
      FROM vendors
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${vendors.length} vendors\n`);

    // Step 3: Get max service counter and delete inactive services without bookings
    console.log('📊 Step 3: Checking existing services...');
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
      console.log(`   Last service ID: ${lastId}, continuing from ${serviceCounter + 1}`);
    }
    
    // Delete old test services that don't have bookings
    await sql`
      DELETE FROM services 
      WHERE id LIKE 'SRV-%' 
      AND id NOT IN (SELECT DISTINCT service_id FROM bookings WHERE service_id IS NOT NULL)
    `;
    console.log('✅ Cleaned up old services without bookings\n');

    // Step 4: Create services for EACH category
    console.log('📝 Step 4: Creating 3 services per category across all vendors...\n');
    
    const location = 'Dasmariñas City, Cavite, Philippines';
    let servicesCreated = 0;

    // For each category, create services using vendors in round-robin
    for (const category of categories) {
      const templates = serviceTemplatesByCategory[category.name];
      
      if (!templates || templates.length === 0) {
        console.log(`⚠️  No templates for ${category.display_name}, skipping...`);
        continue;
      }

      console.log(`\n📦 Category: ${category.display_name}`);
      console.log(`   Creating ${templates.length} services...`);

      // Assign vendors in round-robin for this category
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const vendor = vendors[i % vendors.length]; // Round-robin vendor selection

        try {
          serviceCounter++;
          const serviceId = `SRV-${String(serviceCounter).padStart(5, '0')}`;

          await sql`
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
              ${category.name},
              ${template.description},
              ${template.price_range},
              ${`{${template.images.join(',')}}`}::text[],
              ${location},
              5,
              ${'{}'}::jsonb,
              true,
              NOW(),
              NOW()
            )
          `;

          servicesCreated++;
          console.log(`   ✅ ${template.title} (${vendor.business_name})`);

        } catch (error) {
          console.error(`   ❌ Error:`, error.message);
        }
      }
    }

    console.log('\n\n✅ Population Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Vendors: ${vendors.length}`);
    console.log(`   - Services created: ${servicesCreated}`);
    console.log(`   - Average per category: ${(servicesCreated / categories.length).toFixed(1)}`);
    console.log(`   - Location: Dasmariñas City, Cavite, Philippines`);
    
    // Show breakdown by category
    console.log('\n📊 Services by Category:');
    const breakdown = await sql`
      SELECT category, COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `;
    console.table(breakdown);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

populateServicesAcrossAllCategories();
