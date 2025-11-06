#!/usr/bin/env node

/**
 * 📊 Itemized Pricing Migration Script
 * 
 * Creates the service_pricing_items table and adds pricing_mode to services table
 * 
 * Run: node create-itemized-pricing-tables.cjs
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createItemizedPricingSchema() {
  console.log('🚀 Starting itemized pricing migration...\n');

  try {
    // ========================================
    // Step 1: Create service_pricing_items table
    // ========================================
    console.log('📋 Step 1: Creating service_pricing_items table...');
    
    await sql`
      CREATE TABLE IF NOT EXISTS service_pricing_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id UUID REFERENCES services(id) ON DELETE CASCADE,
        item_type VARCHAR(50) NOT NULL CHECK (item_type IN ('package', 'per_pax', 'addon', 'base')),
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
        min_quantity INTEGER DEFAULT 1 CHECK (min_quantity > 0),
        max_quantity INTEGER CHECK (max_quantity IS NULL OR max_quantity >= min_quantity),
        is_required BOOLEAN DEFAULT FALSE,
        display_order INTEGER DEFAULT 0,
        inclusions TEXT[],
        exclusions TEXT[],
        metadata JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    console.log('✅ service_pricing_items table created\n');

    // ========================================
    // Step 2: Create indexes for performance
    // ========================================
    console.log('📋 Step 2: Creating indexes...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_items_service ON service_pricing_items(service_id)`;
    console.log('  ✓ Index on service_id');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_items_type ON service_pricing_items(item_type)`;
    console.log('  ✓ Index on item_type');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_items_active ON service_pricing_items(is_active)`;
    console.log('  ✓ Index on is_active');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_items_order ON service_pricing_items(display_order)`;
    console.log('  ✓ Index on display_order\n');

    // ========================================
    // Step 3: Create trigger for updated_at
    // ========================================
    console.log('📋 Step 3: Creating update trigger...');
    
    await sql`
      CREATE OR REPLACE FUNCTION update_pricing_items_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;
    
    await sql`
      DROP TRIGGER IF EXISTS pricing_items_updated ON service_pricing_items
    `;
    
    await sql`
      CREATE TRIGGER pricing_items_updated
        BEFORE UPDATE ON service_pricing_items
        FOR EACH ROW
        EXECUTE FUNCTION update_pricing_items_timestamp()
    `;
    
    console.log('✅ Update trigger created\n');

    // ========================================
    // Step 4: Add pricing_mode to services table
    // ========================================
    console.log('📋 Step 4: Adding pricing_mode to services table...');
    
    await sql`
      ALTER TABLE services 
      ADD COLUMN IF NOT EXISTS pricing_mode VARCHAR(50) DEFAULT 'simple' 
      CHECK (pricing_mode IN ('simple', 'itemized', 'custom'))
    `;
    
    await sql`
      ALTER TABLE services
      ADD COLUMN IF NOT EXISTS pricing_notes TEXT
    `;
    
    console.log('✅ pricing_mode and pricing_notes columns added\n');

    // ========================================
    // Step 5: Create index on pricing_mode
    // ========================================
    console.log('📋 Step 5: Creating index on pricing_mode...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_services_pricing_mode ON services(pricing_mode)`;
    
    console.log('✅ Index on pricing_mode created\n');

    // ========================================
    // Step 6: Insert sample pricing items (optional demo data)
    // ========================================
    console.log('📋 Step 6: Checking for existing services to add sample pricing...');
    
    const services = await sql`
      SELECT id, title, category, vendor_id
      FROM services
      LIMIT 1
    `;
    
    if (services.length > 0) {
      const sampleService = services[0];
      console.log(`\n  Found service: "${sampleService.title}" (${sampleService.category})`);
      console.log('  Adding sample pricing items...\n');
      
      // Sample Package 1: Bronze Package
      await sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, display_order, inclusions, is_active
        )
        VALUES (
          ${sampleService.id},
          'package',
          'Bronze Package',
          'Perfect for intimate weddings with essential services',
          50000,
          1,
          ARRAY['4 hours of service', 'Basic setup', 'Up to 50 guests', 'Standard equipment'],
          TRUE
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('  ✓ Bronze Package added');
      
      // Sample Package 2: Silver Package
      await sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, display_order, inclusions, is_active
        )
        VALUES (
          ${sampleService.id},
          'package',
          'Silver Package',
          'Ideal for medium-sized weddings with enhanced services',
          100000,
          2,
          ARRAY['6 hours of service', 'Premium setup', 'Up to 100 guests', 'Premium equipment', 'Complimentary consultation'],
          TRUE
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('  ✓ Silver Package added');
      
      // Sample Package 3: Gold Package
      await sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, display_order, inclusions, is_active
        )
        VALUES (
          ${sampleService.id},
          'package',
          'Gold Package',
          'Premium experience for large weddings with all-inclusive services',
          200000,
          3,
          ARRAY['8 hours of service', 'Luxury setup', 'Up to 200 guests', 'Luxury equipment', 'Dedicated coordinator', 'Complimentary trial session'],
          TRUE
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('  ✓ Gold Package added');
      
      // Sample Add-on 1: Extended Hours
      await sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, display_order, inclusions, is_active
        )
        VALUES (
          ${sampleService.id},
          'addon',
          'Extended Hours',
          'Add extra hours to your package',
          5000,
          4,
          ARRAY['Additional 1 hour of service', 'Same quality and equipment'],
          TRUE
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('  ✓ Extended Hours add-on added');
      
      // Sample Add-on 2: Premium Upgrade
      await sql`
        INSERT INTO service_pricing_items (
          service_id, item_type, item_name, description,
          price, display_order, inclusions, is_active
        )
        VALUES (
          ${sampleService.id},
          'addon',
          'Premium Equipment Upgrade',
          'Upgrade to our top-tier equipment',
          15000,
          5,
          ARRAY['Latest professional equipment', 'Enhanced quality', 'Priority support'],
          TRUE
        )
        ON CONFLICT DO NOTHING
      `;
      console.log('  ✓ Premium Equipment Upgrade add-on added');
      
      // Update service to itemized mode
      await sql`
        UPDATE services
        SET pricing_mode = 'itemized',
            pricing_notes = 'Multiple packages available. Contact us for custom quotes.'
        WHERE id = ${sampleService.id}
      `;
      console.log('  ✓ Service updated to itemized pricing mode\n');
      
      console.log('✅ Sample pricing items added successfully\n');
    } else {
      console.log('  ℹ️  No services found. Skipping sample data insertion.\n');
    }

    // ========================================
    // Step 7: Verify the schema
    // ========================================
    console.log('📋 Step 7: Verifying schema...\n');
    
    const tableInfo = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'service_pricing_items'
      ORDER BY ordinal_position
    `;
    
    console.log('  service_pricing_items columns:');
    tableInfo.forEach(col => {
      console.log(`    - ${col.column_name} (${col.data_type})`);
    });
    
    const servicesColumns = await sql`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'services'
        AND column_name IN ('pricing_mode', 'pricing_notes')
    `;
    
    console.log('\n  services table new columns:');
    servicesColumns.forEach(col => {
      console.log(`    - ${col.column_name} (${col.data_type})`);
    });
    
    const itemCount = await sql`SELECT COUNT(*) as count FROM service_pricing_items`;
    console.log(`\n  Total pricing items: ${itemCount[0].count}`);

    // ========================================
    // Success Summary
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('\n📊 Itemized Pricing Schema Created Successfully!\n');
    console.log('✓ service_pricing_items table created');
    console.log('✓ Indexes created for performance');
    console.log('✓ Update trigger configured');
    console.log('✓ pricing_mode and pricing_notes added to services');
    if (services.length > 0) {
      console.log(`✓ Sample pricing items added to "${services[0].title}"`);
    }
    console.log('\n📝 Next Steps:');
    console.log('  1. Update backend API to handle pricing_items');
    console.log('  2. Create frontend pricing components');
    console.log('  3. Test creating services with itemized pricing');
    console.log('  4. Deploy backend and frontend updates\n');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the migration
createItemizedPricingSchema()
  .then(() => {
    console.log('🎉 Migration script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Migration script failed:', error);
    process.exit(1);
  });
