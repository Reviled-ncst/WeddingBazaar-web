/**
 * INVESTIGATE DUPLICATE VENDORS
 * Find which vendors have duplicate user_ids and decide which to keep
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function investigateDuplicates() {
  console.log('\n🔍 INVESTIGATING DUPLICATE VENDORS\n');
  console.log('=' .repeat(80));

  try {
    // Get all vendors with duplicate user_ids
    const duplicateUserIds = await sql`
      SELECT user_id
      FROM vendors
      GROUP BY user_id
      HAVING COUNT(*) > 1
    `;
    
    console.log(`Found ${duplicateUserIds.length} user_ids with duplicates\n`);

    for (const { user_id } of duplicateUserIds) {
      console.log(`\n📊 user_id: "${user_id}"`);
      console.log('-'.repeat(80));
      
      const vendors = await sql`
        SELECT 
          id,
          user_id,
          business_name,
          business_type,
          verified,
          created_at,
          updated_at
        FROM vendors
        WHERE user_id = ${user_id}
        ORDER BY created_at ASC
      `;
      
      console.log(`Total entries: ${vendors.length}\n`);
      
      vendors.forEach((v, idx) => {
        console.log(`  ${idx + 1}. vendors.id: "${v.id}"`);
        console.log(`     business_name: "${v.business_name}"`);
        console.log(`     business_type: "${v.business_type}"`);
        console.log(`     verified: ${v.verified}`);
        console.log(`     created_at: ${v.created_at}`);
        console.log(`     updated_at: ${v.updated_at}`);
        console.log('');
      });
      
      // Check which one has services
      const servicesCount = await sql`
        SELECT 
          vendor_id,
          COUNT(*) as service_count
        FROM services
        WHERE vendor_id = ${user_id}
        GROUP BY vendor_id
      `;
      
      if (servicesCount.length > 0) {
        console.log(`   ⚠️  This user_id has ${servicesCount[0].service_count} services in the services table`);
      } else {
        console.log(`   ✅ No services reference this user_id`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎯 RECOMMENDATION:\n');
    console.log('For each duplicate user_id:');
    console.log('  1. Keep the entry where vendors.id = vendors.user_id (NEW format)');
    console.log('  2. Delete the entry where vendors.id = VEN-XXXXX (OLD format)');
    console.log('\nThis ensures consistency: vendors.id should always equal vendors.user_id');
    console.log('=' .repeat(80) + '\n');

  } catch (error) {
    console.error('❌ Error investigating duplicates:', error);
    process.exit(1);
  }
}

investigateDuplicates();
