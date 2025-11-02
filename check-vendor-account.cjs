require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkVendorAccount() {
  console.log('🔍 Checking vendor account: vendor0qw@gmail.com\n');
  
  try {
    // Find user account
    const users = await sql`
      SELECT id, email, first_name, last_name, user_type as role, created_at
      FROM users
      WHERE email = 'vendor0qw@gmail.com'
    `;
    
    if (users.length === 0) {
      console.log('❌ User not found with email: vendor0qw@gmail.com');
      return;
    }
    
    const user = users[0];
    console.log('✅ User found:');
    console.log('   User ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', `${user.first_name} ${user.last_name}`);
    console.log('   Role:', user.role);
    console.log('   Created:', user.created_at);
    console.log('');
    
    // Find vendor profile
    console.log('🔍 Looking for vendor profile...\n');
    
    const vendors = await sql`
      SELECT id, user_id, business_name, business_type, created_at
      FROM vendors
      WHERE user_id = ${user.id}
    `;
    
    if (vendors.length === 0) {
      console.log('❌ NO VENDOR PROFILE found for this user!');
      console.log('   User ID:', user.id);
      console.log('');
      console.log('⚠️  This means the vendor registration did NOT create a vendors table entry!');
      console.log('   The fix we implemented should have created this.');
      console.log('');
      console.log('🔧 SOLUTION: We need to create the vendor profile now.');
      return;
    }
    
    const vendor = vendors[0];
    console.log('✅ Vendor profile found:');
    console.log('   Vendor ID:', vendor.id);
    console.log('   User ID:', vendor.user_id);
    console.log('   Business Name:', vendor.business_name);
    console.log('   Business Type:', vendor.business_type);
    console.log('   Created:', vendor.created_at);
    console.log('');
    
    // Check vendor_profiles table too
    const vendorProfiles = await sql`
      SELECT id, user_id, business_name, created_at
      FROM vendor_profiles
      WHERE user_id = ${user.id}
    `;
    
    console.log('📊 Vendor Profiles Table:');
    if (vendorProfiles.length > 0) {
      console.log('   Profile ID:', vendorProfiles[0].id);
      console.log('   User ID:', vendorProfiles[0].user_id);
      console.log('   Business Name:', vendorProfiles[0].business_name);
    } else {
      console.log('   ❌ No entry in vendor_profiles table');
    }
    console.log('');
    
    // Check services created by this vendor
    console.log('🔍 Checking services created by this vendor...\n');
    
    const services = await sql`
      SELECT id, vendor_id, title, created_at
      FROM services
      WHERE vendor_id = ${vendor.id}
      ORDER BY created_at DESC
    `;
    
    console.log(`📊 Found ${services.length} services:`);
    services.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} (ID: ${service.id}, Created: ${service.created_at})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkVendorAccount();
