const { sql } = require('./backend-deploy/config/database.cjs');

async function checkServicesInDatabase() {
  try {
    console.log('🔍 Checking services in database...\n');
    
    // Check total services
    const totalServices = await sql`SELECT COUNT(*) as count FROM services`;
    console.log(`📦 Total Services: ${totalServices[0].count}`);
    
    // Check services by category
    const servicesByCategory = await sql`
      SELECT 
        category, 
        COUNT(*) as service_count 
      FROM services 
      GROUP BY category 
      ORDER BY service_count DESC
    `;
    
    console.log('\n📊 Services by Category:');
    console.table(servicesByCategory);
    
    // Check services by vendor
    const servicesByVendor = await sql`
      SELECT 
        vendor_id, 
        COUNT(*) as service_count 
      FROM services 
      GROUP BY vendor_id 
      ORDER BY service_count DESC
    `;
    
    console.log('\n🏢 Services by Vendor:');
    console.table(servicesByVendor);
    
    // Check sample services
    const sampleServices = await sql`
      SELECT id, title, category, vendor_id, price 
      FROM services 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('\n🔎 Sample Services (Latest 10):');
    console.table(sampleServices.map(s => ({
      vendor: s.vendor_id,
      name: s.title ? s.title.substring(0, 40) : 'N/A',
      category: s.category,
      price: s.price
    })));
    
    // Check available categories in service_categories table
    const categories = await sql`
      SELECT * FROM service_categories ORDER BY name
    `;
    
    console.log('\n📋 Available Categories in service_categories table:');
    console.table(categories);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkServicesInDatabase();
