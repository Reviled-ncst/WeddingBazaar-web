const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function checkAllVendors() {
  try {
    console.log('=== CHECKING ALL VENDOR ACCOUNTS ===\n');
    
    // 1. All users with vendor profiles
    console.log('1. All Users with Vendor Profiles:');
    const usersWithVendors = await sql`
      SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.user_type,
        u.email_verified,
        u.phone_verified,
        vp.id as vendor_profile_id,
        vp.business_name,
        vp.business_type,
        vp.verification_status,
        vp.documents_verified,
        vp.business_verified
      FROM users u
      LEFT JOIN vendor_profiles vp ON u.id = vp.user_id
      WHERE u.user_type = 'vendor'
      ORDER BY u.created_at DESC
    `;
    console.log(JSON.stringify(usersWithVendors, null, 2));
    
    // 2. Search for any user with email containing 'alison'
    console.log('\n2. Users with email containing "alison":');
    const alisonUsers = await sql`
      SELECT id, email, first_name, last_name, user_type, email_verified, created_at
      FROM users 
      WHERE LOWER(email) LIKE '%alison%'
    `;
    console.log(JSON.stringify(alisonUsers, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAllVendors();
