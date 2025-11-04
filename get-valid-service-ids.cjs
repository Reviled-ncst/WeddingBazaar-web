require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function getValidServiceIds() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    console.log('🔍 Fetching services from database...\n');
    
    const services = await sql`
      SELECT id, name, vendor_id, price, category
      FROM services 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    if (services.length === 0) {
      console.log('❌ No services found in database');
      return;
    }
    
    console.log('✅ Found', services.length, 'services:\n');
    console.log('='.repeat(80));
    
    services.forEach((service, index) => {
      console.log(`\n${index + 1}. Service: ${service.name}`);
      console.log(`   Service ID: ${service.id}`);
      console.log(`   Vendor ID: ${service.vendor_id}`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Price: ₱${service.price ? parseFloat(service.price).toFixed(2) : 'N/A'}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 COPY THIS FOR TESTING:\n');
    
    if (services.length > 0) {
      const firstService = services[0];
      console.log(`Service ID: "${firstService.id}"`);
      console.log(`Vendor ID: "${firstService.vendor_id}"`);
      console.log(`Price: ${firstService.price ? parseFloat(firstService.price) : 100}`);
    }
    
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    console.error(error);
  }
}

getValidServiceIds();
