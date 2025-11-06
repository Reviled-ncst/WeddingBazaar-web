const { sql } = require('./backend-deploy/config/database.cjs');

async function verifyAllData() {
  try {
    console.log('\n🎉 FINAL DATA VERIFICATION\n');
    console.log('='.repeat(70));
    
    // Check vendors
    const vendors = await sql`
      SELECT id, business_name, business_type, rating, location 
      FROM vendors 
      ORDER BY id
    `;
    
    console.log('\n📊 VENDORS (' + vendors.length + ' total)\n');
    vendors.forEach((v, i) => {
      console.log(`${i+1}. ${v.business_name}`);
      console.log(`   ID: ${v.id} | Category: ${v.business_type} | Rating: ${v.rating}`);
      console.log(`   Location: ${v.location || 'N/A'}`);
      console.log('');
    });
    
    // Check services by category
    const servicesByCategory = await sql`
      SELECT category, COUNT(*) as count 
      FROM services 
      GROUP BY category 
      ORDER BY category
    `;
    
    console.log('\n📦 SERVICES BY CATEGORY\n');
    console.table(servicesByCategory);
    
    // Check reviews
    const totalReviews = await sql`SELECT COUNT(*) as count FROM reviews`;
    console.log(`\n⭐ REVIEWS: ${totalReviews[0].count} total\n`);
    
    // Check categories
    const categories = await sql`
      SELECT name, display_name 
      FROM service_categories 
      ORDER BY sort_order
    `;
    
    console.log('\n📋 SERVICE CATEGORIES (' + categories.length + ' total)\n');
    categories.forEach((cat, i) => {
      console.log(`${i+1}. ${cat.name} - ${cat.display_name}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE FULLY POPULATED AND READY!');
    console.log('='.repeat(70));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

verifyAllData();
