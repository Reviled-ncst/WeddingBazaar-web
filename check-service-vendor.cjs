const path = require('path');
const { sql } = require(path.join(__dirname, 'backend-deploy', 'config', 'database.cjs'));

(async () => {
  try {
    console.log('🔍 Checking service vendor IDs...\n');
    
    // Check all services
    const services = await sql`
      SELECT id, name, vendor_id 
      FROM services 
      ORDER BY id
    `;
    
    console.log('📋 Services in database:');
    services.forEach(service => {
      console.log(`  ID: ${service.id} | Name: ${service.name} | Vendor ID: ${service.vendor_id}`);
    });
    
    console.log('\n🔍 Checking bookings...\n');
    
    // Check all bookings
    const bookings = await sql`
      SELECT id, vendor_id, couple_id, service_name, event_date, status
      FROM bookings
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('📋 Recent bookings:');
    bookings.forEach(booking => {
      console.log(`  ID: ${booking.id} | Vendor: ${booking.vendor_id} | Couple: ${booking.couple_id} | Service: ${booking.service_name} | Status: ${booking.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
})();
