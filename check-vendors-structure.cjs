/**
 * Check what vendor records exist in the database
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function checkVendors() {
  console.log('🔍 Checking vendors table...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // Check all vendors
    console.log('📋 All vendors in vendors table:');
    const allVendors = await sql`SELECT id, business_name, business_type, verified FROM vendors LIMIT 10`;
    console.table(allVendors);

    // Check vendor_profiles for user 2-2025-003
    console.log('\n📋 Vendor profile for user 2-2025-003:');
    const vendorProfile = await sql`SELECT * FROM vendor_profiles WHERE user_id = '2-2025-003'`;
    console.table(vendorProfile);

    // Check users table
    console.log('\n📋 User record for 2-2025-003:');
    const user = await sql`SELECT id, email, role FROM users WHERE id = '2-2025-003'`;
    console.table(user);

    console.log('\n✅ Check complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkVendors();
