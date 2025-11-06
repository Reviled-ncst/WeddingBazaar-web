const { sql } = require('./backend-deploy/config/database.cjs');

async function checkNotifications() {
  console.log('🔍 Checking notifications table...');
  
  try {
    // Check if table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'notifications'
      )
    `;
    
    console.log('✅ Table exists:', tableCheck[0].exists);
    
    if (tableCheck[0].exists) {
      // Count total notifications
      const total = await sql`SELECT COUNT(*) as count FROM notifications`;
      console.log(`📊 Total notifications: ${total[0].count}`);
      
      // Count by user type
      const byType = await sql`
        SELECT user_type, COUNT(*) as count 
        FROM notifications 
        GROUP BY user_type
      `;
      console.log('📊 By user type:', byType);
      
      // Count unread
      const unread = await sql`
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE is_read = FALSE
      `;
      console.log(`📊 Unread notifications: ${unread[0].count}`);
      
      // Show sample notifications
      const sample = await sql`
        SELECT id, user_id, user_type, title, type, is_read, created_at 
        FROM notifications 
        ORDER BY created_at DESC 
        LIMIT 5
      `;
      console.log('📋 Recent notifications:', JSON.stringify(sample, null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkNotifications();
