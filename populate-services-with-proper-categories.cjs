const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * Repopulate services using proper categories from service_categories table
 * Location: Dasmariñas City, Cavite, Philippines only
 */

// Service templates by category
const serviceTemplatesByCategory = {
  'Photography': [
    {
      title: 'Wedding Day Coverage Package',
      description: 'Full day photography coverage capturing every special moment of your wedding in Dasmariñas. Includes pre-ceremony preparations, ceremony, reception, and candid moments throughout the day.',
      price_range: '₱35,000 - ₱80,000',
      images: [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800',
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
      ]
    },
    {
      title: 'Pre-Wedding Photoshoot in Cavite',
      description: 'Romantic and creative engagement or pre-wedding photoshoot at scenic locations in Dasmariñas and nearby Cavite areas. Perfect for save-the-dates and wedding invitations.',
      price_range: '₱15,000 - ₱35,000',
      images: [
        'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800',
        'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=800'
      ]
    },
    {
      title: 'Same Day Edit Video',
      description: 'Cinematic same-day edit video that captures the highlights of your Dasmariñas wedding day, ready to be shown at your reception.',
      price_range: '₱25,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
        'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800'
      ]
    }
  ],
  'Catering': [
    {
      title: 'Premium Filipino Buffet Package',
      description: 'Luxurious buffet setup featuring authentic Filipino cuisines perfect for Cavite weddings. Includes appetizers, main courses, desserts, and beverage station.',
      price_range: '₱800 - ₱1,500 per person',
      images: [
        'https://images.unsplash.com/photo-1555244162-803834f70033?w=800',
        'https://images.unsplash.com/photo-1519671845924-1fd18db430b8?w=800'
      ]
    },
    {
      title: 'Cocktail Reception Package',
      description: 'Elegant cocktail-style reception with passed hors d\'oeuvres and stationed appetizers. Perfect for intimate Dasmariñas gatherings.',
      price_range: '₱600 - ₱1,000 per person',
      images: [
        'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'
      ]
    }
  ],
  'Venue': [
    {
      title: 'Garden Wedding Venue Dasmariñas',
      description: 'Beautiful outdoor garden setting in the heart of Dasmariñas City with lush greenery and romantic ambiance. Perfect for ceremonies and receptions.',
      price_range: '₱80,000 - ₱150,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800',
        'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800'
      ]
    },
    {
      title: 'Grand Ballroom Cavite',
      description: 'Elegant indoor ballroom in Dasmariñas with crystal chandeliers and sophisticated decor. Climate-controlled comfort for your special day.',
      price_range: '₱120,000 - ₱250,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800'
      ]
    }
  ],
  'Music': [
    {
      title: 'Professional DJ Services',
      description: 'Experienced DJ for your Dasmariñas wedding with extensive music library and professional sound equipment.',
      price_range: '₱15,000 - ₱30,000',
      images: [
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
      ]
    },
    {
      title: 'Live Band Performance',
      description: 'Professional live band for weddings in Cavite. Versatile repertoire from classical to modern hits.',
      price_range: '₱35,000 - ₱80,000',
      images: [
        'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800'
      ]
    }
  ],
  'Florist': [
    {
      title: 'Bridal Bouquet & Arrangements',
      description: 'Stunning bridal bouquet and floral arrangements for your Dasmariñas wedding. Fresh flowers sourced locally.',
      price_range: '₱15,000 - ₱40,000',
      images: [
        'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800'
      ]
    },
    {
      title: 'Venue Floral Decoration',
      description: 'Complete floral decoration for ceremony and reception venues in Cavite. Includes centerpieces and aisle arrangements.',
      price_range: '₱40,000 - ₱100,000',
      images: [
        'https://images.unsplash.com/photo-1519167758481-83f29da8c3f0?w=800'
      ]
    }
  ],
  'Planning': [
    {
      title: 'Full Wedding Planning Services',
      description: 'Comprehensive wedding planning and coordination for Dasmariñas weddings. From concept to execution.',
      price_range: '₱80,000 - ₱200,000',
      images: [
        'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800'
      ]
    },
    {
      title: 'Day-of Coordination',
      description: 'Professional day-of coordination to ensure your Cavite wedding runs smoothly.',
      price_range: '₱25,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'
      ]
    }
  ],
  'Beauty': [
    {
      title: 'Bridal Hair & Makeup',
      description: 'Professional bridal hair and makeup services for your Dasmariñas wedding. Includes trial session.',
      price_range: '₱15,000 - ₱35,000',
      images: [
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800'
      ]
    }
  ],
  'Cake': [
    {
      title: 'Custom Wedding Cake',
      description: 'Beautifully designed custom wedding cakes for Cavite weddings. Multiple tiers and flavors available.',
      price_range: '₱8,000 - ₱25,000',
      images: [
        'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800'
      ]
    }
  ],
  'Rentals': [
    {
      title: 'Complete Event Furniture Rental',
      description: 'Comprehensive furniture rental for weddings in Dasmariñas. Chairs, tables, tents, and more.',
      price_range: '₱30,000 - ₱80,000',
      images: [
        'https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800'
      ]
    }
  ],
  'AV_Equipment': [
    {
      title: 'Sounds & Lights Package',
      description: 'Professional audio and lighting equipment for Cavite weddings. Complete setup and technical support.',
      price_range: '₱20,000 - ₱50,000',
      images: [
        'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
      ]
    }
  ],
  'Transport': [
    {
      title: 'Wedding Car Service',
      description: 'Luxury wedding car rental for Dasmariñas couples. Professional chauffeur included.',
      price_range: '₱15,000 - ₱40,000',
      images: [
        'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800'
      ]
    }
  ]
};

