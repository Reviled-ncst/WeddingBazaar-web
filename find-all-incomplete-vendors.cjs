#!/usr/bin/env node
/**
 * FIND ALL INCOMPLETE VENDOR PROFILES
 * 
 * Scans database for vendors with missing entries in either:
 * - vendor_profiles table (modular API)
 * - vendors table (legacy API)
 * 
 * This helps identify how widespread the issue is.
 */

const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

console.log('🔍 SCANNING FOR INCOMPLETE VENDOR PROFILES\n');
console.log('=' .repeat(80) + '\n');

async function findIncompleteVendors() {
  try {
    // Find all vendor users and check completeness
    console.log('📊 Analyzing all vendor accounts...\n');
    
    const analysis = await sql`
      SELECT 
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.user_type,
        u.created_at,
        CASE 
          WHEN vp.id IS NOT NULL THEN true 
          ELSE false 
        END as has_vendor_profile,
        CASE 
          WHEN v.id IS NOT NULL THEN true 
          ELSE false 
        END as has_vendors_entry,
        vp.business_name as profile_name,
        v.business_name as vendor_name,
        v.id as vendor_id,
        CASE 
          WHEN vp.id IS NOT NULL AND v.id IS NOT NULL THEN 'COMPLETE'
          WHEN vp.id IS NOT NULL AND v.id IS NULL THEN 'MISSING_VENDORS_ENTRY'
          WHEN vp.id IS NULL AND v.id IS NOT NULL THEN 'MISSING_PROFILE'
          ELSE 'NO_VENDOR_DATA'
        END as status
      FROM users u
      LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
      LEFT JOIN vendors v ON v.user_id = u.id
      WHERE u.user_type = 'vendor'
      ORDER BY u.created_at DESC
    `;
    
    // Categorize results
    const complete = analysis.filter(a => a.status === 'COMPLETE');
    const missingVendorsEntry = analysis.filter(a => a.status === 'MISSING_VENDORS_ENTRY');
    const missingProfile = analysis.filter(a => a.status === 'MISSING_PROFILE');
    const noData = analysis.filter(a => a.status === 'NO_VENDOR_DATA');
    
    // Display summary
    console.log('📈 SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Total vendor accounts: ${analysis.length}`);
    console.log(`✅ Complete profiles: ${complete.length}`);
    console.log(`⚠️  Missing vendors entry: ${missingVendorsEntry.length}`);
    console.log(`⚠️  Missing vendor profile: ${missingProfile.length}`);
    console.log(`❌ No vendor data: ${noData.length}`);
    console.log('');
    
    // Show complete vendors
    if (complete.length > 0) {
      console.log('✅ COMPLETE VENDOR PROFILES');
      console.log('-'.repeat(80));
      complete.forEach(v => {
        console.log(`${v.user_id} | ${v.email} | ${v.profile_name || v.vendor_name}`);
      });
      console.log('');
    }
    
    // Show vendors missing legacy entry (CRITICAL - like 2-2025-019)
    if (missingVendorsEntry.length > 0) {
      console.log('⚠️  VENDORS MISSING LEGACY ENTRY (CRITICAL)');
      console.log('-'.repeat(80));
      console.log('These vendors CANNOT create services and get 500 errors!\n');
      
      missingVendorsEntry.forEach(v => {
        console.log(`❌ User ID: ${v.user_id}`);
        console.log(`   Email: ${v.email}`);
        console.log(`   Name: ${v.first_name} ${v.last_name || ''}`);
        console.log(`   Business: ${v.profile_name || 'Not set'}`);
        console.log(`   Created: ${v.created_at}`);
        console.log(`   Status: Missing vendors table entry\n`);
      });
      
      console.log('🔧 FIX REQUIRED:');
      console.log('   Run fix-vendor-019-legacy-entry.sql for each user ID above');
      console.log('   OR create a bulk fix script\n');
    }
    
    // Show vendors missing profile
    if (missingProfile.length > 0) {
      console.log('⚠️  VENDORS MISSING PROFILE');
      console.log('-'.repeat(80));
      console.log('These vendors have legacy entry but no modular profile\n');
      
      missingProfile.forEach(v => {
        console.log(`❌ User ID: ${v.user_id}`);
        console.log(`   Email: ${v.email}`);
        console.log(`   Vendor ID: ${v.vendor_id}`);
        console.log(`   Business: ${v.vendor_name || 'Not set'}`);
        console.log(`   Created: ${v.created_at}\n`);
      });
    }
    
    // Show vendors with no data at all
    if (noData.length > 0) {
      console.log('❌ VENDORS WITH NO DATA');
      console.log('-'.repeat(80));
      console.log('These accounts are vendor type but have no vendor data\n');
      
      noData.forEach(v => {
        console.log(`❌ User ID: ${v.user_id}`);
        console.log(`   Email: ${v.email}`);
        console.log(`   Name: ${v.first_name} ${v.last_name || ''}`);
        console.log(`   Created: ${v.created_at}\n`);
      });
    }
    
    // Generate SQL fix for all incomplete vendors
    if (missingVendorsEntry.length > 0) {
      console.log('=' .repeat(80));
      console.log('🛠️  BULK FIX SQL SCRIPT');
      console.log('=' .repeat(80));
      console.log('Copy this SQL to Neon Console to fix ALL incomplete vendors:\n');
      
      console.log(`-- Fix ${missingVendorsEntry.length} vendor(s) missing legacy entry\n`);
      
      console.log(`INSERT INTO vendors (
  id, user_id, business_name, business_type, description,
  location, phone, email, rating, review_count,
  years_experience, verified, featured, created_at, updated_at
)
SELECT 
  'VEN-' || LPAD((ROW_NUMBER() OVER (ORDER BY vp.created_at) + 
    (SELECT COUNT(*) FROM vendors))::text, 5, '0') as id,
  vp.user_id,
  COALESCE(vp.business_name, u.first_name || ' Business'),
  COALESCE(vp.business_type, 'Other Services'),
  COALESCE(vp.business_description, 'Professional service provider'),
  COALESCE(vp.business_address, 'Not specified'),
  vp.contact_phone,
  vp.contact_email,
  COALESCE(vp.average_rating, 0.0),
  COALESCE(vp.total_reviews, 0),
  COALESCE(vp.years_in_business, 0),
  CASE WHEN vp.verification_status = 'verified' THEN true ELSE false END,
  COALESCE(vp.is_featured, false),
  vp.created_at,
  NOW()
FROM users u
LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
LEFT JOIN vendors v ON v.user_id = u.id
WHERE u.user_type = 'vendor' 
  AND vp.id IS NOT NULL 
  AND v.id IS NULL;

-- Verify the fix
SELECT COUNT(*) as fixed_count FROM vendors
WHERE user_id IN (${missingVendorsEntry.map(v => `'${v.user_id}'`).join(', ')});
`);
      
      console.log('\n📝 Save this SQL as: fix-all-incomplete-vendors.sql\n');
    }
    
    // Final recommendations
    console.log('=' .repeat(80));
    console.log('💡 RECOMMENDATIONS');
    console.log('=' .repeat(80));
    
    if (missingVendorsEntry.length > 0) {
      console.log('🔴 CRITICAL: Fix missing vendors entries immediately');
      console.log('   - These vendors cannot create services');
      console.log('   - Backend returns 500 errors');
      console.log('   - Blocks vendor onboarding\n');
    }
    
    if (missingProfile.length > 0) {
      console.log('⚠️  IMPORTANT: Create missing vendor profiles');
      console.log('   - Needed for modular API');
      console.log('   - Future-proofing for legacy deprecation\n');
    }
    
    if (complete.length === analysis.length) {
      console.log('✅ All vendor profiles are complete!');
      console.log('   - No action needed');
      console.log('   - System is healthy\n');
    }
    
    console.log('📌 Next Steps:');
    console.log('1. Execute bulk fix SQL script in Neon Console');
    console.log('2. Run this script again to verify all fixed');
    console.log('3. Update registration endpoint to prevent future issues');
    console.log('4. Test vendor registration end-to-end\n');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error('\nFull error:', error);
  }
}

// Run analysis
findIncompleteVendors().then(() => {
  console.log('✅ Analysis complete\n');
  process.exit(0);
}).catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
