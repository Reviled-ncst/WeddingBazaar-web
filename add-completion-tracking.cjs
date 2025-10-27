/**
 * Add completion tracking fields to bookings table
 * Two-sided completion system: both vendor and couple must confirm
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addCompletionTracking() {
  console.log('🔧 Adding completion tracking fields to bookings table...');
  
  try {
    // Add completion tracking columns
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS vendor_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS vendor_completed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS couple_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS couple_completed_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS fully_completed BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS fully_completed_at TIMESTAMP
    `;
    
    console.log('✅ Completion tracking columns added');
    
    // Create index for completion queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_bookings_completion 
      ON bookings(vendor_completed, couple_completed, fully_completed)
    `;
    
    console.log('✅ Completion tracking index created');
    
    // Verify columns exist
    const result = await sql`
      SELECT 
        column_name, 
        data_type, 
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name IN (
        'vendor_completed', 
        'vendor_completed_at',
        'couple_completed',
        'couple_completed_at',
        'fully_completed',
        'fully_completed_at'
      )
      ORDER BY column_name
    `;
    
    console.log('\n📊 Completion tracking columns:');
    result.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (default: ${col.column_default})`);
    });
    
    console.log('\n✅ Completion tracking setup complete!');
    
  } catch (error) {
    console.error('❌ Error adding completion tracking:', error);
    throw error;
  }
}

// Run migration
addCompletionTracking()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
