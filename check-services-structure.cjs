const { sql } = require('./backend-deploy/config/database.cjs');

async function checkServicesStructure() {
  try {
    console.log('🔍 Checking services table structure...\n');
    
    // Check table columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `;
    
    console.log('📋 Services Table Columns:');
    console.table(columns);
    
    // Check existing services
    const services = await sql`
      SELECT id, title, name, category, vendor_id 
      FROM services 
      LIMIT 10
    `;
    
    console.log('\n📊 Sample Services (first 10):');
    console.table(services);
    
    // Count services by category
    const countByCategory = await sql`
      SELECT category, COUNT(*) as count
      FROM services
      WHERE is_active = true
      GROUP BY category
      ORDER BY count DESC
    `;
    
    console.log('\n📈 Services by Category:');
    console.table(countByCategory);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkServicesStructure();
