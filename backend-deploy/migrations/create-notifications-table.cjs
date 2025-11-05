/**
 * Create notifications table for real-time vendor notifications
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createNotificationsTable() {
  console.log('🚀 Creating notifications table...');

  try {
    // Create notifications table (compatible with existing VARCHAR ID schema)
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('vendor', 'individual', 'admin')),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
        booking_id VARCHAR(255),
        couple_id VARCHAR(255),
        is_read BOOLEAN DEFAULT FALSE,
        action_required BOOLEAN DEFAULT FALSE,
        action_url VARCHAR(500),
        metadata JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Notifications table created successfully');

    // Create indexes for performance
    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_user 
      ON notifications(user_id, user_type, created_at DESC)
    `;
    console.log('✅ Index on user_id created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_read 
      ON notifications(user_id, is_read)
    `;
    console.log('✅ Index on read status created');

    await sql`
      CREATE INDEX IF NOT EXISTS idx_notifications_booking 
      ON notifications(booking_id)
    `;
    console.log('✅ Index on booking_id created');

    // Verify table exists
    const tableCheck = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    `;
    
    if (tableCheck.length > 0) {
      console.log('✅ Notifications table verified');
    } else {
      console.log('⚠️ Warning: Table creation may have failed');
    }

    console.log('\n✅ Notifications table setup complete!');
    console.log('\n📊 Table Structure:');
    console.log('   - id (VARCHAR, PK)');
    console.log('   - user_id (VARCHAR) - vendor/user ID');
    console.log('   - user_type (VARCHAR) - vendor, individual, admin');
    console.log('   - type (VARCHAR) - notification type');
    console.log('   - title (VARCHAR)');
    console.log('   - message (TEXT)');
    console.log('   - priority (high, medium, low)');
    console.log('   - booking_id (VARCHAR)');
    console.log('   - couple_id (VARCHAR)');
    console.log('   - is_read (BOOLEAN)');
    console.log('   - action_required (BOOLEAN)');
    console.log('   - action_url (VARCHAR)');
    console.log('   - metadata (JSONB)');
    console.log('   - created_at, updated_at (TIMESTAMP)');

  } catch (error) {
    console.error('❌ Error creating notifications table:', error);
    throw error;
  }
}

// Run migration
createNotificationsTable()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
