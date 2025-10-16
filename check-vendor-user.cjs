const { sql } = require('./backend-deploy/config/database.cjs');

async function checkVendorUser() {
  try {
    console.log('🔍 Checking vendor user details...');
    
    // Check the actual vendor user
    const vendorUser = await sql`
      SELECT id, email, user_type, first_name, last_name 
      FROM users 
      WHERE email = 'renzrusselbauto@gmail.com'
    `;
    
    console.log('👤 Vendor user:', vendorUser[0]);
    
    // Check if there's a vendor profile
    if (vendorUser.length > 0) {
      const vendorProfile = await sql`
        SELECT id, user_id, business_name, business_type
        FROM vendor_profiles 
        WHERE user_id = ${vendorUser[0].id}
      `;
      
      console.log('🏢 Vendor profile:', vendorProfile[0]);
      
      // Simulate what the login endpoint would return
      console.log('🔄 What login endpoint would return:');
      console.log({
        success: true,
        user: {
          id: vendorUser[0].id,
          email: vendorUser[0].email,
          userType: vendorUser[0].user_type, // This is the key field!
          firstName: vendorUser[0].first_name,
          lastName: vendorUser[0].last_name,
          emailVerified: false,
          phoneVerified: false,
          vendorId: vendorProfile[0]?.id || null
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

checkVendorUser();
