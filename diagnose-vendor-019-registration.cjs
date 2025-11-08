#!/usr/bin/env node

/**
 * 🔍 Vendor 2-2025-019 Registration Diagnostic
 * 
 * This script checks:
 * 1. Does user 2-2025-019 exist?
 * 2. Does vendor_profiles entry exist?
 * 3. Does vendors table entry exist?
 * 4. What data is missing?
 * 5. Can we manually create the missing entries?
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function diagnoseVendor019() {
  console.log('🔍 VENDOR 2-2025-019 REGISTRATION DIAGNOSTIC');
  console.log('='.repeat(80));
  console.log('\n');

  try {
    const vendorId = '2-2025-019';
    
    // 1. Check if user exists
    console.log('📋 STEP 1: Checking users table...');
    const userResult = await sql`
      SELECT * FROM users WHERE id = ${vendorId}
    `;
    
    if (userResult.length === 0) {
      console.log('❌ User 2-2025-019 NOT FOUND in users table');
      console.log('   Registration never completed - user account was never created');
      process.exit(1);
    }
    
    const user = userResult[0];
    console.log('✅ User found in users table:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.first_name} ${user.last_name || ''}`);
    console.log(`   Role: ${user.user_type}`);
    console.log(`   Created: ${user.created_at}`);
    console.log(`   Has Password: ${user.password ? 'Yes' : 'No'}`);
    
    // 2. Check vendor_profiles table
    console.log('\n📋 STEP 2: Checking vendor_profiles table...');
    const vendorProfileResult = await sql`
      SELECT * FROM vendor_profiles WHERE user_id = ${vendorId}
    `;
    
    if (vendorProfileResult.length === 0) {
      console.log('❌ NO vendor_profiles entry found');
      console.log('   Registration Step 2 (vendor profile creation) FAILED or was SKIPPED');
    } else {
      const profile = vendorProfileResult[0];
      console.log('✅ Vendor profile found:');
      console.log(`   User ID: ${profile.user_id}`);
      console.log(`   Business Name: ${profile.business_name || 'NULL'}`);
      console.log(`   Business Type: ${profile.business_type || 'NULL'}`);
      console.log(`   Vendor Type: ${profile.vendor_type || 'NULL'}`);
      console.log(`   Created: ${profile.created_at}`);
    }
    
    // 3. Check vendors (legacy) table
    console.log('\n📋 STEP 3: Checking vendors (legacy) table...');
    const vendorsResult = await sql`
      SELECT * FROM vendors WHERE user_id = ${vendorId}
    `;
    
    if (vendorsResult.length === 0) {
      console.log('❌ NO vendors table entry found');
      console.log('   Registration Step 3 (legacy vendors table) FAILED or was SKIPPED');
    } else {
      const vendor = vendorsResult[0];
      console.log('✅ Vendors table entry found:');
      console.log(`   Vendor ID: ${vendor.id}`);
      console.log(`   User ID: ${vendor.user_id}`);
      console.log(`   Business Name: ${vendor.business_name || 'NULL'}`);
      console.log(`   Business Type: ${vendor.business_type || 'NULL'}`);
      console.log(`   Created: ${vendor.created_at}`);
    }
    
    // 4. Check services table
    console.log('\n📋 STEP 4: Checking services table...');
    const servicesResult = await sql`
      SELECT COUNT(*) as count FROM services WHERE vendor_id IN (
        SELECT id FROM vendors WHERE user_id = ${vendorId}
      )
    `;
    
    const serviceCount = servicesResult[0]?.count || 0;
    if (serviceCount > 0) {
      console.log(`✅ ${serviceCount} services found (vendor can create services)`);
    } else {
      console.log('❌ No services found');
      console.log('   Vendor cannot create services without vendor_profiles + vendors entries');
    }
    
    // 5. Diagnosis
    console.log('\n\n' + '='.repeat(80));
    console.log('🔬 DIAGNOSIS:');
    console.log('='.repeat(80));
    
    const hasUser = userResult.length > 0;
    const hasVendorProfile = vendorProfileResult.length > 0;
    const hasVendorsEntry = vendorsResult.length > 0;
    
    if (hasUser && !hasVendorProfile && !hasVendorsEntry) {
      console.log('\n🚨 CRITICAL ISSUE: INCOMPLETE REGISTRATION');
      console.log('   Scenario: User account created, but vendor profiles NOT created');
      console.log('\n   Possible Causes:');
      console.log('   1. ❌ Missing business_name or business_type during registration');
      console.log('   2. ❌ SQL error during vendor_profiles INSERT');
      console.log('   3. ❌ Server crash/restart after user INSERT but before profile INSERT');
      console.log('   4. ❌ Database transaction rollback (partial commit)');
      console.log('   5. ❌ Frontend sent incomplete data (validation bypassed)');
      
      console.log('\n   What the user would experience:');
      console.log('   - ✅ Can login successfully');
      console.log('   - ❌ Cannot create services (403 Forbidden)');
      console.log('   - ❌ Vendor dashboard shows "Profile Incomplete"');
      console.log('   - ❌ Not visible in vendor listings');
      
    } else if (hasUser && hasVendorProfile && !hasVendorsEntry) {
      console.log('\n⚠️  MINOR ISSUE: Missing legacy vendors table entry');
      console.log('   Scenario: User + vendor_profiles exist, but vendors table missing');
      console.log('\n   Possible Causes:');
      console.log('   1. ⚠️  vendors table INSERT failed (caught exception)');
      console.log('   2. ⚠️  vendors table doesn\'t exist in database');
      console.log('   3. ⚠️  Database permissions issue');
      
      console.log('\n   Impact:');
      console.log('   - ✅ Can login');
      console.log('   - ⚠️  May have issues creating services (depends on endpoint)');
      console.log('   - ⚠️  May not appear in some vendor listings');
      
    } else if (hasUser && hasVendorProfile && hasVendorsEntry) {
      console.log('\n✅ NO ISSUES FOUND');
      console.log('   All registration steps completed successfully');
      console.log('   Vendor should be fully functional');
    }
    
    // 6. Remediation plan
    console.log('\n\n' + '='.repeat(80));
    console.log('🔧 REMEDIATION PLAN:');
    console.log('='.repeat(80));
    
    if (!hasVendorProfile || !hasVendorsEntry) {
      console.log('\n📝 Option 1: Manual Profile Creation (RECOMMENDED)');
      console.log('   Run: node fix-vendor-019-profile.cjs');
      console.log('   This will create missing vendor_profiles and vendors entries');
      
      console.log('\n📝 Option 2: Ask User to Re-register');
      console.log('   1. Delete incomplete user: DELETE FROM users WHERE id = \'2-2025-019\'');
      console.log('   2. User registers again with complete information');
      console.log('   3. Ensure RegisterModal validation is working correctly');
      
      console.log('\n📝 Option 3: Complete Profile Via UI');
      console.log('   1. User logs in with existing credentials');
      console.log('   2. Redirect to "Complete Your Profile" page');
      console.log('   3. User enters missing business information');
      console.log('   4. Backend creates vendor_profiles + vendors entries');
    } else {
      console.log('\n✅ No remediation needed - all entries exist');
    }
    
    // 7. Generate fix script
    if (!hasVendorProfile || !hasVendorsEntry) {
      console.log('\n\n' + '='.repeat(80));
      console.log('🛠️  AUTO-GENERATED FIX SCRIPT:');
      console.log('='.repeat(80));
      console.log('\nCopy and run this SQL in Neon console:\n');
      
      if (!hasVendorProfile) {
        console.log(`-- Create vendor_profiles entry
INSERT INTO vendor_profiles (
  user_id, business_name, business_type, vendor_type,
  verification_status, service_areas, average_rating,
  total_reviews, total_bookings, response_time_hours,
  is_featured, is_premium, created_at, updated_at
) VALUES (
  '${vendorId}',
  '${user.first_name}${user.last_name ? ' ' + user.last_name : ''} Business',
  'Other Services',
  'business',
  'unverified',
  ARRAY['Not specified'],
  0.00, 0, 0, 24,
  false, false,
  NOW(), NOW()
);
`);
      }
      
      if (!hasVendorsEntry) {
        const vendorCount = await sql`SELECT COUNT(*) as count FROM vendors`;
        const nextVendorNumber = parseInt(vendorCount[0].count) + 1;
        const vendorIdLegacy = `VEN-${nextVendorNumber.toString().padStart(5, '0')}`;
        
        console.log(`-- Create vendors (legacy) table entry
INSERT INTO vendors (
  id, user_id, business_name, business_type,
  description, location, rating, review_count,
  verified, created_at, updated_at
) VALUES (
  '${vendorIdLegacy}',
  '${vendorId}',
  '${user.first_name}${user.last_name ? ' ' + user.last_name : ''} Business',
  'Other Services',
  'Professional service provider',
  'Not specified',
  0.0, 0, false,
  NOW(), NOW()
);
`);
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Run diagnostic
diagnoseVendor019()
  .then(() => {
    console.log('\n✅ Diagnostic complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
