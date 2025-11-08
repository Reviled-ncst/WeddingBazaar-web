/**
 * 🔍 Check Vendor Differences
 * 
 * Compare vendor accounts 2-2025-002 and 2-2025-019
 * to identify missing fields or differences
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkVendorDifferences() {
  try {
    console.log('🔍 Checking vendor accounts 2-2025-002 and VEN-00019...\n');
    console.log('━'.repeat(80));
    
    // Get both vendors with their user data
    const vendors = await sql`
      SELECT 
        v.*,
        u.id as user_id,
        u.email as user_email,
        u.first_name,
        u.last_name,
        u.phone as user_phone,
        u.user_type,
        u.created_at as user_created_at,
        u.email_verified
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.id IN ('2-2025-002', 'VEN-00019')
      ORDER BY v.id
    `;
    
    if (vendors.length === 0) {
      console.log('❌ No vendors found with those IDs');
      return;
    }
    
    console.log(`📊 Found ${vendors.length} vendor(s)\n`);
    
    // Display each vendor's full details
    vendors.forEach((vendor, index) => {
      console.log(`\n${'═'.repeat(80)}`);
      console.log(`📌 VENDOR #${index + 1}: ${vendor.id}`);
      console.log(`${'═'.repeat(80)}\n`);
      
      // User Information
      console.log('👤 USER INFORMATION:');
      console.log(`   User ID:        ${vendor.user_id || '❌ NULL'}`);
      console.log(`   Email:          ${vendor.user_email || '❌ NULL'}`);
      console.log(`   First Name:     ${vendor.first_name || '❌ NULL'}`);
      console.log(`   Last Name:      ${vendor.last_name || '❌ NULL'}`);
      console.log(`   Phone:          ${vendor.user_phone || '❌ NULL'}`);
      console.log(`   User Type:      ${vendor.user_type || '❌ NULL'}`);
      console.log(`   Email Verified: ${vendor.email_verified ? '✅ Yes' : '❌ No'}`);
      console.log(`   User Created:   ${vendor.user_created_at || '❌ NULL'}`);
      
      // Vendor Profile Information
      console.log('\n🏢 VENDOR PROFILE:');
      console.log(`   Business Name:  ${vendor.business_name || '❌ NULL'}`);
      console.log(`   Business Type:  ${vendor.business_type || '❌ NULL'}`);
      console.log(`   Vendor Type:    ${vendor.vendor_type || '❌ NULL'}`);
      console.log(`   Description:    ${vendor.description || '❌ NULL'}`);
      console.log(`   Location:       ${vendor.location || '❌ NULL'}`);
      console.log(`   Phone:          ${vendor.phone || '❌ NULL'}`);
      console.log(`   Email:          ${vendor.email || '❌ NULL'}`);
      console.log(`   Website:        ${vendor.website || '❌ NULL'}`);
      
      // Business Details
      console.log('\n📊 BUSINESS DETAILS:');
      console.log(`   Years Exp:      ${vendor.years_experience || '❌ NULL'}`);
      console.log(`   Team Size:      ${vendor.team_size || '❌ NULL'}`);
      console.log(`   Specialties:    ${vendor.specialties ? JSON.stringify(vendor.specialties) : '❌ NULL'}`);
      console.log(`   Service Areas:  ${vendor.service_areas ? JSON.stringify(vendor.service_areas) : '❌ NULL'}`);
      console.log(`   Portfolio:      ${vendor.portfolio_images ? `${vendor.portfolio_images.length} images` : '❌ NULL'}`);
      
      // Ratings & Status
      console.log('\n⭐ RATINGS & STATUS:');
      console.log(`   Rating:         ${vendor.rating || '0.0'} ★`);
      console.log(`   Review Count:   ${vendor.review_count || '0'} reviews`);
      console.log(`   Verified:       ${vendor.verified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Featured:       ${vendor.featured ? '✅ Yes' : '❌ No'}`);
      
      // Pricing
      console.log('\n💰 PRICING:');
      console.log(`   Starting Price: ${vendor.starting_price ? `₱${vendor.starting_price}` : '❌ NULL'}`);
      console.log(`   Price Range:    ${vendor.price_range_min && vendor.price_range_max ? `₱${vendor.price_range_min} - ₱${vendor.price_range_max}` : '❌ NULL'}`);
      
      // Timestamps
      console.log('\n🕐 TIMESTAMPS:');
      console.log(`   Created:        ${vendor.created_at || '❌ NULL'}`);
      console.log(`   Updated:        ${vendor.updated_at || '❌ NULL'}`);
      
      console.log('');
    });
    
    // Compare if we have both vendors
    if (vendors.length === 2) {
      console.log(`\n${'═'.repeat(80)}`);
      console.log('🔍 DIFFERENCES ANALYSIS');
      console.log(`${'═'.repeat(80)}\n`);
      
      const vendor1 = vendors[0];
      const vendor2 = vendors[1];
      
      const fields = [
        // User fields
        { key: 'user_id', label: 'User ID' },
        { key: 'user_email', label: 'User Email' },
        { key: 'first_name', label: 'First Name' },
        { key: 'last_name', label: 'Last Name' },
        { key: 'user_phone', label: 'User Phone' },
        { key: 'email_verified', label: 'Email Verified' },
        
        // Vendor profile fields
        { key: 'business_name', label: 'Business Name' },
        { key: 'business_type', label: 'Business Type' },
        { key: 'vendor_type', label: 'Vendor Type' },
        { key: 'description', label: 'Description' },
        { key: 'location', label: 'Location' },
        { key: 'phone', label: 'Vendor Phone' },
        { key: 'email', label: 'Vendor Email' },
        { key: 'website', label: 'Website' },
        
        // Business details
        { key: 'years_experience', label: 'Years Experience' },
        { key: 'team_size', label: 'Team Size' },
        { key: 'specialties', label: 'Specialties' },
        { key: 'service_areas', label: 'Service Areas' },
        
        // Status
        { key: 'verified', label: 'Verified' },
        { key: 'featured', label: 'Featured' },
        
        // Pricing
        { key: 'starting_price', label: 'Starting Price' },
        { key: 'price_range_min', label: 'Price Range Min' },
        { key: 'price_range_max', label: 'Price Range Max' },
      ];
      
      let differenceCount = 0;
      
      fields.forEach(({ key, label }) => {
        const val1 = vendor1[key];
        const val2 = vendor2[key];
        
        // Convert to string for comparison
        const str1 = val1 !== null && val1 !== undefined ? String(val1) : 'NULL';
        const str2 = val2 !== null && val2 !== undefined ? String(val2) : 'NULL';
        
        if (str1 !== str2) {
          differenceCount++;
          console.log(`❌ ${label}:`);
          console.log(`   ${vendor1.id}: ${str1}`);
          console.log(`   ${vendor2.id}: ${str2}`);
          console.log('');
        }
      });
      
      if (differenceCount === 0) {
        console.log('✅ No differences found - accounts are identical!\n');
      } else {
        console.log(`\n📊 Total differences found: ${differenceCount}\n`);
      }
      
      // Check for missing fields in vendor 2-2025-019
      console.log(`${'═'.repeat(80)}`);
      console.log(`🔍 MISSING FIELDS IN ${vendor2.id}`);
      console.log(`${'═'.repeat(80)}\n`);
      
      let missingCount = 0;
      
      fields.forEach(({ key, label }) => {
        const val1 = vendor1[key];
        const val2 = vendor2[key];
        
        // Check if vendor1 has it but vendor2 doesn't
        if ((val1 !== null && val1 !== undefined && val1 !== '') && 
            (val2 === null || val2 === undefined || val2 === '')) {
          missingCount++;
          console.log(`❌ ${label}:`);
          console.log(`   ${vendor1.id} has: ${val1}`);
          console.log(`   ${vendor2.id} has: NULL/Empty`);
          console.log('');
        }
      });
      
      if (missingCount === 0) {
        console.log(`✅ ${vendor2.id} has all fields that ${vendor1.id} has!\n`);
      } else {
        console.log(`\n📊 Total missing fields in ${vendor2.id}: ${missingCount}\n`);
      }
    }
    
    // Count services for each vendor
    console.log(`${'═'.repeat(80)}`);
    console.log('📦 SERVICES COUNT');
    console.log(`${'═'.repeat(80)}\n`);
    
    for (const vendor of vendors) {
      const services = await sql`
        SELECT COUNT(*) as count
        FROM services
        WHERE vendor_id = ${vendor.id}
      `;
      
      console.log(`${vendor.id}: ${services[0].count} service(s)`);
    }
    
    console.log('\n' + '━'.repeat(80));
    console.log('✅ Analysis complete!\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\n📋 Full error:', error.message);
    console.error('\n📋 Stack trace:', error.stack);
    process.exit(1);
  }
}

checkVendorDifferences();
