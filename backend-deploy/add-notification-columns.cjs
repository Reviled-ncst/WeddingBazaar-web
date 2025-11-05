/**
 * Add missing columns to notifications table
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function addMissingColumns() {
  console.log('🔧 Adding missing columns to notifications table...');

  try {
    // Add priority column
    await sql`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS priority VARCHAR(10) DEFAULT 'medium'
      CHECK (priority IN ('high', 'medium', 'low'))
    `;
    console.log('✅ Added priority column');

    // Add booking_id column
    await sql`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS booking_id VARCHAR(255)
    `;
    console.log('✅ Added booking_id column');

    // Add couple_id column
    await sql`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS couple_id VARCHAR(255)
    `;
    console.log('✅ Added couple_id column');

    // Add action_required column
    await sql`
      ALTER TABLE notifications
      ADD COLUMN IF NOT EXISTS action_required BOOLEAN DEFAULT FALSE
    `;
    console.log('✅ Added action_required column');

    // Create index on booking_id
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_booking 
      ON notifications(booking_id)
    `;
    console.log('✅ Created index on booking_id');

    console.log('\n✅ All missing columns added successfully!');

  } catch (error) {
    console.error('❌ Error adding columns:', error);
    throw error;
  }
}

addMissingColumns()
  .then(() => {
    console.log('\n🎉 Migration complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
