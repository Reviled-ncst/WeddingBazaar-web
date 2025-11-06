const { sql } = require('./backend-deploy/config/database.cjs');

async function checkBookingsColumns() {
  console.log('🔍 Checking bookings table columns...');
  
  try {
    // Check table columns
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `;
    
    console.log('📊 Bookings table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });
    
    // Get a sample booking
    const sample = await sql`
      SELECT * FROM bookings LIMIT 1
    `;
    
    if (sample.length > 0) {
      console.log('\n📋 Sample booking record:');
      console.log(JSON.stringify(sample[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkBookingsColumns();
