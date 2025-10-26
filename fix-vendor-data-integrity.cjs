/**
 * Fix vendor data integrity issue
 * 
 * Problem: vendor_profiles exists but vendors table is missing the record
 * Solution: Create vendor record from vendor_profiles data
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function fixVendorData() {
  console.log('🔧 Starting vendor data integrity fix...\n');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    // 1. Check if vendor exists in vendors table
    const vendorId = '2-2025-003';
    console.log(`🔍 Checking if vendor ${vendorId} exists in vendors table...`);
    
    const existingVendor = await sql`
      SELECT * FROM vendors WHERE id = ${vendorId}
    `;
    
    if (existingVendor.length > 0) {
      console.log('✅ Vendor already exists in vendors table:');
      console.table(existingVendor);
      console.log('\n✨ No fix needed!');
      return;
    }
    
    console.log('⚠️  Vendor NOT found in vendors table');
    
    // 2. Get vendor profile data
    console.log('\n🔍 Fetching vendor profile data...');
    const vendorProfile = await sql`
      SELECT * FROM vendor_profiles WHERE user_id = ${vendorId}
    `;
    
    if (vendorProfile.length === 0) {
      console.error('❌ Vendor profile not found! Cannot create vendor record.');
      process.exit(1);
    }
    
    console.log('✅ Vendor profile found:');
    console.table(vendorProfile);
    
    // 3. Get user data
    console.log('\n🔍 Fetching user data...');
    const userData = await sql`
      SELECT * FROM users WHERE id = ${vendorId}
    `;
    
    if (userData.length === 0) {
      console.error('❌ User data not found! Cannot create vendor record.');
      process.exit(1);
    }
    
    console.log('✅ User data found:');
    console.table(userData);
    
    // 4. Create vendor record
    console.log('\n📝 Creating vendor record...');
    const profile = vendorProfile[0];
    const user = userData[0];
    
    // First, let's check what columns exist in vendors table
    console.log('\n🔍 Checking vendors table schema...');
    const schemaCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'vendors'
      ORDER BY ordinal_position
    `;
    
    console.log('Available columns in vendors table:');
    console.log(schemaCheck.map(c => c.column_name).join(', '));
    
    // Create vendor record with correct schema columns
    const newVendor = await sql`
      INSERT INTO vendors (
        id,
        user_id,
        business_name,
        business_type,
        description,
        location,
        rating,
        review_count,
        verified,
        created_at,
        updated_at
      ) VALUES (
        ${vendorId},
        ${vendorId},
        ${profile.business_name || 'Vendor Business'},
        ${profile.business_type || 'Other'},
        ${profile.business_description || ''},
        ${profile.service_areas && profile.service_areas.length > 0 ? profile.service_areas[0] : ''},
        0.0,
        0,
        ${profile.business_verified || false},
        NOW(),
        NOW()
      )
      RETURNING *
    `;
    
    console.log('✅ Vendor record created successfully:');
    console.table(newVendor);
    
    // 5. Verify the fix
    console.log('\n🔍 Verifying vendor record...');
    const verification = await sql`
      SELECT * FROM vendors WHERE id = ${vendorId}
    `;
    
    if (verification.length > 0) {
      console.log('✅ Verification successful! Vendor record exists:');
      console.table(verification);
      
      console.log('\n✨ Fix completed successfully!');
      console.log('\n📝 Summary:');
      console.log('  ✅ Vendor record created in vendors table');
      console.log(`  ✅ Vendor ID: ${vendorId}`);
      console.log(`  ✅ Business: ${verification[0].business_name}`);
      console.log(`  ✅ Email: ${verification[0].email}`);
      console.log('\n🎯 You can now create services with this vendor!');
    } else {
      console.error('❌ Verification failed! Vendor record not found after creation.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error fixing vendor data:', error);
    console.error('\nError details:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.detail) {
      console.error('Error detail:', error.detail);
    }
    process.exit(1);
  }
}

// Run the fix
fixVendorData()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
