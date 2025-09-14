const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function debugVendorQuery() {
  try {
    console.log('🔍 Debugging vendor queries...\n');
    
    // Check all vendors
    console.log('📊 ALL VENDORS:');
    const allVendors = await sql`SELECT id, business_name, business_type, years_experience, created_at FROM vendors ORDER BY id`;
    console.log(`Total vendors: ${allVendors.length}`);
    allVendors.forEach(vendor => {
      console.log(`  ${vendor.id}: ${vendor.business_name} (${vendor.business_type}) - Years: ${vendor.years_experience}`);
    });
    
    // Test the featured vendors query
    console.log('\n🌟 FEATURED VENDORS QUERY (years_experience > 0):');
    const featuredVendors = await sql`
      SELECT 
        v.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE v.years_experience > 0 AND u.user_type = 'vendor'
      ORDER BY v.years_experience DESC, v.created_at DESC
      LIMIT 6
    `;
    console.log(`Featured vendors: ${featuredVendors.length}`);
    featuredVendors.forEach(vendor => {
      console.log(`  ${vendor.id}: ${vendor.business_name} - ${vendor.years_experience} years`);
    });
    
    // Try a simpler query without years_experience filter
    console.log('\n✨ SIMPLE VENDORS QUERY (no experience filter):');
    const simpleVendors = await sql`
      SELECT 
        v.*,
        u.email,
        u.first_name,
        u.last_name,
        u.phone
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      WHERE u.user_type = 'vendor'
      ORDER BY v.created_at DESC
      LIMIT 6
    `;
    console.log(`Simple vendors: ${simpleVendors.length}`);
    simpleVendors.forEach(vendor => {
      console.log(`  ${vendor.id}: ${vendor.business_name} (${vendor.business_type})`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

debugVendorQuery();
