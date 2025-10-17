const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createCategoriesTables() {
  try {
    console.log('🔌 Connecting to database using Neon serverless...\n');

    // 1. Create service_categories table
    console.log('📊 Creating service_categories table...\n');
    
    await sql`
      CREATE TABLE IF NOT EXISTS service_categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ service_categories table created successfully\n');

    // 2. Create service_subcategories table
    console.log('📊 Creating service_subcategories table...\n');
    
    await sql`
      CREATE TABLE IF NOT EXISTS service_subcategories (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50) NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        description TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(category_id, name)
      )
    `;
    
    console.log('✅ service_subcategories table created successfully\n');

    // 3. Create service_features table
    console.log('📊 Creating service_features table...\n');
    
    await sql`
      CREATE TABLE IF NOT EXISTS service_features (
        id VARCHAR(50) PRIMARY KEY,
        category_id VARCHAR(50) REFERENCES service_categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        icon VARCHAR(100),
        is_common BOOLEAN DEFAULT false,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ service_features table created successfully\n');

    // 4. Create price_ranges table
    console.log('📊 Creating price_ranges table...\n');
    
    await sql`
      CREATE TABLE IF NOT EXISTS price_ranges (
        id VARCHAR(50) PRIMARY KEY,
        range_text VARCHAR(100) NOT NULL UNIQUE,
        label VARCHAR(100) NOT NULL,
        description TEXT,
        min_amount DECIMAL(10,2),
        max_amount DECIMAL(10,2),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ price_ranges table created successfully\n');

    // 5. Add indexes for performance
    console.log('📊 Creating indexes...\n');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_service_categories_name ON service_categories(name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_categories_active ON service_categories(is_active)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_subcategories_category ON service_subcategories(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_features_category ON service_features(category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_features_common ON service_features(is_common)`;
    
    console.log('✅ Indexes created successfully\n');

    // 6. Seed service categories
    console.log('📝 Seeding service categories...\n');
    
    const categories = [
      { id: 'CAT-001', name: 'Photography', display_name: 'Photographer & Videographer', description: 'Professional photography and videography services for your wedding', icon: 'Camera', sort_order: 1 },
      { id: 'CAT-002', name: 'Planning', display_name: 'Wedding Planner', description: 'Expert wedding planning and coordination services', icon: 'Calendar', sort_order: 2 },
      { id: 'CAT-003', name: 'Florist', display_name: 'Florist', description: 'Beautiful floral arrangements and decorations', icon: 'Flower', sort_order: 3 },
      { id: 'CAT-004', name: 'Beauty', display_name: 'Hair & Makeup Artists', description: 'Professional hair styling and makeup services', icon: 'Sparkles', sort_order: 4 },
      { id: 'CAT-005', name: 'Catering', display_name: 'Caterer', description: 'Delicious catering services for your wedding', icon: 'Utensils', sort_order: 5 },
      { id: 'CAT-006', name: 'Music', display_name: 'DJ/Band', description: 'Live music and DJ services for entertainment', icon: 'Music', sort_order: 6 },
      { id: 'CAT-007', name: 'Officiant', display_name: 'Officiant', description: 'Professional wedding officiants and ceremonies', icon: 'Users', sort_order: 7 },
      { id: 'CAT-008', name: 'Venue', display_name: 'Venue Coordinator', description: 'Venue coordination and management services', icon: 'Building', sort_order: 8 },
      { id: 'CAT-009', name: 'Rentals', display_name: 'Event Rentals', description: 'Equipment and furniture rentals for events', icon: 'Package', sort_order: 9 },
      { id: 'CAT-010', name: 'Cake', display_name: 'Cake Designer', description: 'Custom wedding cakes and desserts', icon: 'Cake', sort_order: 10 },
      { id: 'CAT-011', name: 'Fashion', display_name: 'Dress Designer/Tailor', description: 'Wedding dress design and tailoring services', icon: 'Shirt', sort_order: 11 },
      { id: 'CAT-012', name: 'Security', display_name: 'Security & Guest Management', description: 'Security and guest management services', icon: 'Shield', sort_order: 12 },
      { id: 'CAT-013', name: 'AV_Equipment', display_name: 'Sounds & Lights', description: 'Audio and visual equipment services', icon: 'Lightbulb', sort_order: 13 },
      { id: 'CAT-014', name: 'Stationery', display_name: 'Stationery Designer', description: 'Wedding invitations and stationery design', icon: 'FileText', sort_order: 14 },
      { id: 'CAT-015', name: 'Transport', display_name: 'Transportation Services', description: 'Wedding transportation and logistics', icon: 'Car', sort_order: 15 }
    ];

    for (const cat of categories) {
      await sql`
        INSERT INTO service_categories (id, name, display_name, description, icon, sort_order, is_active)
        VALUES (${cat.id}, ${cat.name}, ${cat.display_name}, ${cat.description}, ${cat.icon}, ${cat.sort_order}, true)
        ON CONFLICT (id) DO UPDATE SET
          display_name = EXCLUDED.display_name,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          sort_order = EXCLUDED.sort_order
      `;
    }

    console.log(`✅ Inserted ${categories.length} categories successfully\n`);

    // 7. Seed common features
    console.log('📝 Seeding common service features...\n');
    
    const features = [
      // Photography features
      { id: 'FT-001', category_id: 'CAT-001', name: 'DSLR Camera with 24-70mm lens', icon: 'Camera', is_common: true },
      { id: 'FT-002', category_id: 'CAT-001', name: 'Prime lens 50mm f/1.4', icon: 'Camera', is_common: true },
      { id: 'FT-003', category_id: 'CAT-001', name: 'Professional flash with diffuser', icon: 'Zap', is_common: true },
      { id: 'FT-004', category_id: 'CAT-001', name: 'LED continuous lighting kit', icon: 'Lightbulb', is_common: true },
      { id: 'FT-005', category_id: 'CAT-001', name: 'Drone with 4K camera', icon: 'Radio', is_common: false },
      
      // Planning features
      { id: 'FT-006', category_id: 'CAT-002', name: 'Wedding timeline and checklist', icon: 'Calendar', is_common: true },
      { id: 'FT-007', category_id: 'CAT-002', name: 'Vendor coordination services', icon: 'Users', is_common: true },
      { id: 'FT-008', category_id: 'CAT-002', name: 'Day-of coordination', icon: 'Clock', is_common: true },
      { id: 'FT-009', category_id: 'CAT-002', name: 'Budget tracking', icon: 'DollarSign', is_common: true },
      
      // Catering features
      { id: 'FT-010', category_id: 'CAT-005', name: 'Chafing dishes and food warmers', icon: 'Utensils', is_common: true },
      { id: 'FT-011', category_id: 'CAT-005', name: 'Professional serving staff', icon: 'Users', is_common: true },
      { id: 'FT-012', category_id: 'CAT-005', name: 'Table linens and napkins', icon: 'Package', is_common: true },
      { id: 'FT-013', category_id: 'CAT-005', name: 'Bar setup and bartender', icon: 'Wine', is_common: false },
      
      // Florist features
      { id: 'FT-014', category_id: 'CAT-003', name: 'Bridal bouquet (seasonal flowers)', icon: 'Flower', is_common: true },
      { id: 'FT-015', category_id: 'CAT-003', name: 'Ceremony arch with fresh flowers', icon: 'Heart', is_common: true },
      { id: 'FT-016', category_id: 'CAT-003', name: 'Reception centerpieces', icon: 'Sparkles', is_common: true },
      { id: 'FT-017', category_id: 'CAT-003', name: 'Delivery and setup service', icon: 'Truck', is_common: true },
      
      // Beauty features
      { id: 'FT-018', category_id: 'CAT-004', name: 'Bridal makeup application', icon: 'Sparkles', is_common: true },
      { id: 'FT-019', category_id: 'CAT-004', name: 'Hair styling and updo', icon: 'Scissors', is_common: true },
      { id: 'FT-020', category_id: 'CAT-004', name: 'Touch-up kit for the day', icon: 'Package', is_common: true },
      { id: 'FT-021', category_id: 'CAT-004', name: 'Trial session (2 hours)', icon: 'Clock', is_common: true },
      
      // Music features
      { id: 'FT-022', category_id: 'CAT-006', name: 'Professional DJ mixing console', icon: 'Music', is_common: true },
      { id: 'FT-023', category_id: 'CAT-006', name: 'Speakers and amplification system', icon: 'Volume2', is_common: true },
      { id: 'FT-024', category_id: 'CAT-006', name: 'Wireless microphones (2 units)', icon: 'Mic', is_common: true },
      { id: 'FT-025', category_id: 'CAT-006', name: 'MC services throughout event', icon: 'MessageCircle', is_common: false }
    ];

    for (const feature of features) {
      await sql`
        INSERT INTO service_features (id, category_id, name, icon, is_common)
        VALUES (${feature.id}, ${feature.category_id}, ${feature.name}, ${feature.icon}, ${feature.is_common})
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          icon = EXCLUDED.icon,
          is_common = EXCLUDED.is_common
      `;
    }

    console.log(`✅ Inserted ${features.length} features successfully\n`);

    // 8. Seed price ranges
    console.log('📝 Seeding price ranges...\n');
    
    const priceRanges = [
      { id: 'PR-001', range_text: '₱10,000 - ₱25,000', label: 'Budget Friendly', description: 'Affordable options for couples on a tight budget', min_amount: 10000, max_amount: 25000, sort_order: 1 },
      { id: 'PR-002', range_text: '₱25,000 - ₱75,000', label: 'Moderate', description: 'Mid-range services with good value', min_amount: 25000, max_amount: 75000, sort_order: 2 },
      { id: 'PR-003', range_text: '₱75,000 - ₱150,000', label: 'Premium', description: 'High-quality services with premium features', min_amount: 75000, max_amount: 150000, sort_order: 3 },
      { id: 'PR-004', range_text: '₱150,000+', label: 'Luxury', description: 'Exclusive, top-tier services', min_amount: 150000, max_amount: null, sort_order: 4 }
    ];

    for (const range of priceRanges) {
      await sql`
        INSERT INTO price_ranges (id, range_text, label, description, min_amount, max_amount, sort_order)
        VALUES (${range.id}, ${range.range_text}, ${range.label}, ${range.description}, ${range.min_amount}, ${range.max_amount}, ${range.sort_order})
        ON CONFLICT (range_text) DO UPDATE SET
          label = EXCLUDED.label,
          description = EXCLUDED.description,
          min_amount = EXCLUDED.min_amount,
          max_amount = EXCLUDED.max_amount,
          sort_order = EXCLUDED.sort_order
      `;
    }

    console.log(`✅ Inserted ${priceRanges.length} price ranges successfully\n`);

    console.log('🎉 All tables created and seeded successfully!\n');

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createCategoriesTables()
  .then(() => {
    console.log('✅ Database setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  });
