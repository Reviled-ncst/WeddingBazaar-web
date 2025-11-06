const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * VERIFY SERVICE CATEGORY RELATIONSHIPS
 * 
 * Shows how itemization tables relate to service categories
 */

(async () => {
  try {
    console.log('🔗 Verifying service category relationships...\n');
    
    // ============================================================
    // 1. CHECK SERVICE CATEGORIES TABLE
    // ============================================================
    console.log('📂 SERVICE CATEGORIES:\n');
    const categories = await sql`
      SELECT id, name, display_name, is_active 
      FROM service_categories 
      ORDER BY display_order, name
    `;
    
    if (categories.length > 0) {
      categories.forEach(cat => {
        console.log(`  ${cat.is_active ? '✅' : '❌'} ${cat.display_name || cat.name} (ID: ${cat.id})`);
      });
    } else {
      console.log('  ⚠️  No service categories found!');
    }
    
    // ============================================================
    // 2. SERVICES BY CATEGORY WITH ITEMIZATION COUNT
    // ============================================================
    console.log('\n\n📊 SERVICES BY CATEGORY (with itemization status):\n');
    
    const servicesByCategory = await sql`
      SELECT 
        s.category,
        COUNT(DISTINCT s.id) as total_services,
        COUNT(DISTINCT sp.id) as services_with_packages,
        COUNT(sp.id) as total_packages,
        COUNT(DISTINCT sa.id) as total_addons,
        COUNT(DISTINCT spr.id) as total_pricing_rules
      FROM services s
      LEFT JOIN service_packages sp ON s.id = sp.service_id
      LEFT JOIN service_addons sa ON s.id = sa.service_id
      LEFT JOIN service_pricing_rules spr ON s.id = spr.service_id
      WHERE s.category IS NOT NULL
      GROUP BY s.category
      ORDER BY s.category
    `;
    
    if (servicesByCategory.length > 0) {
      console.log('┌────────────────────┬──────────┬──────────┬──────────┬─────────┬──────────┐');
      console.log('│ Category           │ Services │ w/Pkg    │ Packages │ Add-ons │ Rules    │');
      console.log('├────────────────────┼──────────┼──────────┼──────────┼─────────┼──────────┤');
      
      servicesByCategory.forEach(cat => {
        const category = (cat.category || 'Uncategorized').padEnd(18);
        const total = String(cat.total_services).padStart(8);
        const withPkg = String(cat.services_with_packages).padStart(8);
        const packages = String(cat.total_packages).padStart(8);
        const addons = String(cat.total_addons).padStart(7);
        const rules = String(cat.total_pricing_rules).padStart(8);
        
        console.log(`│ ${category} │${total} │${withPkg} │${packages} │${addons} │${rules} │`);
      });
      
      console.log('└────────────────────┴──────────┴──────────┴──────────┴─────────┴──────────┘');
    }
    
    // ============================================================
    // 3. DETAILED BREAKDOWN PER CATEGORY
    // ============================================================
    console.log('\n\n🔍 DETAILED BREAKDOWN BY CATEGORY:\n');
    
    for (const catRow of servicesByCategory) {
      if (parseInt(catRow.services_with_packages) === 0) continue;
      
      console.log('═'.repeat(70));
      console.log(`📂 CATEGORY: ${catRow.category}`);
      console.log('═'.repeat(70));
      
      // Get services in this category with itemization
      const services = await sql`
        SELECT DISTINCT s.id, s.title, s.price_range
        FROM services s
        JOIN service_packages sp ON s.id = sp.service_id
        WHERE s.category = ${catRow.category}
        ORDER BY s.title
      `;
      
      for (const service of services) {
        console.log(`\n  📸 ${service.title}`);
        console.log(`     ID: ${service.id}`);
        console.log(`     Price Range: ${service.price_range || 'Not specified'}`);
        
        // Get package count
        const pkgCount = await sql`
          SELECT COUNT(*) as count 
          FROM service_packages 
          WHERE service_id = ${service.id}
        `;
        
        // Get item breakdown
        const itemBreakdown = await sql`
          SELECT 
            pi.item_type,
            COUNT(*) as count
          FROM package_items pi
          JOIN service_packages sp ON pi.package_id = sp.id
          WHERE sp.service_id = ${service.id}
          GROUP BY pi.item_type
          ORDER BY pi.item_type
        `;
        
        // Get addon count
        const addonCount = await sql`
          SELECT COUNT(*) as count 
          FROM service_addons 
          WHERE service_id = ${service.id}
        `;
        
        // Get pricing rules
        const rules = await sql`
          SELECT rule_type, rule_name
          FROM service_pricing_rules 
          WHERE service_id = ${service.id}
        `;
        
        console.log(`\n     📦 Packages: ${pkgCount[0].count}`);
        
        if (itemBreakdown.length > 0) {
          console.log(`     📋 Package Items:`);
          itemBreakdown.forEach(item => {
            const icon = item.item_type === 'personnel' ? '👥' : 
                        item.item_type === 'equipment' ? '📷' : 
                        item.item_type === 'deliverable' ? '📦' : '📌';
            console.log(`        ${icon} ${item.item_type}: ${item.count} items`);
          });
        }
        
        console.log(`     🎁 Add-ons: ${addonCount[0].count}`);
        
        if (rules.length > 0) {
          console.log(`     💰 Pricing Rules:`);
          rules.forEach(rule => {
            console.log(`        • ${rule.rule_type}: ${rule.rule_name || 'Unnamed'}`);
          });
        }
      }
      
      console.log('');
    }
    
    // ============================================================
    // 4. FOREIGN KEY RELATIONSHIPS
    // ============================================================
    console.log('\n═'.repeat(70));
    console.log('🔗 FOREIGN KEY RELATIONSHIPS');
    console.log('═'.repeat(70));
    
    const relationships = await sql`
      SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND tc.table_name IN ('service_packages', 'package_items', 'service_addons', 'service_pricing_rules')
      ORDER BY tc.table_name
    `;
    
    console.log('\n📌 Database Constraints:\n');
    
    if (relationships.length > 0) {
      relationships.forEach(rel => {
        console.log(`  ${rel.table_name}.${rel.column_name}`);
        console.log(`    └─→ ${rel.foreign_table_name}.${rel.foreign_column_name}`);
      });
    } else {
      console.log('  ℹ️  No foreign key relationships found (constraints may be implicit)');
    }
    
    // ============================================================
    // 5. EXAMPLE QUERY: Get full service with itemization
    // ============================================================
    console.log('\n\n═'.repeat(70));
    console.log('📖 EXAMPLE API QUERY (Complete Service with Itemization)');
    console.log('═'.repeat(70));
    
    const exampleService = await sql`
      SELECT id, title, category 
      FROM services 
      WHERE id IN (
        SELECT DISTINCT service_id 
        FROM service_packages 
        LIMIT 1
      )
    `;
    
    if (exampleService.length > 0) {
      const serviceId = exampleService[0].id;
      
      console.log(`\nGET /api/services/${serviceId}/itemization\n`);
      console.log('SQL Query:');
      console.log('```sql');
      console.log(`-- 1. Get service`);
      console.log(`SELECT * FROM services WHERE id = '${serviceId}';`);
      console.log('');
      console.log(`-- 2. Get packages`);
      console.log(`SELECT * FROM service_packages WHERE service_id = '${serviceId}';`);
      console.log('');
      console.log(`-- 3. Get package items (with package_id from step 2)`);
      console.log(`SELECT pi.* FROM package_items pi`);
      console.log(`  JOIN service_packages sp ON pi.package_id = sp.id`);
      console.log(`  WHERE sp.service_id = '${serviceId}';`);
      console.log('');
      console.log(`-- 4. Get add-ons`);
      console.log(`SELECT * FROM service_addons WHERE service_id = '${serviceId}';`);
      console.log('');
      console.log(`-- 5. Get pricing rules`);
      console.log(`SELECT * FROM service_pricing_rules WHERE service_id = '${serviceId}';`);
      console.log('```');
    }
    
    // ============================================================
    // 6. SUMMARY
    // ============================================================
    console.log('\n\n═'.repeat(70));
    console.log('✅ RELATIONSHIP VERIFICATION COMPLETE');
    console.log('═'.repeat(70));
    
    console.log('\n📊 Summary:');
    console.log(`  • Service Categories: ${categories.length}`);
    console.log(`  • Categories with Itemized Services: ${servicesByCategory.filter(c => parseInt(c.services_with_packages) > 0).length}`);
    console.log(`  • Total Foreign Key Constraints: ${relationships.length}`);
    
    console.log('\n🔗 Relationship Chain:');
    console.log('  service_categories (reference only)');
    console.log('    ↓');
    console.log('  services (category field)');
    console.log('    ↓');
    console.log('  service_packages (service_id FK)');
    console.log('    ↓');
    console.log('  package_items (package_id FK)');
    console.log('');
    console.log('  services');
    console.log('    ↓');
    console.log('  service_addons (service_id FK)');
    console.log('');
    console.log('  services');
    console.log('    ↓');
    console.log('  service_pricing_rules (service_id FK)');
    
    console.log('\n💡 TIP: Use JOIN queries to fetch complete service with itemization!');
    console.log('📖 See: RELATIONAL_ITEMIZATION_IMPLEMENTATION.md for API examples\n');
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
  
  process.exit(0);
})();
