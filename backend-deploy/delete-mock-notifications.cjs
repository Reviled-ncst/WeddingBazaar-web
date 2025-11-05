/**
 * DELETE MOCK NOTIFICATIONS FROM DATABASE
 * Run this script to remove all fake/mock notifications
 */

const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:B43nD84qlO7v@ep-summer-feather-a16e9fzu.ap-southeast-1.aws.neon.tech/neondb?sslmode=require');

async function deleteMockNotifications() {
  console.log('🗑️ Deleting mock notifications...');
  
  try {
    // Delete notifications with mock titles
    const result = await sql`
      DELETE FROM notifications 
      WHERE title IN ('New Message', 'Profile Update Needed', 'New Booking Request')
      AND message LIKE '%sample%' OR message LIKE '%business hours%' OR message LIKE '%DJ services%'
      RETURNING id, title
    `;
    
    console.log(`✅ Deleted ${result.length} mock notifications:`);
    result.forEach(notif => {
      console.log(`   - ${notif.title} (ID: ${notif.id})`);
    });
    
    // Show remaining notifications
    const remaining = await sql`
      SELECT id, title, message, user_id, created_at 
      FROM notifications 
      ORDER BY created_at DESC
    `;
    
    console.log(`\n📊 Remaining notifications: ${remaining.length}`);
    if (remaining.length > 0) {
      console.log('Remaining notifications:');
      remaining.forEach(notif => {
        console.log(`   - ${notif.title} | User: ${notif.user_id} | ${new Date(notif.created_at).toLocaleString()}`);
      });
    } else {
      console.log('✅ No notifications remaining (clean slate!)');
    }
    
  } catch (error) {
    console.error('❌ Error deleting mock notifications:', error);
    throw error;
  }
}

// Run the cleanup
deleteMockNotifications()
  .then(() => {
    console.log('\n✅ Cleanup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  });
