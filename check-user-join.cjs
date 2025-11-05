const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  try {
    console.log('🔍 Checking user data for couple_id: 1-2025-001\n');
    
    const user = await sql`
      SELECT id, email, full_name, first_name, last_name, role
      FROM users 
      WHERE id = '1-2025-001'
    `;
    
    if (user.length > 0) {
      console.log('✓ User found:');
      console.log(JSON.stringify(user[0], null, 2));
    } else {
      console.log('❌ User not found');
    }
    
    console.log('\n🔍 Checking if we can join booking with user...\n');
    
    const joinedData = await sql`
      SELECT 
        b.id,
        b.couple_id,
        b.couple_name as booking_couple_name,
        b.contact_person,
        b.contact_email,
        u.id as user_id,
        u.full_name,
        u.first_name,
        u.last_name,
        u.email
      FROM bookings b
      LEFT JOIN users u ON b.couple_id = u.id
      WHERE b.couple_id = '1-2025-001'
      LIMIT 1
    `;
    
    if (joinedData.length > 0) {
      console.log('✓ Joined data:');
      console.log(JSON.stringify(joinedData[0], null, 2));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
