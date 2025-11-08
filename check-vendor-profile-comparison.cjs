#!/usr/bin/env node

/**
 * 🔍 Vendor Profile Comparison Script
 * 
 * This script compares two vendor profiles to understand why one has complete data
 * and the other doesn't.
 * 
 * Vendors to compare:
 * - 2-2025-002 (Alison) - Has complete profile with services
 * - 2-2025-019 - Missing profile data
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function compareVendorProfiles() {
  console.log('🔍 VENDOR PROFILE COMPARISON SCRIPT');
  console.log('=' .repeat(80));
  console.log('\n');

  try {
    // Get both vendor profiles with user data
    const vendorIds = ['2-2025-002', '2-2025-019'];
    
    for (const vendorId of vendorIds) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📋 VENDOR: ${vendorId}`);
      console.log('='.repeat(80));
      
      // Get user account info
      const userResult = await sql`
        SELECT 
          id as user_id,
          email,
          first_name,
          last_name,
          phone,
          role,
          email_verified,
          created_at
        FROM users 
        WHERE id = ${vendorId}
      `;
      
      if (userResult.length === 0) {
        console.log(`❌ No user account found for ID: ${vendorId}`);
        continue;
      }
      
      const user = userResult[0];
      console.log('\n👤 USER ACCOUNT:');
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name || '(no last name)'}`);
      console.log(`   Phone: ${user.phone || '(none)'}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email Verified: ${user.email_verified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${user.created_at}`);
      
      // Get vendor profile info
      const vendorResult = await sql`
        SELECT 
          id as vendor_id,
          user_id,
          business_name,
          business_type,
          vendor_type,
          description,
          location,
          website_url,
          rating,
          review_count,
          years_experience,
          verified,
          created_at as vendor_created_at
        FROM vendors 
        WHERE user_id = ${vendorId}
      `;
      
      if (vendorResult.length === 0) {
        console.log('\n❌ NO VENDOR PROFILE FOUND');
        console.log('   This user has a user account but no vendor profile!');
        continue;
      }
      
      const vendor = vendorResult[0];
      console.log('\n🏢 VENDOR PROFILE:');
      console.log(`   Vendor ID: ${vendor.vendor_id}`);
      console.log(`   User ID: ${vendor.user_id}`);
      console.log(`   Business Name: ${vendor.business_name || '❌ NULL'}`);
      console.log(`   Business Type: ${vendor.business_type || '❌ NULL'}`);
      console.log(`   Vendor Type: ${vendor.vendor_type || '❌ NULL'}`);
      console.log(`   Description: ${vendor.description ? `✅ ${vendor.description.substring(0, 50)}...` : '❌ NULL'}`);
      console.log(`   Location: ${vendor.location || '❌ NULL'}`);
      console.log(`   Website: ${vendor.website || '(none)'}`);
      console.log(`   Rating: ${vendor.rating || '0.0'} ⭐`);
      console.log(`   Total Reviews: ${vendor.total_reviews || 0}`);
      console.log(`   Years Experience: ${vendor.years_experience || '❌ NULL'}`);
      console.log(`   Is Verified: ${vendor.is_verified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Is Featured: ${vendor.is_featured ? '✅ Yes' : '❌ No'}`);
      console.log(`   Vendor Profile Created: ${vendor.vendor_created_at}`);
      
      // Calculate profile completeness
      const fields = [
        vendor.business_name,
        vendor.business_type,
        vendor.description,
        vendor.location,
        vendor.years_experience
      ];
      const completedFields = fields.filter(f => f !== null && f !== undefined && f !== '').length;
      const completenessPercent = Math.round((completedFields / fields.length) * 100);
      
      console.log(`\n📊 PROFILE COMPLETENESS: ${completenessPercent}% (${completedFields}/${fields.length} fields)`);
      
      // Get services count
      const servicesResult = await sql`
        SELECT COUNT(*) as service_count
        FROM services
        WHERE vendor_id = ${vendor.vendor_id}
      `;
      
      const serviceCount = servicesResult[0]?.service_count || 0;
      console.log(`\n📦 SERVICES: ${serviceCount} service(s) created`);
      
      // Get sample services if any
      if (serviceCount > 0) {
        const sampleServices = await sql`
          SELECT 
            id,
            service_name,
            service_type,
            base_price,
            is_active,
            created_at
          FROM services
          WHERE vendor_id = ${vendor.vendor_id}
          ORDER BY created_at DESC
          LIMIT 3
        `;
        
        console.log('   Sample Services:');
        sampleServices.forEach((s, idx) => {
          console.log(`   ${idx + 1}. ${s.service_name} (${s.service_type}) - ₱${s.base_price || 'N/A'}`);
          console.log(`      Status: ${s.is_active ? '✅ Active' : '❌ Inactive'}`);
          console.log(`      Created: ${s.created_at}`);
        });
      }
      
      // Identify missing fields
      console.log('\n⚠️  MISSING FIELDS:');
      const missingFields = [];
      if (!vendor.business_name) missingFields.push('Business Name');
      if (!vendor.business_type) missingFields.push('Business Type');
      if (!vendor.description) missingFields.push('Description');
      if (!vendor.location) missingFields.push('Location');
      if (!vendor.years_experience) missingFields.push('Years of Experience');
      
      if (missingFields.length === 0) {
        console.log('   ✅ Profile is complete!');
      } else {
        missingFields.forEach(field => {
          console.log(`   ❌ ${field}`);
        });
      }
    }
    
    // Summary comparison
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 COMPARISON SUMMARY');
    console.log('='.repeat(80));
    
    const vendor002 = await sql`
      SELECT v.*, u.email, u.first_name, u.last_name
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = '2-2025-002'
    `;
    
    const vendor019 = await sql`
      SELECT v.*, u.email, u.first_name, u.last_name
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.user_id = '2-2025-019'
    `;
    
    const services002 = await sql`
      SELECT COUNT(*) as count FROM services WHERE vendor_id = ${vendor002[0]?.id}
    `;
    
    const services019 = await sql`
      SELECT COUNT(*) as count FROM services WHERE vendor_id = ${vendor019[0]?.id}
    `;
    
    console.log('\n| Field | 2-2025-002 (Alison) | 2-2025-019 | Winner |');
    console.log('|-------|---------------------|------------|--------|');
    
    const v002 = vendor002[0];
    const v019 = vendor019[0];
    
    if (v002 && v019) {
      // Business Name
      console.log(`| Business Name | ${v002.business_name || 'NULL'} | ${v019.business_name || 'NULL'} | ${v002.business_name && !v019.business_name ? '002 ✅' : v019.business_name && !v002.business_name ? '019 ✅' : 'Tie'} |`);
      
      // Business Type
      console.log(`| Business Type | ${v002.business_type || 'NULL'} | ${v019.business_type || 'NULL'} | ${v002.business_type && !v019.business_type ? '002 ✅' : v019.business_type && !v002.business_type ? '019 ✅' : 'Tie'} |`);
      
      // Description
      const desc002 = v002.description ? 'Has description' : 'NULL';
      const desc019 = v019.description ? 'Has description' : 'NULL';
      console.log(`| Description | ${desc002} | ${desc019} | ${v002.description && !v019.description ? '002 ✅' : v019.description && !v002.description ? '019 ✅' : 'Tie'} |`);
      
      // Location
      console.log(`| Location | ${v002.location || 'NULL'} | ${v019.location || 'NULL'} | ${v002.location && !v019.location ? '002 ✅' : v019.location && !v002.location ? '019 ✅' : 'Tie'} |`);
      
      // Years Experience
      console.log(`| Years Experience | ${v002.years_experience || 'NULL'} | ${v019.years_experience || 'NULL'} | ${v002.years_experience && !v019.years_experience ? '002 ✅' : v019.years_experience && !v002.years_experience ? '019 ✅' : 'Tie'} |`);
      
      // Services
      const s002 = services002[0]?.count || 0;
      const s019 = services019[0]?.count || 0;
      console.log(`| Services Created | ${s002} | ${s019} | ${s002 > s019 ? '002 ✅' : s019 > s002 ? '019 ✅' : 'Tie'} |`);
      
      // Verified
      console.log(`| Email Verified | ${v002.email_verified ? 'Yes' : 'No'} | ${v019.email_verified ? 'Yes' : 'No'} | ${v002.email_verified && !v019.email_verified ? '002 ✅' : v019.email_verified && !v002.email_verified ? '019 ✅' : 'Tie'} |`);
    } else {
      if (!v002) console.log('❌ Vendor 2-2025-002 not found');
      if (!v019) console.log('❌ Vendor 2-2025-019 not found');
    }
    
    console.log('\n\n🔍 ROOT CAUSE ANALYSIS:');
    console.log('=' .repeat(80));
    
    if (v002 && v019) {
      // Check registration dates
      const user002 = await sql`SELECT created_at FROM users WHERE id = '2-2025-002'`;
      const user019 = await sql`SELECT created_at FROM users WHERE id = '2-2025-019'`;
      
      console.log(`\n📅 Registration Dates:`);
      console.log(`   002: ${user002[0]?.created_at || 'Unknown'}`);
      console.log(`   019: ${user019[0]?.created_at || 'Unknown'}`);
      
      // Check if profiles were auto-generated
      console.log(`\n🤖 Profile Source Detection:`);
      if (v002.business_name?.includes('Business') || v002.business_name?.includes("'s")) {
        console.log(`   002: ⚠️  LIKELY AUTO-GENERATED (contains "Business" or "'s")`);
        console.log(`        Business name: "${v002.business_name}"`);
      } else {
        console.log(`   002: ✅ Manually entered (professional business name)`);
      }
      
      if (v019.business_name?.includes('Business') || v019.business_name?.includes("'s")) {
        console.log(`   019: ⚠️  LIKELY AUTO-GENERATED (contains "Business" or "'s")`);
        console.log(`        Business name: "${v019.business_name}"`);
      } else if (!v019.business_name) {
        console.log(`   019: ❌ NO BUSINESS NAME (profile incomplete or not created)`);
      } else {
        console.log(`   019: ✅ Manually entered (professional business name)`);
      }
      
      // Check registration method
      console.log(`\n🔐 Registration Method:`);
      const user002Full = await sql`SELECT * FROM users WHERE id = '2-2025-002'`;
      const user019Full = await sql`SELECT * FROM users WHERE id = '2-2025-019'`;
      
      if (user002Full[0]?.password_hash) {
        console.log(`   002: 📧 Email/Password registration`);
      } else {
        console.log(`   002: 🔑 OAuth (Google) registration`);
      }
      
      if (user019Full[0]?.password_hash) {
        console.log(`   019: 📧 Email/Password registration`);
      } else {
        console.log(`   019: 🔑 OAuth (Google) registration`);
      }
    }
    
    console.log('\n\n💡 RECOMMENDATIONS:');
    console.log('=' .repeat(80));
    console.log('1. Check RegisterModal.tsx - are business fields being sent to backend?');
    console.log('2. Check backend registration endpoint - is vendor profile being created?');
    console.log('3. Check if fix-vendor-profile-missing.cjs was run on 002 but not 019');
    console.log('4. Verify that business_name is REQUIRED in registration form validation');
    console.log('5. Check if 019 needs to complete their profile manually');
    
  } catch (error) {
    console.error('❌ Error during comparison:', error);
    console.error('Error details:', error.message);
  }
}

// Run the comparison
compareVendorProfiles()
  .then(() => {
    console.log('\n✅ Comparison complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