async function repopulateServicesWithProperCategories() {
  console.log('🎯 Repopulating services with proper categories from database...\n');
  console.log('📍 Location: Dasmariñas City, Cavite, Philippines\n');

  try {
    // Step 1: Get all categories from database
    console.log('📋 Step 1: Fetching service categories...');
    const categories = await sql`
      SELECT id, name, display_name, description
      FROM service_categories
      WHERE is_active = true
      ORDER BY sort_order
    `;
    
    console.log(`✅ Found ${categories.length} categories\n`);
    console.table(categories.map(c => ({ id: c.id, name: c.name, display: c.display_name })));

    // Step 2: Get all vendors
    console.log('\n👥 Step 2: Fetching vendors...');
    const vendors = await sql`
      SELECT id, business_name, business_type
      FROM vendors
      ORDER BY created_at DESC
    `;
    
    console.log(`✅ Found ${vendors.length} vendors\n`);

    // Step 3: Get existing services count
    console.log('� Step 3: Checking existing services...');
    const existingServices = await sql`SELECT COUNT(*) as count FROM services`;
    console.log(`   Found ${existingServices[0].count} existing services\n`);

    // Step 4: Update existing services and create new ones
    console.log('📝 Step 4: Updating/creating services with proper categories...\n');
    
    const location = 'Dasmariñas City, Cavite, Philippines';
    
    // Get max service counter
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
    }
    
    let servicesCreated = 0;
    let servicesUpdated = 0;

    for (const vendor of vendors) {
      console.log(`\n🏢 Vendor: ${vendor.business_name}`);
      
      // Match vendor business_type to category
      let vendorCategory = null;
      for (const cat of categories) {
        if (vendor.business_type && vendor.business_type.toLowerCase().includes(cat.name.toLowerCase())) {
          vendorCategory = cat;
          break;
        }
      }

      // If no match, assign based on templates availability
      if (!vendorCategory) {
        for (const cat of categories) {
          if (serviceTemplatesByCategory[cat.name]) {
            vendorCategory = cat;
            break;
          }
        }
      }

      if (!vendorCategory) {
        console.log(`   ⚠️  No matching category found, skipping...`);
        continue;
      }

      const templates = serviceTemplatesByCategory[vendorCategory.name] || [];
      
      if (templates.length === 0) {
        console.log(`   ⚠️  No templates for category ${vendorCategory.name}, skipping...`);
        continue;
      }

      console.log(`   Category: ${vendorCategory.display_name}`);
      console.log(`   Creating ${templates.length} services...`);

      // Check if vendor already has services
      const existingVendorServices = await sql`
        SELECT id, title FROM services WHERE vendor_id = ${vendor.id}
      `;

      if (existingVendorServices.length > 0) {
        // Update existing services with proper category
        for (const service of existingVendorServices) {
          await sql`
            UPDATE services
            SET category = ${vendorCategory.name},
                location = ${location},
                updated_at = NOW()
            WHERE id = ${service.id}
          `;
          servicesUpdated++;
          console.log(`   ✏️  Updated: ${service.title} → ${vendorCategory.display_name}`);
        }
      } else {
        // Create new services
        for (const template of templates) {
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
                ${vendorCategory.name},
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
            console.log(`   ✅ Created: ${template.title}`);

          } catch (error) {
            console.error(`   ❌ Error:`, error.message);
          }
        }
      }
    }

    console.log('\n\n✅ Update Complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Vendors: ${vendors.length}`);
    console.log(`   - Services updated: ${servicesUpdated}`);
    console.log(`   - Services created: ${servicesCreated}`);
    console.log(`   - Location: Dasmariñas City, Cavite, Philippines`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

repopulateServicesWithProperCategories();
