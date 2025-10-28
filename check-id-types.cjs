const { sql } = require('./backend-deploy/config/database.cjs');

async function checkIdTypes() {
  try {
    console.log('🔍 Checking ID column types...');
    
    const bookingsId = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'id'
    `;
    
    const reviewsUserId = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'user_id'
    `;
    
    console.log('\n📋 Bookings ID type:', bookingsId[0]);
    console.log('📋 Reviews user_id type:', reviewsUserId[0]);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkIdTypes();
