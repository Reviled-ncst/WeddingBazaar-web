const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('🔍 Checking services in database...\n');
    
    const services = await sql`SELECT id, title, vendor_id, is_active, category FROM services LIMIT 20`;
    
    console.log(`Found ${services.length} services:\n`);
    console.table(services);
    
    // Also check for the specific service ID
    const testService = await sql`SELECT * FROM services WHERE id = 'SRV-0001'`;
    console.log('\n🔍 Looking for service SRV-0001:');
    if (testService.length > 0) {
      console.log('✅ Found:', testService[0]);
    } else {
      console.log('❌ Not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
})();
