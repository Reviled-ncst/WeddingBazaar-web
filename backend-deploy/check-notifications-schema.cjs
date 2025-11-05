/**
 * Check notifications table schema
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkNotificationsTable() {
  console.log('🔍 Checking notifications table schema...');

  try {
    // Check if table exists
    const tableExists = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'notifications'
    `;

    if (tableExists.length === 0) {
      console.log('❌ Notifications table does not exist');
      return;
    }

    console.log('✅ Notifications table exists');

    // Get column information
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position
    `;

    console.log('\n📋 Table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
    });

    // Get indexes
    const indexes = await sql`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE tablename = 'notifications'
    `;

    console.log('\n🔑 Indexes:');
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });

    // Count notifications
    const count = await sql`
      SELECT COUNT(*)::int as count FROM notifications
    `;

    console.log(`\n📊 Total notifications: ${count[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkNotificationsTable();
