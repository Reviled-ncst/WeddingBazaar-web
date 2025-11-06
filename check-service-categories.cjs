const { sql } = require('./backend-deploy/config/database.cjs');

async function checkServiceCategories() {
  try {
    console.log('📊 Checking actual service categories in database...\n');
    
    // Get distinct categories
    const categories = await sql`
      SELECT DISTINCT category 
      FROM services 
      WHERE category IS NOT NULL AND is_active = true
      ORDER BY category
    `;
    
    console.log('✅ Unique Categories:');
    console.table(categories);
    
    // Get category counts
    const counts = await sql`
      SELECT 
        category, 
        COUNT(*) as service_count 
      FROM services 
      WHERE category IS NOT NULL AND is_active = true
      GROUP BY category 
      ORDER BY service_count DESC
    `;
    
    console.log('\n📈 Services per Category:');
    console.table(counts);
    
    // Get sample services per category
    console.log('\n📋 Sample Services:');
    for (const cat of categories) {
      const samples = await sql`
        SELECT id, title, category, vendor_id
        FROM services
        WHERE category = ${cat.category}
        LIMIT 2
      `;
      console.log(`\n${cat.category}:`);
      console.table(samples);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkServiceCategories();
