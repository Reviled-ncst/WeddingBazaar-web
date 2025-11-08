/**
 * CHECK EXISTING SERVICES - Vendor ID Analysis
 * This script checks what vendor_id values are currently in the services table
 * to ensure we don't break existing services when fixing the foreign key
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkExistingServices() {
  console.log('\n🔍 ANALYZING EXISTING SERVICES AND VENDOR IDS\n');
  console.log('=' .repeat(80));

  try {
    // 1. Check all services and their vendor_id values
    console.log('\n📊 STEP 1: All Services with Vendor IDs');
    console.log('-'.repeat(80));
    const allServices = await sql`
      SELECT 
        id,
        vendor_id,
        title,
        category,
        created_at
      FROM services
      ORDER BY created_at DESC
    `;
    
    console.log(`Total services in database: ${allServices.length}`);
    
    if (allServices.length > 0) {
      console.log('\nService Vendor IDs:');
      allServices.forEach((service, idx) => {
        console.log(`  ${idx + 1}. vendor_id: "${service.vendor_id}" | title: "${service.title}" | category: ${service.category}`);
      });
      
      // Group by vendor_id format
      const venFormat = allServices.filter(s => s.vendor_id && s.vendor_id.startsWith('VEN-'));
      const userFormat = allServices.filter(s => s.vendor_id && /^\d+-\d{4}-\d+$/.test(s.vendor_id));
      const otherFormat = allServices.filter(s => s.vendor_id && !s.vendor_id.startsWith('VEN-') && !/^\d+-\d{4}-\d+$/.test(s.vendor_id));
      
      console.log(`\n📈 Vendor ID Format Analysis:`);
      console.log(`  - VEN-XXXXX format: ${venFormat.length} services`);
      console.log(`  - User ID format (X-YYYY-XXX): ${userFormat.length} services`);
      console.log(`  - Other formats: ${otherFormat.length} services`);
    } else {
      console.log('✅ No services exist yet - safe to change foreign key!');
    }

    // 2. Check vendors table for reference
    console.log('\n📊 STEP 2: Vendors Table - ID vs User_ID');
    console.log('-'.repeat(80));
    const vendors = await sql`
      SELECT 
        id,
        user_id,
        business_name,
        business_type
      FROM vendors
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    console.log(`Total vendors (showing first 10): ${vendors.length}`);
    vendors.forEach((vendor, idx) => {
      console.log(`  ${idx + 1}. vendors.id: "${vendor.id}" | vendors.user_id: "${vendor.user_id}" | ${vendor.business_name}`);
    });

    // 3. Check for vendor ID mismatches
    console.log('\n🔍 STEP 3: Checking for Services with Non-Matching Vendor IDs');
    console.log('-'.repeat(80));
    
    if (allServices.length > 0) {
      const servicesWithVendorCheck = await sql`
        SELECT 
          s.id as service_id,
          s.vendor_id as service_vendor_id,
          s.title,
          v.id as vendor_table_id,
          v.user_id as vendor_user_id,
          v.business_name
        FROM services s
        LEFT JOIN vendors v ON s.vendor_id = v.id OR s.vendor_id = v.user_id
        ORDER BY s.created_at DESC
      `;
      
      const matched = servicesWithVendorCheck.filter(s => s.vendor_table_id !== null);
      const unmatched = servicesWithVendorCheck.filter(s => s.vendor_table_id === null);
      
      console.log(`✅ Services with matching vendor: ${matched.length}`);
      console.log(`⚠️  Services with NO matching vendor: ${unmatched.length}`);
      
      if (unmatched.length > 0) {
        console.log('\n❌ ORPHANED SERVICES (no matching vendor):');
        unmatched.forEach((service, idx) => {
          console.log(`  ${idx + 1}. Service: "${service.title}" | vendor_id: "${service.service_vendor_id}"`);
        });
      }
      
      if (matched.length > 0) {
        console.log('\n✅ MATCHED SERVICES:');
        matched.forEach((service, idx) => {
          const matchedBy = service.service_vendor_id === service.vendor_table_id ? 'vendors.id' : 'vendors.user_id';
          console.log(`  ${idx + 1}. "${service.title}" | service.vendor_id="${service.service_vendor_id}" matches ${matchedBy}`);
        });
      }
    }

    // 4. Check current foreign key constraint
    console.log('\n📊 STEP 4: Current Foreign Key Constraint');
    console.log('-'.repeat(80));
    const fkConstraints = await sql`
      SELECT
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'services' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'vendor_id'
    `;
    
    if (fkConstraints.length > 0) {
      console.log('Current constraint:');
      fkConstraints.forEach(fk => {
        console.log(`  - ${fk.constraint_name}`);
        console.log(`    services.${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
      });
    } else {
      console.log('⚠️  No foreign key constraint found on services.vendor_id');
    }

    // 5. Recommendation
    console.log('\n\n🎯 RECOMMENDATION');
    console.log('=' .repeat(80));
    
    if (allServices.length === 0) {
      console.log('✅ SAFE TO CHANGE: No services exist, can safely modify foreign key constraint');
      console.log('\nSuggested action:');
      console.log('  1. Drop existing foreign key (if exists)');
      console.log('  2. Add new foreign key: services.vendor_id → vendors.user_id');
    } else {
      const hasVenFormat = allServices.some(s => s.vendor_id && s.vendor_id.startsWith('VEN-'));
      const hasUserFormat = allServices.some(s => s.vendor_id && /^\d+-\d{4}-\d+$/.test(s.vendor_id));
      
      if (hasVenFormat && !hasUserFormat) {
        console.log('⚠️  CAUTION: Services use VEN-XXXXX format');
        console.log('\nOption 1 (Recommended): Update existing services to use user_id format:');
        console.log('  1. UPDATE services SET vendor_id = (SELECT user_id FROM vendors WHERE vendors.id = services.vendor_id)');
        console.log('  2. Drop old foreign key');
        console.log('  3. Add new foreign key: services.vendor_id → vendors.user_id');
        console.log('\nOption 2: Keep VEN-XXXXX format and update new code to use vendors.id');
      } else if (hasUserFormat && !hasVenFormat) {
        console.log('✅ GOOD: Services already use user_id format');
        console.log('\nSuggested action:');
        console.log('  1. Drop old foreign key (if it references vendors.id)');
        console.log('  2. Add new foreign key: services.vendor_id → vendors.user_id');
      } else if (hasVenFormat && hasUserFormat) {
        console.log('❌ MIXED FORMATS: Services use BOTH VEN-XXXXX and user_id formats');
        console.log('\nSuggested action:');
        console.log('  1. Standardize all services to user_id format');
        console.log('  2. Update foreign key constraint');
      } else {
        console.log('⚠️  UNKNOWN: Services use neither standard format');
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Analysis complete!\n');

  } catch (error) {
    console.error('❌ Error analyzing services:', error);
    process.exit(1);
  }
}

checkExistingServices();
