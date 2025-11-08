/**
 * 🔍 Check Vendor 2-2025-019 Profile Issue
 * 
 * This vendor can't create services - let's see why
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkVendor() {
  try {
    console.log('🔍 Checking vendor 2-2025-019...\n');
    console.log('━'.repeat(80));
    
    // Check user account
    console.log('\n👤 USER ACCOUNT CHECK:');
    const user = await sql`
      SELECT * FROM users WHERE id = '2-2025-019'
    `;
    
    if (user.length === 0) {
      console.log('❌ User with ID 2-2025-019 NOT FOUND');
    } else {
      console.log('✅ User found:');
      console.log('   ID:', user[0].id);
      console.log('   Email:', user[0].email);
      console.log('   Name:', user[0].first_name, user[0].last_name);
      console.log('   User Type:', user[0].user_type);
    }
    
    // Check vendor profile using user_id
    console.log('\n🏢 VENDOR PROFILE CHECK (by user_id):');
    const vendorByUserId = await sql`
      SELECT * FROM vendors WHERE user_id = '2-2025-019'
    `;
    
    if (vendorByUserId.length === 0) {
      console.log('❌ Vendor profile with user_id = 2-2025-019 NOT FOUND');
    } else {
      console.log('✅ Vendor profile found:');
      console.log('   Vendor ID:', vendorByUserId[0].id);
      console.log('   User ID:', vendorByUserId[0].user_id);
      console.log('   Business Name:', vendorByUserId[0].business_name);
      console.log('   Business Type:', vendorByUserId[0].business_type);
    }
    
    // Check vendor profile using id (what backend is looking for)
    console.log('\n🏢 VENDOR PROFILE CHECK (by id = 2-2025-019):');
    const vendorById = await sql`
      SELECT * FROM vendors WHERE id = '2-2025-019'
    `;
    
    if (vendorById.length === 0) {
      console.log('❌ Vendor profile with id = 2-2025-019 NOT FOUND');
      console.log('   This is why the backend returns 403 Forbidden!');
    } else {
      console.log('✅ Vendor profile found with id = 2-2025-019');
    }
    
    // Check all vendors for this user
    console.log('\n📊 ALL VENDOR PROFILES FOR THIS USER:');
    const allVendors = await sql`
      SELECT id, user_id, business_name, business_type 
      FROM vendors 
      WHERE user_id = '2-2025-019'
    `;
    
    console.log(`Found ${allVendors.length} vendor profile(s):\n`);
    allVendors.forEach((v, i) => {
      console.log(`${i+1}. Vendor ID: ${v.id}`);
      console.log(`   User ID: ${v.user_id}`);
      console.log(`   Business: ${v.business_name}`);
      console.log(`   Type: ${v.business_type}`);
      console.log('');
    });
    
    // Check what the backend should be receiving
    console.log('━'.repeat(80));
    console.log('\n🔧 DIAGNOSIS:\n');
    
    if (vendorByUserId.length > 0 && vendorById.length === 0) {
      console.log('❌ MISMATCH DETECTED:');
      console.log('   Frontend is sending: vendor_id = "2-2025-019" (USER ID)');
      console.log(`   Actual vendor_id should be: "${vendorByUserId[0].id}"`);
      console.log('   Backend is looking for vendor with id = "2-2025-019" (NOT FOUND)');
      console.log('\n💡 SOLUTION:');
      console.log('   Frontend must send the VENDOR ID, not the USER ID!');
      console.log(`   Correct vendor_id: ${vendorByUserId[0].id}`);
    }
    
    console.log('\n' + '━'.repeat(80));
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\n📋 Full error:', error.message);
    process.exit(1);
  }
}

checkVendor();
