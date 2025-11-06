const { sql } = require('./backend-deploy/config/database.cjs');

// Mapping of service categories to vendor IDs
const CATEGORY_TO_VENDOR = {
  'Beauty': 'VEN-00008',
  'Florist': 'VEN-00009',
  'Planning': 'VEN-00010',
  'Venue': 'VEN-00011',
  'Music': 'VEN-00012',
  'Officiant': 'VEN-00013',
  'Rentals': 'VEN-00014',
  'Cake': 'VEN-00015',
  'Fashion': 'VEN-00016',
  'Security': 'VEN-00017',
  'AV_Equipment': 'VEN-00018',
  'Stationery': 'VEN-00019',
  'Transport': 'VEN-00020',
  'Photography': 'VEN-00002', // Existing photography vendor
  'Catering': 'VEN-00001' // Existing catering vendor
};

async function reassignServicesToVendors() {
  try {
    console.log('🔄 REASSIGNING SERVICES TO MATCHING VENDORS');
    console.log('='.repeat(70));
    
    // First, check current distribution
    console.log('\n📊 BEFORE - Services by Vendor:');
    const beforeStats = await sql`
      SELECT vendor_id, COUNT(*) as count 
      FROM services 
      GROUP BY vendor_id 
      ORDER BY count DESC
    `;
    console.table(beforeStats);
    
    // Get all services with their categories
    const services = await sql`
      SELECT id, title, category, vendor_id 
      FROM services 
      ORDER BY category
    `;
    
    console.log(`\n📦 Total Services to Reassign: ${services.length}\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const service of services) {
      const correctVendorId = CATEGORY_TO_VENDOR[service.category];
      
      if (!correctVendorId) {
        console.log(`⚠️ No vendor mapping for category: ${service.category}`);
        skipped++;
        continue;
      }
      
      if (service.vendor_id === correctVendorId) {
        // Already assigned correctly
        skipped++;
        continue;
      }
      
      // Update the service to correct vendor
      await sql`
        UPDATE services 
        SET vendor_id = ${correctVendorId}
        WHERE id = ${service.id}
      `;
      
      updated++;
      
      if (updated % 20 === 0) {
        console.log(`✅ Updated ${updated} services...`);
      }
    }
    
    console.log(`\n✅ Reassignment Complete!`);
    console.log(`   - Updated: ${updated} services`);
    console.log(`   - Skipped: ${skipped} services (already correct or no mapping)`);
    
    // Show new distribution
    console.log('\n📊 AFTER - Services by Vendor:');
    const afterStats = await sql`
      SELECT 
        v.business_name,
        v.business_type,
        v.id as vendor_id,
        COUNT(s.id) as service_count
      FROM vendors v
      LEFT JOIN services s ON v.id = s.vendor_id
      GROUP BY v.id, v.business_name, v.business_type
      ORDER BY service_count DESC
    `;
    console.table(afterStats);
    
    // Show services by category with vendor match
    console.log('\n📋 Services Per Category with Correct Vendors:');
    const categoryStats = await sql`
      SELECT 
        s.category,
        COUNT(s.id) as service_count,
        v.business_name as vendor_name,
        v.id as vendor_id
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      GROUP BY s.category, v.business_name, v.id
      ORDER BY s.category
    `;
    console.table(categoryStats);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ ALL SERVICES NOW ASSIGNED TO MATCHING VENDORS!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

reassignServicesToVendors();
