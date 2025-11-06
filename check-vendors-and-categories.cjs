const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorsAndCategories() {
  try {
    console.log('🔍 Checking vendors and categories in database...\n');
    
    // Check all vendors
    const vendors = await sql`
      SELECT id, business_name, business_type, rating 
      FROM vendors 
      ORDER BY business_name
    `;
    
    console.log(`📊 Total Vendors: ${vendors.length}\n`);
    console.log('🏢 All Vendors:');
    console.table(vendors);
    
    // Check all categories
    const categories = await sql`
      SELECT * FROM service_categories 
      ORDER BY name
    `;
    
    console.log(`\n📋 Total Categories: ${categories.length}\n`);
    console.log('📂 All Categories:');
    console.table(categories);
    
    // Check existing services by category
    const servicesByCategory = await sql`
      SELECT 
        sc.name as category_name,
        COUNT(s.id) as service_count
      FROM service_categories sc
      LEFT JOIN services s ON s.category_id = sc.id
      GROUP BY sc.id, sc.name
      ORDER BY sc.name
    `;
    
    console.log('\n📊 Existing Services by Category:');
    console.table(servicesByCategory);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkVendorsAndCategories();
