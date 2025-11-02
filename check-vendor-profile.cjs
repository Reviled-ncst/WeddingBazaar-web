/**
 * Check if vendor profile exists for user 2-2025-003
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkVendorProfile() {
  console.log('\n🔍 CHECKING VENDOR PROFILE\n');
  console.log('='.repeat(60));

  const userId = '2-2025-003'; // vendor0qw@gmail.com
  
  try {
    // Check user record
    console.log('\n1️⃣ Checking users table...');
    const user = await sql`
      SELECT id, email, user_type, role 
      FROM users 
      WHERE id = ${userId}
    `;
    
    if (user.length > 0) {
      console.log('✅ User found:');
      console.log('   Email:', user[0].email);
      console.log('   User Type:', user[0].user_type);
      console.log('   Role:', user[0].role);
    } else {
      console.log('❌ User not found');
      return;
    }
    
    // Check vendor profile
    console.log('\n2️⃣ Checking vendors table...');
    const vendor = await sql`
      SELECT id, user_id, business_name, business_type 
      FROM vendors 
      WHERE user_id = ${userId}
    `;
    
    if (vendor.length > 0) {
      console.log('✅ Vendor profile found:');
      console.log('   Vendor ID:', vendor[0].id);
      console.log('   Business Name:', vendor[0].business_name);
      console.log('   Business Type:', vendor[0].business_type);
      console.log('\n📊 DIAGNOSIS: User has vendor profile ✅');
      console.log('   Use this vendor_id when creating services:', vendor[0].id);
    } else {
      console.log('❌ NO vendor profile found for this user');
      console.log('\n📊 DIAGNOSIS: User exists but NO vendor profile');
      console.log('\n💡 SOLUTION:');
      console.log('   1. User needs to complete vendor onboarding');
      console.log('   2. Create vendor profile in vendors table');
      console.log('   3. Then can create services');
    }
    
    console.log('\n' + '='.repeat(60));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkVendorProfile();
