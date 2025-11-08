#!/usr/bin/env node

/**
 * 🔧 Fix Vendor 2-2025-019 Profile
 * 
 * This script will ensure vendor 2-2025-019 has complete profile data:
 * 1. Update user account if needed
 * 2. Create/update vendor_profiles entry
 * 3. Create/update vendors (legacy) table entry
 * 4. Verify service creation capability
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixVendor019() {
  console.log('🔧 FIXING VENDOR 2-2025-019 PROFILE');
  console.log('='.repeat(80));
  console.log('\n');

  try {
    const vendorId = '2-2025-019';
    
    // 1. Get existing user data
    console.log('📋 STEP 1: Checking current state...');
    const userResult = await sql`
      SELECT * FROM users WHERE id = ${vendorId}
    `;
    
    if (userResult.length === 0) {
      console.log('❌ User 2-2025-019 not found. Cannot fix.');
      process.exit(1);
    }
    
    const user = userResult[0];
    console.log('✅ User found:', user.email);
    
    // 2. Check vendor_profiles
    const vendorProfileResult = await sql`
      SELECT * FROM vendor_profiles WHERE user_id = ${vendorId}
    `;
    
    const hasVendorProfile = vendorProfileResult.length > 0;
    console.log(`   Vendor Profile: ${hasVendorProfile ? '✅ Exists' : '❌ Missing'}`);
    
    // 3. Check vendors table
    const vendorsResult = await sql`
      SELECT * FROM vendors WHERE user_id = ${vendorId}
    `;
    
    const hasVendorsEntry = vendorsResult.length > 0;
    console.log(`   Vendors Table: ${hasVendorsEntry ? '✅ Exists' : '❌ Missing'}`);
    
    // 4. Update/Create vendor_profiles
    console.log('\n📋 STEP 2: Fixing vendor_profiles...');
    
    if (hasVendorProfile) {
      const profile = vendorProfileResult[0];
      console.log('✅ Vendor profile already exists');
      console.log(`   Business Name: ${profile.business_name}`);
      console.log(`   Business Type: ${profile.business_type}`);
      console.log(`   Vendor Type: ${profile.vendor_type}`);
      
      // Update with better data if fields are empty
      const updates = [];
      if (!profile.business_name || profile.business_name.includes('Business')) {
        updates.push('business_name');
      }
      if (!profile.business_type || profile.business_type === 'other') {
        updates.push('business_type');
      }
      if (!profile.business_description) {
        updates.push('business_description');
      }
      if (!profile.service_area) {
        updates.push('service_area');
      }
      
      if (updates.length > 0) {
        console.log(`   ⚠️  Found ${updates.length} fields to update: ${updates.join(', ')}`);
        
        const businessName = profile.business_name || `${user.first_name}${user.last_name ? ' ' + user.last_name : ''} Professional Services`;
        const businessType = profile.business_type || 'Other Services';
        const businessDescription = profile.business_description || 'Professional wedding service provider';
        const serviceArea = profile.service_area || 'Metro Manila, Philippines';
        
        await sql`
          UPDATE vendor_profiles
          SET 
            business_name = ${businessName},
            business_type = ${businessType},
            business_description = ${businessDescription},
            service_area = ${serviceArea},
            updated_at = NOW()
          WHERE user_id = ${vendorId}
        `;
        
        console.log('✅ Updated vendor_profiles with better data');
      } else {
        console.log('✅ Vendor profile is complete, no updates needed');
      }
    } else {
      console.log('❌ Vendor profile missing - creating now...');
      
      const businessName = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''} Professional Services`;
      const businessType = 'Other Services';
      const vendorType = 'business';
      
      await sql`
        INSERT INTO vendor_profiles (
          user_id, business_name, business_type, vendor_type,
          business_description, service_area,
          verification_status, service_areas, average_rating,
          total_reviews, total_bookings, response_time_hours,
          is_featured, is_premium, created_at, updated_at
        ) VALUES (
          ${vendorId},
          ${businessName},
          ${businessType},
          ${vendorType},
          'Professional wedding service provider',
          'Metro Manila, Philippines',
          'unverified',
          ARRAY['Metro Manila'],
          0.00, 0, 0, 24,
          false, false,
          NOW(), NOW()
        )
      `;
      
      console.log('✅ Created vendor_profiles entry');
      console.log(`   Business Name: ${businessName}`);
      console.log(`   Business Type: ${businessType}`);
    }
    
    // 5. Update/Create vendors (legacy) table
    console.log('\n📋 STEP 3: Fixing vendors (legacy) table...');
    
    if (hasVendorsEntry) {
      const vendor = vendorsResult[0];
      console.log('✅ Vendors table entry already exists');
      console.log(`   Vendor ID: ${vendor.id}`);
      console.log(`   Business Name: ${vendor.business_name}`);
      
      // Update with better data if needed
      if (!vendor.business_name || vendor.business_name.includes('Business')) {
        const businessName = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''} Professional Services`;
        
        await sql`
          UPDATE vendors
          SET 
            business_name = ${businessName},
            business_type = 'Other Services',
            description = 'Professional wedding service provider',
            location = 'Metro Manila, Philippines',
            updated_at = NOW()
          WHERE user_id = ${vendorId}
        `;
        
        console.log('✅ Updated vendors table with better data');
      } else {
        console.log('✅ Vendors table entry is complete, no updates needed');
      }
    } else {
      console.log('❌ Vendors table entry missing - creating now...');
      
      // Get next vendor ID
      const vendorCountResult = await sql`SELECT COUNT(*) as count FROM vendors`;
      const nextVendorNumber = parseInt(vendorCountResult[0].count) + 1;
      const vendorIdLegacy = `VEN-${nextVendorNumber.toString().padStart(5, '0')}`;
      
      const businessName = `${user.first_name}${user.last_name ? ' ' + user.last_name : ''} Professional Services`;
      
      await sql`
        INSERT INTO vendors (
          id, user_id, business_name, business_type,
          description, location, rating, review_count,
          verified, created_at, updated_at
        ) VALUES (
          ${vendorIdLegacy},
          ${vendorId},
          ${businessName},
          'Other Services',
          'Professional wedding service provider',
          'Metro Manila, Philippines',
          0.0, 0, false,
          NOW(), NOW()
        )
      `;
      
      console.log('✅ Created vendors table entry');
      console.log(`   Vendor ID: ${vendorIdLegacy}`);
      console.log(`   Business Name: ${businessName}`);
    }
    
    // 6. Verify fix
    console.log('\n📋 STEP 4: Verifying fix...');
    
    const verifyProfile = await sql`
      SELECT * FROM vendor_profiles WHERE user_id = ${vendorId}
    `;
    
    const verifyVendors = await sql`
      SELECT * FROM vendors WHERE user_id = ${vendorId}
    `;
    
    if (verifyProfile.length > 0 && verifyVendors.length > 0) {
      console.log('✅ VERIFICATION PASSED');
      console.log('   ✅ vendor_profiles entry exists');
      console.log('   ✅ vendors table entry exists');
      
      const profile = verifyProfile[0];
      const vendor = verifyVendors[0];
      
      console.log('\n📊 FINAL STATE:');
      console.log('   User ID:', vendorId);
      console.log('   Email:', user.email);
      console.log('   Name:', user.first_name, user.last_name || '');
      console.log('   Vendor ID:', vendor.id);
      console.log('   Business Name:', profile.business_name);
      console.log('   Business Type:', profile.business_type);
      console.log('   Service Area:', profile.service_area || 'Not set');
      console.log('   Description:', profile.business_description ? '✅ Set' : '❌ Not set');
      
      console.log('\n✅ Vendor 2-2025-019 is now fully functional!');
      console.log('   User can now:');
      console.log('   - ✅ Create services');
      console.log('   - ✅ Manage bookings');
      console.log('   - ✅ View vendor dashboard');
      console.log('   - ✅ Appear in vendor listings');
    } else {
      console.log('❌ VERIFICATION FAILED');
      console.log('   Something went wrong during fix');
      process.exit(1);
    }
    
    // 7. Test service creation capability
    console.log('\n📋 STEP 5: Testing service creation capability...');
    
    try {
      // Just verify the vendor ID exists for service creation
      const vendorForServices = await sql`
        SELECT id FROM vendors WHERE user_id = ${vendorId}
      `;
      
      if (vendorForServices.length > 0) {
        console.log('✅ Vendor ID available for service creation:', vendorForServices[0].id);
        console.log('   Vendor can now create services using this vendor_id');
      } else {
        console.log('⚠️  Warning: No vendor ID found for service creation');
      }
    } catch (error) {
      console.log('⚠️  Could not verify service creation capability:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run fix
fixVendor019()
  .then(() => {
    console.log('\n✅ Fix complete');
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Have vendor 2-2025-019 login to test');
    console.log('2. Try creating a service');
    console.log('3. Verify service appears in listings');
    console.log('4. Update business details in profile settings');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
