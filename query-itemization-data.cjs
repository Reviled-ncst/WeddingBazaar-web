const { sql } = require('./backend-deploy/config/database.cjs');

/**
 * QUERY ITEMIZATION DATA
 * 
 * Displays all itemization data for services in a readable format
 */

(async () => {
  try {
    console.log('🔍 Querying itemization data...\n');
    
    // Get services with packages
    const servicesWithPackages = await sql`
      SELECT DISTINCT s.id, s.title, s.category
      FROM services s
      JOIN service_packages sp ON s.id = sp.service_id
      ORDER BY s.title
    `;
    
    if (servicesWithPackages.length === 0) {
      console.log('ℹ️  No services with itemization found.');
      console.log('   Run: node add-sample-itemization-data.cjs');
      process.exit(0);
    }
    
    console.log(`📦 Found ${servicesWithPackages.length} services with itemization:\n`);
    
    // Loop through each service
    for (const service of servicesWithPackages) {
      console.log('═'.repeat(70));
      console.log(`📸 SERVICE: ${service.title}`);
      console.log(`   Category: ${service.category || 'N/A'}`);
      console.log(`   ID: ${service.id}`);
      console.log('═'.repeat(70));
      
      // Get packages
      const packages = await sql`
        SELECT * FROM service_packages 
        WHERE service_id = ${service.id}
        ORDER BY display_order, package_name
      `;
      
      console.log(`\n📦 PACKAGES (${packages.length}):\n`);
      
      for (const pkg of packages) {
        console.log(`┌─ ${pkg.package_name} - ₱${parseFloat(pkg.base_price).toLocaleString()}`);
        console.log(`│  ${pkg.package_description || 'No description'}`);
        console.log(`│  Default: ${pkg.is_default ? 'Yes' : 'No'} | Active: ${pkg.is_active ? 'Yes' : 'No'}`);
        
        // Get package items
        const items = await sql`
          SELECT * FROM package_items 
          WHERE package_id = ${pkg.id}
          ORDER BY display_order, item_type, item_name
        `;
        
        if (items.length > 0) {
          // Group by item type
          const personnel = items.filter(i => i.item_type === 'personnel');
          const equipment = items.filter(i => i.item_type === 'equipment');
          const deliverables = items.filter(i => i.item_type === 'deliverable');
          
          if (personnel.length > 0) {
            console.log(`│`);
            console.log(`│  👥 PERSONNEL:`);
            personnel.forEach(p => {
              const unit = p.unit_value ? ` (${p.unit_value} ${p.unit_type || 'units'})` : '';
              console.log(`│     • ${p.quantity}× ${p.item_name}${unit}`);
            });
          }
          
          if (equipment.length > 0) {
            console.log(`│`);
            console.log(`│  📷 EQUIPMENT:`);
            equipment.forEach(e => {
              console.log(`│     • ${e.quantity}× ${e.item_name}`);
            });
          }
          
          if (deliverables.length > 0) {
            console.log(`│`);
            console.log(`│  📦 DELIVERABLES:`);
            deliverables.forEach(d => {
              const desc = d.item_description ? ` - ${d.item_description}` : '';
              console.log(`│     • ${d.quantity}× ${d.item_name}${desc}`);
            });
          }
        }
        
        console.log(`└─\n`);
      }
      
      // Get add-ons
      const addons = await sql`
        SELECT * FROM service_addons 
        WHERE service_id = ${service.id}
        ORDER BY display_order, addon_name
      `;
      
      if (addons.length > 0) {
        console.log(`🎁 ADD-ONS (${addons.length}):\n`);
        addons.forEach(addon => {
          const available = addon.is_available ? '✅' : '❌';
          console.log(`  ${available} ${addon.addon_name} - ₱${parseFloat(addon.addon_price).toLocaleString()}`);
          if (addon.addon_description) {
            console.log(`     ${addon.addon_description}`);
          }
        });
        console.log('');
      }
      
      // Get pricing rules
      const rules = await sql`
        SELECT * FROM service_pricing_rules 
        WHERE service_id = ${service.id}
        ORDER BY rule_type
      `;
      
      if (rules.length > 0) {
        console.log(`💰 PRICING RULES (${rules.length}):\n`);
        rules.forEach(rule => {
          const active = rule.is_active ? '✅' : '❌';
          console.log(`  ${active} ${rule.rule_type.toUpperCase()}: ${rule.rule_name || 'No name'}`);
          
          if (rule.rule_type === 'hourly') {
            console.log(`     Base: ₱${parseFloat(rule.base_price).toLocaleString()} for ${rule.base_unit} hours`);
            console.log(`     Additional: ₱${parseFloat(rule.additional_unit_price).toLocaleString()} per hour`);
            console.log(`     Range: ${rule.minimum_units}-${rule.maximum_units} hours`);
          } else if (rule.rule_type === 'per_pax') {
            console.log(`     Base: ₱${parseFloat(rule.base_price).toLocaleString()} for ${rule.base_unit} guests`);
            console.log(`     Per Guest: ₱${parseFloat(rule.additional_unit_price).toLocaleString()}`);
            console.log(`     Range: ${rule.minimum_units}-${rule.maximum_units} guests`);
          }
        });
        console.log('');
      }
      
      console.log(''); // Extra spacing between services
    }
    
    // Overall summary
    console.log('═'.repeat(70));
    console.log('📊 OVERALL SUMMARY');
    console.log('═'.repeat(70));
    
    const totalPackages = await sql`SELECT COUNT(*) as count FROM service_packages`;
    const totalItems = await sql`SELECT COUNT(*) as count FROM package_items`;
    const totalAddons = await sql`SELECT COUNT(*) as count FROM service_addons`;
    const totalRules = await sql`SELECT COUNT(*) as count FROM service_pricing_rules`;
    
    console.log(`Services with itemization: ${servicesWithPackages.length}`);
    console.log(`Total packages: ${totalPackages[0].count}`);
    console.log(`Total package items: ${totalItems[0].count}`);
    console.log(`Total add-ons: ${totalAddons[0].count}`);
    console.log(`Total pricing rules: ${totalRules[0].count}`);
    
    console.log('\n✅ Query complete!\n');
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
  
  process.exit(0);
})();
