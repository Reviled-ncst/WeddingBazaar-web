const { sql } = require('./backend-deploy/config/database.cjs');

async function checkServicesVendorLinks() {
  try {
    console.log('🔍 CHECKING SERVICES → VENDOR LINKS\n');
    console.log('='.repeat(70));
    
    // Check if services are properly linked to vendors
    const servicesCheck = await sql`
      SELECT 
        s.id as service_id,
        s.title,
        s.category,
        s.vendor_id,
        v.id as actual_vendor_id,
        v.business_name,
        v.user_id,
        CASE 
          WHEN v.id IS NULL THEN '❌ BROKEN LINK'
          ELSE '✅ OK'
        END as status
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      ORDER BY s.category, s.vendor_id
      LIMIT 30
    `;
    
    console.log('\n📊 SAMPLE SERVICES (First 30):\n');
    servicesCheck.forEach(s => {
      console.log(`${s.status} ${s.category.padEnd(15)} | ${s.title.substring(0, 35).padEnd(35)} | Vendor: ${s.vendor_id || 'NULL'}`);
    });
    
    // Check for broken links
    const brokenLinks = await sql`
      SELECT COUNT(*) as count
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      WHERE v.id IS NULL
    `;
    
    console.log('\n' + '='.repeat(70));
    console.log(`\n🔗 BROKEN LINKS: ${brokenLinks[0].count} services with invalid vendor_id`);
    
    // Check services by vendor
    const servicesByVendor = await sql`
      SELECT 
        v.id as vendor_id,
        v.business_name,
        v.business_type,
        COUNT(s.id) as service_count
      FROM vendors v
      LEFT JOIN services s ON s.vendor_id = v.id
      GROUP BY v.id, v.business_name, v.business_type
      ORDER BY v.id
    `;
    
    console.log('\n📋 SERVICES PER VENDOR:\n');
    servicesByVendor.forEach(v => {
      const check = v.service_count > 0 ? '✅' : '⚠️';
      console.log(`${check} ${v.vendor_id.padEnd(15)} | ${v.business_name.padEnd(35)} | ${v.business_type?.padEnd(15) || 'N/A'.padEnd(15)} | ${v.service_count} services`);
    });
    
    // Check if services match vendor business types
    console.log('\n' + '='.repeat(70));
    console.log('\n🔄 CATEGORY MATCHING CHECK:\n');
    
    const categoryMismatch = await sql`
      SELECT 
        s.category,
        v.business_type,
        v.business_name,
        COUNT(*) as mismatch_count
      FROM services s
      JOIN vendors v ON s.vendor_id = v.id
      WHERE s.category != v.business_type
      GROUP BY s.category, v.business_type, v.business_name
      LIMIT 10
    `;
    
    if (categoryMismatch.length > 0) {
      console.log('⚠️ Found mismatches (services not matching vendor category):\n');
      categoryMismatch.forEach(m => {
        console.log(`   Service Category: ${m.category} → Vendor Type: ${m.business_type} (${m.business_name}) - ${m.mismatch_count} services`);
      });
    } else {
      console.log('✅ All services match their vendor categories!');
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY:\n');
    
    const totalServices = await sql`SELECT COUNT(*) as count FROM services`;
    const totalVendors = await sql`SELECT COUNT(*) as count FROM vendors`;
    const vendorsWithServices = servicesByVendor.filter(v => v.service_count > 0).length;
    
    console.log(`✅ Total Services: ${totalServices[0].count}`);
    console.log(`✅ Total Vendors: ${totalVendors[0].count}`);
    console.log(`✅ Vendors with Services: ${vendorsWithServices}/${totalVendors[0].count}`);
    console.log(`${brokenLinks[0].count === 0 ? '✅' : '❌'} Broken Links: ${brokenLinks[0].count}`);
    
    if (brokenLinks[0].count === 0 && categoryMismatch.length === 0) {
      console.log('\n🎉 ALL SERVICES ARE PROPERLY LINKED TO VENDORS!');
    } else if (brokenLinks[0].count > 0) {
      console.log('\n⚠️ WARNING: Some services need to be fixed!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkServicesVendorLinks();
