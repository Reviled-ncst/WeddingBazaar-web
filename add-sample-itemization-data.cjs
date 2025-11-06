const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * ADD SAMPLE ITEMIZATION DATA
 * 
 * Creates sample packages, items, addons, and pricing rules
 * for testing the itemization system
 */

(async () => {
  try {
    console.log('🎨 Adding sample itemization data...\n');
    
    // Get a sample service to attach packages to
    const services = await sql`SELECT id, title, category FROM services LIMIT 3`;
    
    if (services.length === 0) {
      console.error('❌ No services found! Please create a service first.');
      process.exit(1);
    }
    
    console.log(`📸 Found ${services.length} services to enhance:\n`);
    services.forEach(s => console.log(`  - ${s.title} (${s.category})`));
    console.log('');
    
    // ============================================================
    // SAMPLE DATA FOR FIRST SERVICE (Photography)
    // ============================================================
    const serviceId = services[0].id;
    const serviceTitle = services[0].title;
    const serviceCategory = services[0].category || 'Photography';
    
    console.log(`🎯 Adding itemization to: ${serviceTitle}\n`);
    
    // ============================================================
    // 1. CREATE PACKAGES
    // ============================================================
    console.log('📦 Creating packages...');
    
    const basicPackage = await sql`
      INSERT INTO service_packages (
        service_id, package_name, package_description, 
        base_price, is_default, display_order
      ) VALUES (
        ${serviceId},
        'Basic Package',
        'Perfect for intimate weddings and small gatherings',
        60000.00,
        true,
        1
      )
      ON CONFLICT (service_id, package_name) DO UPDATE SET
        package_description = EXCLUDED.package_description,
        base_price = EXCLUDED.base_price
      RETURNING id, package_name, base_price
    `;
    console.log(`  ✓ ${basicPackage[0].package_name} - ₱${basicPackage[0].base_price}`);
    
    const premiumPackage = await sql`
      INSERT INTO service_packages (
        service_id, package_name, package_description, 
        base_price, is_default, display_order
      ) VALUES (
        ${serviceId},
        'Premium Package',
        'Complete coverage with professional team and equipment',
        120000.00,
        false,
        2
      )
      ON CONFLICT (service_id, package_name) DO UPDATE SET
        package_description = EXCLUDED.package_description,
        base_price = EXCLUDED.base_price
      RETURNING id, package_name, base_price
    `;
    console.log(`  ✓ ${premiumPackage[0].package_name} - ₱${premiumPackage[0].base_price}`);
    
    // ============================================================
    // 2. ADD PACKAGE ITEMS
    // ============================================================
    console.log('\n👥 Adding personnel to Basic Package...');
    
    await sql`
      INSERT INTO package_items (
        package_id, item_type, item_name, 
        quantity, unit_type, unit_value, display_order
      ) VALUES
        (${basicPackage[0].id}, 'personnel', 'Lead Photographer', 1, 'hours', 8, 1),
        (${basicPackage[0].id}, 'personnel', 'Videographer', 1, 'hours', 6, 2)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ 1× Lead Photographer (8 hours)');
    console.log('  ✓ 1× Videographer (6 hours)');
    
    console.log('\n📷 Adding equipment to Basic Package...');
    await sql`
      INSERT INTO package_items (
        package_id, item_type, item_name, 
        quantity, unit_type, display_order
      ) VALUES
        (${basicPackage[0].id}, 'equipment', 'DSLR Camera', 2, 'pieces', 1),
        (${basicPackage[0].id}, 'equipment', 'Drone (DJI Mavic)', 1, 'pieces', 2),
        (${basicPackage[0].id}, 'equipment', 'Gimbal Stabilizer', 1, 'pieces', 3)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ 2× DSLR Cameras');
    console.log('  ✓ 1× Drone (DJI Mavic)');
    console.log('  ✓ 1× Gimbal Stabilizer');
    
    console.log('\n📦 Adding deliverables to Basic Package...');
    await sql`
      INSERT INTO package_items (
        package_id, item_type, item_name, item_description,
        quantity, unit_type, display_order
      ) VALUES
        (${basicPackage[0].id}, 'deliverable', 'Edited Photos', 
         'Professional editing with color correction', 700, 'items', 1),
        (${basicPackage[0].id}, 'deliverable', 'Highlight Video', 
         'Cinematic highlight reel', 1, 'videos', 2),
        (${basicPackage[0].id}, 'deliverable', 'Online Gallery', 
         'Downloadable online gallery for 1 year', 1, 'access', 3)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ 700× Edited Photos');
    console.log('  ✓ 1× Highlight Video (3-5 min)');
    console.log('  ✓ 1× Online Gallery (1 year access)');
    
    // Premium Package Items
    console.log('\n👥 Adding personnel to Premium Package...');
    await sql`
      INSERT INTO package_items (
        package_id, item_type, item_name, 
        quantity, unit_type, unit_value, display_order
      ) VALUES
        (${premiumPackage[0].id}, 'personnel', 'Lead Photographer', 2, 'hours', 10, 1),
        (${premiumPackage[0].id}, 'personnel', 'Videographer', 2, 'hours', 10, 2),
        (${premiumPackage[0].id}, 'personnel', 'Photography Assistant', 1, 'hours', 10, 3)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ 2× Lead Photographers (10 hours)');
    console.log('  ✓ 2× Videographers (10 hours)');
    console.log('  ✓ 1× Photography Assistant (10 hours)');
    
    console.log('\n📷 Adding equipment to Premium Package...');
    await sql`
      INSERT INTO package_items (
        package_id, item_type, item_name, 
        quantity, unit_type, display_order
      ) VALUES
        (${premiumPackage[0].id}, 'equipment', 'DSLR Camera (Full Frame)', 4, 'pieces', 1),
        (${premiumPackage[0].id}, 'equipment', 'Drone (DJI Mavic 3)', 2, 'pieces', 2),
        (${premiumPackage[0].id}, 'equipment', 'Professional Lighting Kit', 1, 'sets', 3),
        (${premiumPackage[0].id}, 'equipment', 'Gimbal Stabilizer (Pro)', 2, 'pieces', 4)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ 4× DSLR Cameras (Full Frame)');
    console.log('  ✓ 2× Drones (DJI Mavic 3)');
    console.log('  ✓ 1× Professional Lighting Kit');
    console.log('  ✓ 2× Gimbal Stabilizers (Pro)');
    
    console.log('\n📦 Adding deliverables to Premium Package...');
    await sql`
      INSERT INTO package_items (
        package_id, item_type, item_name, item_description,
        quantity, unit_type, display_order
      ) VALUES
        (${premiumPackage[0].id}, 'deliverable', 'Edited Photos', 
         'Professional editing with advanced retouching', 1500, 'items', 1),
        (${premiumPackage[0].id}, 'deliverable', 'Same-Day Edit Video', 
         'Cinematic same-day highlights shown at reception', 1, 'videos', 2),
        (${premiumPackage[0].id}, 'deliverable', 'Full Ceremony Video', 
         'Complete ceremony coverage (30-45 min)', 1, 'videos', 3),
        (${premiumPackage[0].id}, 'deliverable', 'Full Reception Video', 
         'Complete reception coverage (60-90 min)', 1, 'videos', 4),
        (${premiumPackage[0].id}, 'deliverable', 'USB Drive + Prints', 
         'All files on USB + 20 8×10 prints', 1, 'sets', 5)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ 1500× Edited Photos');
    console.log('  ✓ 1× Same-Day Edit Video');
    console.log('  ✓ 1× Full Ceremony Video');
    console.log('  ✓ 1× Full Reception Video');
    console.log('  ✓ 1× USB Drive + 20 Prints');
    
    // ============================================================
    // 3. ADD SERVICE ADD-ONS
    // ============================================================
    console.log('\n🎁 Adding service add-ons...');
    
    await sql`
      INSERT INTO service_addons (
        service_id, addon_name, addon_description, addon_price, addon_type, display_order
      ) VALUES
        (${serviceId}, 'Extra Hour', 'Additional coverage beyond base hours', 5000.00, 'time_extension', 1),
        (${serviceId}, 'Engagement Shoot', 'Pre-wedding photo session (2 hours)', 20000.00, 'service', 2),
        (${serviceId}, 'Second Drone', 'Additional drone for aerial shots', 8000.00, 'equipment', 3),
        (${serviceId}, 'USB Drive Package', 'All raw files on USB drive', 3000.00, 'deliverable', 4),
        (${serviceId}, 'Photo Booth', '2-hour photo booth with prints', 15000.00, 'service', 5)
      ON CONFLICT (service_id, addon_name) DO UPDATE SET
        addon_description = EXCLUDED.addon_description,
        addon_price = EXCLUDED.addon_price
    `;
    
    console.log('  ✓ Extra Hour - ₱5,000');
    console.log('  ✓ Engagement Shoot - ₱20,000');
    console.log('  ✓ Second Drone - ₱8,000');
    console.log('  ✓ USB Drive Package - ₱3,000');
    console.log('  ✓ Photo Booth - ₱15,000');
    
    // ============================================================
    // 4. ADD PRICING RULES
    // ============================================================
    console.log('\n💰 Adding pricing rules...');
    
    // Hourly pricing rule
    await sql`
      INSERT INTO service_pricing_rules (
        service_id, rule_type, rule_name,
        base_unit, base_price, additional_unit_price,
        minimum_units, maximum_units, is_active
      ) VALUES
        (${serviceId}, 'hourly', 'Hourly Rate Pricing',
         8, 50000.00, 5000.00, 4, 16, true)
      ON CONFLICT DO NOTHING
    `;
    console.log('  ✓ Hourly: ₱50,000 for 8 hours, ₱5,000 per extra hour');
    
    // ============================================================
    // IF CATERING SERVICE, ADD PER-PAX PRICING
    // ============================================================
    if (serviceCategory.toLowerCase().includes('catering') || serviceCategory.toLowerCase().includes('food')) {
      console.log('\n🍽️ Adding per-pax pricing (Catering service detected)...');
      await sql`
        INSERT INTO service_pricing_rules (
          service_id, rule_type, rule_name,
          base_unit, base_price, additional_unit_price,
          minimum_units, maximum_units, is_active
        ) VALUES
          (${serviceId}, 'per_pax', 'Per Guest Pricing',
           100, 80000.00, 800.00, 50, 500, true)
        ON CONFLICT DO NOTHING
      `;
      console.log('  ✓ Per-Pax: ₱800 per guest (min 50, max 500)');
    }
    
    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n✅ SAMPLE DATA ADDED SUCCESSFULLY!\n');
    
    const packageCount = await sql`SELECT COUNT(*) as count FROM service_packages WHERE service_id = ${serviceId}`;
    const itemCount = await sql`
      SELECT COUNT(*) as count 
      FROM package_items pi
      JOIN service_packages sp ON pi.package_id = sp.id
      WHERE sp.service_id = ${serviceId}
    `;
    const addonCount = await sql`SELECT COUNT(*) as count FROM service_addons WHERE service_id = ${serviceId}`;
    const ruleCount = await sql`SELECT COUNT(*) as count FROM service_pricing_rules WHERE service_id = ${serviceId}`;
    
    console.log('📊 Summary:');
    console.log(`  Service: ${serviceTitle}`);
    console.log(`  Packages: ${packageCount[0].count}`);
    console.log(`  Package Items: ${itemCount[0].count}`);
    console.log(`  Add-Ons: ${addonCount[0].count}`);
    console.log(`  Pricing Rules: ${ruleCount[0].count}`);
    
    console.log('\n📋 Next Steps:');
    console.log('  1. Query the data: node query-itemization-data.cjs');
    console.log('  2. Update backend API to use these tables');
    console.log('  3. Update frontend to display itemization');
    console.log('  4. Test in browser');
    
    console.log('\n💡 TIP: Run this script multiple times to add data to different services!');
    
  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
  
  process.exit(0);
})();
