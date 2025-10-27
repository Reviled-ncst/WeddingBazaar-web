/**
 * Add missing completion_notes column to bookings table
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addCompletionNotes() {
  console.log('🔧 Adding completion_notes column to bookings table...');
  
  try {
    // Add completion_notes column
    await sql`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS completion_notes TEXT
    `;
    
    console.log('✅ completion_notes column added');
    
    // Verify column exists
    const result = await sql`
      SELECT 
        column_name, 
        data_type, 
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'bookings' 
      AND column_name = 'completion_notes'
    `;
    
    if (result.length > 0) {
      console.log('\n✅ Verification successful:');
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log('\n❌ Column not found after migration');
    }
    
  } catch (error) {
    console.error('❌ Error adding completion_notes:', error.message);
    throw error;
  }
}

addCompletionNotes()
  .then(() => {
    console.log('\n✅ Migration complete!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
