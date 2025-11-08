/**
 * 🔧 Fix Missing Vendor Profile
 * 
 * This script checks if a vendor profile exists for a given user_id
 * and creates one if it's missing.
 * 
 * Usage: node fix-vendor-profile-missing.cjs
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixVendorProfile() {
  try {
    console.log('🔍 Checking for users with vendor role but no vendor profile...\n');
    
    // Find all users with vendor role
    const vendorUsers = await sql`
      SELECT 
        u.id as user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.user_type,
        v.id as vendor_id
      FROM users u
      LEFT JOIN vendors v ON v.user_id = u.id
      WHERE u.user_type = 'vendor'
      ORDER BY u.created_at DESC
    `;
    
    console.log(`📊 Found ${vendorUsers.length} users with vendor role:\n`);
    
    const missingProfiles = vendorUsers.filter(u => !u.vendor_id);
    
    if (missingProfiles.length === 0) {
      console.log('✅ All vendor users have profiles!');
      
      // Show existing vendors
      console.log('\n📋 Existing vendor profiles:');
      vendorUsers.forEach((u, i) => {
        const fullName = [u.first_name, u.last_name].filter(Boolean).join(' ') || 'No name';
        console.log(`  ${i+1}. ${fullName} (${u.email})`);
        console.log(`     User ID: ${u.user_id}`);
        console.log(`     Vendor ID: ${u.vendor_id}`);
        console.log('');
      });
      
      return;
    }
    
    console.log(`⚠️  Found ${missingProfiles.length} vendor users WITHOUT profiles:\n`);
    
    for (const user of missingProfiles) {
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'No name';
      console.log(`❌ User: ${fullName} (${user.email})`);
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Missing vendor profile!\n`);
      
      // Generate vendor ID in format 2-yyyy-xxx
      const year = new Date().getFullYear();
      const countResult = await sql`SELECT COUNT(*) as count FROM vendors WHERE id LIKE ${`2-${year}-%`}`;
      const count = parseInt(countResult[0].count) + 1;
      const vendorId = `2-${year}-${count.toString().padStart(3, '0')}`;
      
      console.log(`🆔 Generating vendor ID: ${vendorId}`);
      
      // 🎯 IMPROVED: Better business name fallback
      // Priority 1: Use full name if available
      // Priority 2: Use email prefix (before @)
      // Priority 3: Generic fallback
      let businessName;
      if (fullName !== 'No name') {
        businessName = `${fullName} Professional Services`;
      } else if (user.email) {
        const emailPrefix = user.email.split('@')[0].replace(/[._-]/g, ' ');
        businessName = `${emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)} Services`;
      } else {
        businessName = 'Professional Wedding Services';
      }
      
      // ⚠️ IMPORTANT WARNING
      console.log(`⚠️  WARNING: Auto-generated business name: "${businessName}"`);
      console.log(`⚠️  Vendor MUST update their profile with real business information!`);
      console.log(`⚠️  This is a TEMPORARY profile to prevent errors.\n`);
      
      // Create vendor profile with improved defaults
      const result = await sql`
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
          ${user.user_id},
          ${businessName},
          ${'General Services'},
          ${'Temporary profile - Please complete your business information in the vendor dashboard.'},
          ${'Philippines'},
          0.0,
          0,
          false,
          NOW(),
          NOW()
        )
        RETURNING *
      `;
      
      console.log(`✅ Created TEMPORARY vendor profile: ${result[0].id}`);
      console.log(`   Business Name: ${result[0].business_name}`);
      console.log(`   ⚠️  VENDOR MUST COMPLETE PROFILE!`);
      console.log('━'.repeat(60));
      console.log('');
    }
    
    console.log('\n✅ All vendor profiles created successfully!');
    console.log('\n⚠️  IMPORTANT NOTICE:');
    console.log('━'.repeat(60));
    console.log('These are TEMPORARY auto-generated profiles.');
    console.log('Vendors MUST complete their business information:');
    console.log('  1. Professional business name');
    console.log('  2. Specific business category');
    console.log('  3. Business description');
    console.log('  4. Accurate location');
    console.log('  5. Years of experience');
    console.log('  6. Contact information (phone, email)');
    console.log('━'.repeat(60));
    console.log('\n💡 Recommendation: Redirect vendors to a "Complete Profile" page');
    console.log('   on their first login to gather accurate business information.');
    console.log('\n📧 Consider sending email notifications to vendors asking them');
    console.log('   to complete their profiles for better visibility.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\n📋 Full error:', error.message);
    process.exit(1);
  }
}

fixVendorProfile();
