const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkVendorProfilesData() {
  console.log('🔍 Checking vendor_profiles table data...');
  
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Get all vendor profiles
    const vendorProfiles = await sql`
      SELECT 
        vp.id,
        vp.user_id,
        vp.business_name,
        vp.business_type,
        vp.business_description,
        vp.phone_verified,
        vp.business_verified,
        vp.verification_status,
        vp.featured_image_url,
        vp.created_at,
        u.email,
        u.first_name,
        u.last_name,
        u.email_verified,
        u.phone_verified as user_phone_verified
      FROM vendor_profiles vp
      LEFT JOIN users u ON vp.user_id = u.id
      ORDER BY vp.created_at DESC;
    `;
    
    console.log('\n📋 All vendor profiles in database:');
    console.log('Count:', vendorProfiles.length);
    
    vendorProfiles.forEach((vendor, index) => {
      console.log(`\n${index + 1}. Vendor Profile:`);
      console.log(`   ID: ${vendor.id}`);
      console.log(`   User ID: ${vendor.user_id}`);
      console.log(`   Business Name: ${vendor.business_name}`);
      console.log(`   Business Type: ${vendor.business_type}`);
      console.log(`   Email: ${vendor.email}`);
      console.log(`   Email Verified: ${vendor.email_verified}`);
      console.log(`   Phone Verified (VP): ${vendor.phone_verified}`);
      console.log(`   Phone Verified (User): ${vendor.user_phone_verified}`);
      console.log(`   Business Verified: ${vendor.business_verified}`);
      console.log(`   Verification Status: ${vendor.verification_status}`);
      console.log(`   Created: ${vendor.created_at}`);
    });

    // Also check users table for vendor users
    console.log('\n📋 Users with vendor role:');
    const vendorUsers = await sql`
      SELECT id, email, first_name, last_name, user_type, email_verified, phone_verified
      FROM users 
      WHERE user_type = 'vendor'
      ORDER BY created_at DESC;
    `;
    
    vendorUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Vendor User:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email Verified: ${user.email_verified}`);
      console.log(`   Phone Verified: ${user.phone_verified}`);
    });

    // Test getting a specific vendor profile
    if (vendorProfiles.length > 0) {
      const testVendorId = vendorProfiles[0].id;
      console.log(`\n🧪 Testing vendor profile endpoint with ID: ${testVendorId}`);
      
      const profileTest = await sql`
        SELECT 
          vp.*,
          u.email,
          u.first_name,
          u.last_name,
          u.phone,
          u.email_verified,
          u.created_at as user_created_at,
          u.updated_at as user_updated_at
        FROM vendor_profiles vp
        INNER JOIN users u ON vp.user_id = u.id
        WHERE vp.id = ${testVendorId}
      `;
      
      console.log('Profile query result:', profileTest[0]);
    }

  } catch (error) {
    console.error('❌ Error checking vendor profiles:', error);
    console.error('Error details:', error.message);
  }
}

checkVendorProfilesData();
