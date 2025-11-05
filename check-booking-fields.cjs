const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('📋 Checking bookings table for client name fields...\n');
    
    const sampleBooking = await sql`
      SELECT * FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    if (sampleBooking.length > 0) {
      console.log('✓ Sample booking found!\n');
      console.log('ALL fields in booking:');
      console.log(JSON.stringify(sampleBooking[0], null, 2));
      
      console.log('\n\nName-related fields:');
      Object.keys(sampleBooking[0]).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('name') || 
            lowerKey.includes('client') || 
            lowerKey.includes('couple') ||
            lowerKey.includes('first') ||
            lowerKey.includes('last')) {
          console.log(`  ✓ ${key}: ${sampleBooking[0][key]}`);
        }
      });
    } else {
      console.log('❌ No bookings found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
