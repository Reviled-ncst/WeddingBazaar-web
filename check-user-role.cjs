const { sql } = require('./backend-deploy/config/database.cjs');

async function checkUserRole() {
  try {
    console.log('🔍 Checking user roles in database...');
    
    // Check the test vendor user
    const testUser = await sql`
      SELECT id, email, user_type, first_name, last_name 
      FROM users 
      WHERE email = 'testvendor@example.com'
    `;
    
    console.log('👤 Test vendor user:', testUser[0]);
    
    // Check if there's a vendor profile
    if (testUser.length > 0) {
      const vendorProfile = await sql`
        SELECT id, user_id, business_name, business_type
        FROM vendor_profiles 
        WHERE user_id = ${testUser[0].id}
      `;
      
      console.log('🏢 Vendor profile:', vendorProfile[0]);
    }
    
    // Check all users to see roles
    const allUsers = await sql`
      SELECT id, email, user_type, first_name, last_name 
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log('📋 Recent users:');
    allUsers.forEach(user => {
      console.log(`  ${user.email} - ${user.user_type} (ID: ${user.id})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

checkUserRole();
