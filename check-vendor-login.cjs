const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkVendorLogin() {
  try {
    console.log('Checking vendor login data...');
    
    // Check user
    const users = await sql`SELECT * FROM users WHERE email = 'vendor0@gmail.com'`;
    console.log('User data:', users);
    
    // Check vendor profile
    if (users.length > 0) {
      const userId = users[0].id;
      try {
        const vendorProfiles = await sql`SELECT * FROM vendor_profiles WHERE user_id = ${userId}`;
        console.log('Vendor profile:', vendorProfiles);
      } catch (vpError) {
        console.log('No vendor_profiles table or error:', vpError.message);
      }
      
      try {
        const vendors = await sql`SELECT * FROM vendors WHERE user_id = ${userId}`;
        console.log('Vendors table:', vendors);
      } catch (vError) {
        console.log('No vendors table or error:', vError.message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkVendorLogin();
