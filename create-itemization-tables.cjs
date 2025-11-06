const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * ITEMIZATION DATABASE MIGRATION
 * 
 * Creates 4 new tables for proper itemization:
 * 1. service_packages - Package templates (Basic, Standard, Premium)
 * 2. package_items - Package contents (personnel, equipment, deliverables)
 * 3. service_addons - Optional add-ons
 * 4. service_pricing_rules - Dynamic pricing rules (per-pax, hourly, etc.)
 */

(async () => {
  try {
    console.log('🚀 Starting itemization database migration...\n');
    
    // ============================================================
    // TABLE 1: service_packages
    // ============================================================
    console.log('📦 Creating service_packages table...');
    await sql`
      CREATE TABLE IF NOT EXISTS service_packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id VARCHAR NOT NULL,
        package_name VARCHAR(255) NOT NULL,
        package_description TEXT,
        base_price NUMERIC(10,2) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT unique_service_package UNIQUE (service_id, package_name),
        CONSTRAINT fk_service_packages_service FOREIGN KEY (service_id) 
          REFERENCES services(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ service_packages table created');
    
    // Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_service_packages_service ON service_packages(service_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_packages_active ON service_packages(is_active)`;
    console.log('✅ service_packages indexes created');
    
    // Add comment
    await sql`
      COMMENT ON TABLE service_packages IS 
      'Package tier templates per service (Basic, Standard, Premium)'
    `;
    
    // ============================================================
    // TABLE 2: package_items
    // ============================================================
    console.log('\n📋 Creating package_items table...');
    await sql`
      CREATE TABLE IF NOT EXISTS package_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        package_id UUID NOT NULL,
        item_type VARCHAR(50) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_description TEXT,
        quantity INTEGER DEFAULT 1,
        unit_type VARCHAR(50),
        unit_value NUMERIC(10,2),
        unit_price NUMERIC(10,2),
        is_optional BOOLEAN DEFAULT FALSE,
        item_notes TEXT,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_package_items_package FOREIGN KEY (package_id) 
          REFERENCES service_packages(id) ON DELETE CASCADE,
        CONSTRAINT valid_item_type CHECK (
          item_type IN ('personnel', 'equipment', 'deliverable', 'other')
        )
      )
    `;
    console.log('✅ package_items table created');
    
    // Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_package_items_package ON package_items(package_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_package_items_type ON package_items(item_type)`;
    console.log('✅ package_items indexes created');
    
    // Add comment
    await sql`
      COMMENT ON TABLE package_items IS 
      'Individual items within a package (staff, equipment, deliverables)'
    `;
    
    // ============================================================
    // TABLE 3: service_addons
    // ============================================================
    console.log('\n🎁 Creating service_addons table...');
    await sql`
      CREATE TABLE IF NOT EXISTS service_addons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id VARCHAR NOT NULL,
        addon_name VARCHAR(255) NOT NULL,
        addon_description TEXT,
        addon_price NUMERIC(10,2) NOT NULL,
        addon_type VARCHAR(50),
        is_available BOOLEAN DEFAULT TRUE,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT unique_service_addon UNIQUE (service_id, addon_name),
        CONSTRAINT fk_service_addons_service FOREIGN KEY (service_id) 
          REFERENCES services(id) ON DELETE CASCADE
      )
    `;
    console.log('✅ service_addons table created');
    
    // Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_service_addons_service ON service_addons(service_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_service_addons_available ON service_addons(is_available)`;
    console.log('✅ service_addons indexes created');
    
    // Add comment
    await sql`
      COMMENT ON TABLE service_addons IS 
      'Optional add-ons per service (extra hours, equipment upgrades, etc.)'
    `;
    
    // ============================================================
    // TABLE 4: service_pricing_rules
    // ============================================================
    console.log('\n💰 Creating service_pricing_rules table...');
    await sql`
      CREATE TABLE IF NOT EXISTS service_pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        service_id VARCHAR NOT NULL,
        rule_type VARCHAR(50) NOT NULL,
        rule_name VARCHAR(255),
        base_unit INTEGER,
        base_price NUMERIC(10,2),
        additional_unit_price NUMERIC(10,2),
        minimum_units INTEGER,
        maximum_units INTEGER,
        rule_config JSONB,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        
        CONSTRAINT fk_pricing_rules_service FOREIGN KEY (service_id) 
          REFERENCES services(id) ON DELETE CASCADE,
        CONSTRAINT valid_rule_type CHECK (
          rule_type IN ('per_pax', 'hourly', 'daily', 'tiered', 'bulk_discount', 'seasonal')
        )
      )
    `;
    console.log('✅ service_pricing_rules table created');
    
    // Add indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_rules_service ON service_pricing_rules(service_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_rules_type ON service_pricing_rules(rule_type)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_pricing_rules_config ON service_pricing_rules USING GIN (rule_config)`;
    console.log('✅ service_pricing_rules indexes created');
    
    // Add comment
    await sql`
      COMMENT ON TABLE service_pricing_rules IS 
      'Dynamic pricing rules (per-pax, hourly, bulk discounts, etc.)'
    `;
    
    // ============================================================
    // VERIFICATION
    // ============================================================
    console.log('\n🔍 Verifying tables...\n');
    
    const tables = await sql`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
        AND table_name IN ('service_packages', 'package_items', 'service_addons', 'service_pricing_rules')
      ORDER BY table_name
    `;
    
    if (tables.length === 4) {
      console.log('✅ MIGRATION SUCCESSFUL!\n');
      console.log('Created tables:');
      tables.forEach(t => {
        console.log(`  ✓ ${t.table_name} (${t.column_count} columns)`);
      });
      
      console.log('\n📊 Table Structure:');
      console.log('  service_packages → Contains package templates (Basic, Premium, etc.)');
      console.log('  package_items → Contains package contents (personnel, equipment)');
      console.log('  service_addons → Contains optional add-ons');
      console.log('  service_pricing_rules → Contains dynamic pricing rules');
      
      console.log('\n📋 Next Steps:');
      console.log('  1. Run: node add-sample-itemization-data.cjs (to add sample data)');
      console.log('  2. Update backend: backend-deploy/routes/services.cjs');
      console.log('  3. Update frontend: AddServiceForm.tsx');
      console.log('  4. Test locally');
      console.log('  5. Deploy!');
      
      console.log('\n📖 Documentation: ITEMIZATION_DATABASE_MIGRATION_PLAN.md');
      
    } else {
      console.error('❌ ERROR: Not all tables were created!');
      console.error('Expected 4 tables, found:', tables.length);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    console.error('\n💡 TIP: If error says "relation already exists", tables are already created!');
    console.error('         Run: node check-service-tables.cjs to verify');
    process.exit(1);
  }
  
  process.exit(0);
})();
