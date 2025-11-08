/**
 * 🔍 Search for Vendor 2-2025-019
 */

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function findVendor() {
  try {
    console.log('🔍 Searching for vendor 2-2025-019...\n');
    
    // Search in vendors table
    const vendorSearch = await sql`
      SELECT * FROM vendors WHERE id = '2-2025-019'
    `;
    
    console.log('📦 Vendors table search result:', vendorSearch.length > 0 ? 'FOUND' : 'NOT FOUND');
    if (vendorSearch.length > 0) {
      console.log(JSON.stringify(vendorSearch[0], null, 2));
    }
    
    // Search for similar IDs
    console.log('\n🔍 Searching for vendors with ID containing "019"...\n');
    const similarIds = await sql`
      SELECT id, business_name, user_id FROM vendors WHERE id LIKE '%019%'
    `;
    
    console.log(`Found ${similarIds.length} vendor(s) with "019" in ID:`);
    similarIds.forEach(v => {
      console.log(`  - ${v.id} (${v.business_name})`);
    });
    
    // List all vendors with 2-2025- prefix
    console.log('\n📋 All vendors with 2-2025- prefix:\n');
    const allVendors = await sql`
      SELECT id, business_name, user_id, created_at 
      FROM vendors 
      WHERE id LIKE '2-2025-%'
      ORDER BY id
    `;
    
    console.log(`Found ${allVendors.length} vendor(s):\n`);
    allVendors.forEach((v, i) => {
      console.log(`${i+1}. ${v.id} - ${v.business_name}`);
      console.log(`   User ID: ${v.user_id}`);
      console.log(`   Created: ${v.created_at}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\n📋 Full error:', error.message);
    process.exit(1);
  }
}

findVendor();
