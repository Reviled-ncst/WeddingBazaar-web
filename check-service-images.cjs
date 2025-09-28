const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

(async () => {
  try {
    console.log('🔍 Checking services table schema...');
    
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services' 
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Services table columns:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type}`);
    });

    // Check if any services actually have image data
    console.log('\n🖼️ Checking for image data in services...');
    const imageCheck = await sql`
      SELECT id, name, category, images
      FROM services 
      LIMIT 5
    `;
    
    console.log('\nFirst 5 services image status:');
    imageCheck.forEach(service => {
      const hasImages = service.images && service.images.length > 0;
      console.log(`  ${service.id}: ${service.name} (${service.category})`);
      console.log(`    Images: ${hasImages ? service.images.join(', ') : 'NO IMAGES'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
})();
