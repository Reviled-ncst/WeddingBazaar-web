const { sql } = require('./backend-deploy/config/database.cjs');

async function addBookingIdToReviews() {
  try {
    console.log('🔧 Adding booking_id column to reviews table...');
    
    // Check if column already exists
    const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'booking_id'
    `;
    
    if (columnCheck.length > 0) {
      console.log('✅ booking_id column already exists');
      process.exit(0);
    }
    
    // Add the column (INTEGER to match bookings.id type)
    await sql`
      ALTER TABLE reviews 
      ADD COLUMN booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE
    `;
    
    console.log('✅ booking_id column added successfully');
    
    // Verify
    const verify = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' AND column_name = 'booking_id'
    `;
    
    console.log('📋 Verification:', verify[0]);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addBookingIdToReviews();
