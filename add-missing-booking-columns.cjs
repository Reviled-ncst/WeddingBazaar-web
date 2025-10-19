const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addMissingColumns() {
  console.log('🔧 Starting database migration: Adding missing booking columns...');
  
  try {
    // Add missing columns
    console.log('📝 Adding event_end_time column...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS event_end_time TIME`;
    
    console.log('📝 Adding venue_details column...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS venue_details TEXT`;
    
    console.log('📝 Adding contact_person column...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255)`;
    
    console.log('📝 Adding contact_email column...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)`;
    
    console.log('📝 Adding vendor_name column...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255)`;
    
    console.log('📝 Adding couple_name column...');
    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS couple_name VARCHAR(255)`;
    
    // Create indexes for better performance
    console.log('📊 Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_vendor_name ON bookings(vendor_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_couple_name ON bookings(couple_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_contact_email ON bookings(contact_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_event_end_time ON bookings(event_end_time)`;
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    
    // Verify columns exist
    console.log('🔍 Verifying columns...');
    const columns = await sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
        AND column_name IN ('event_end_time', 'venue_details', 'contact_person', 'contact_email', 'vendor_name', 'couple_name')
      ORDER BY column_name
    `;
    
    console.log('📋 Added columns:');
    console.table(columns);
    
    // Show sample booking with new fields
    console.log('');
    console.log('📊 Sample booking record:');
    const sampleBooking = await sql`
      SELECT id, vendor_name, couple_name, contact_person, contact_email, 
             event_end_time, venue_details, event_date, status
      FROM bookings 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    console.table(sampleBooking);
    
    console.log('');
    console.log('🎉 All done! The bookings table now has all required columns.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run migration
addMissingColumns()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
