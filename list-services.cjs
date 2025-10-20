require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

async function listServices() {
  const sql = neon(process.env.NEON_DATABASE_URL);
  
  try {
    console.log('🔍 Fetching services from database...\n');
    
    const services = await sql`
      SELECT id, name, vendor_id, category, price 
      FROM services 
      ORDER BY id 
      LIMIT 20
    `;
    
    if (services.length === 0) {
      console.log('❌ No services found in database');
      return;
    }
    
    console.log('✅ Found', services.length, 'services:\n');
    console.log('ID   | Vendor ID | Category        | Price | Name');
    console.log('-----------------------------------------------------------');
    
    services.forEach(service => {
      const idStr = String(service.id).padEnd(4);
      const vendorIdStr = String(service.vendor_id).padEnd(9);
      const categoryStr = (service.category || 'N/A').padEnd(15);
      const priceStr = (service.price || 'N/A').padEnd(5);
      console.log(`${idStr} | ${vendorIdStr} | ${categoryStr} | ${priceStr} | ${service.name}`);
    });
    
    console.log('\n✅ You can use any of these service IDs for testing bookings');
    
  } catch (error) {
    console.error('❌ Error fetching services:', error.message);
    console.error(error);
  }
}

listServices();
