const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function comprehensiveDatabaseCheck() {
  try {
    console.log('🔍 COMPREHENSIVE DATABASE CHECK...');
    
    // Check total count
    console.log('Checking total vendor count...');
    const totalResult = await sql`SELECT COUNT(*) as count FROM vendors`;
    const totalCount = parseInt(totalResult[0].count);
    console.log('📊 TOTAL VENDORS IN DATABASE:', totalCount);
    
    // Check verified count
    console.log('Checking verified vendor count...');
    const verifiedResult = await sql`SELECT COUNT(*) as count FROM vendors WHERE verified = true`;
    const verifiedCount = parseInt(verifiedResult[0].count);
    console.log('✅ VERIFIED VENDORS:', verifiedCount);
    
    // Get sample vendors
    console.log('\n📋 SAMPLE VENDORS (first 15):');
    const sampleVendors = await sql`
      SELECT id, business_name, business_type, location, rating, review_count, verified 
      FROM vendors 
      ORDER BY id 
      LIMIT 15
    `;
    
    sampleVendors.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.business_name} (${vendor.business_type})`);
      console.log(`   ID: ${vendor.id}, Rating: ${vendor.rating}, Reviews: ${vendor.review_count}, Verified: ${vendor.verified}`);
    });
    
    // Check business types
    console.log('\n🏷️ BUSINESS TYPES:');
    const businessTypes = await sql`
      SELECT business_type, COUNT(*) as count 
      FROM vendors 
      GROUP BY business_type 
      ORDER BY count DESC
      LIMIT 10
    `;
    
    businessTypes.forEach(type => {
      console.log(`  ${type.business_type}: ${type.count} vendors`);
    });
    
    // Test backend query
    console.log('\n🔍 TESTING BACKEND QUERY (verified vendors):');
    const backendQuery = await sql`
      SELECT id, business_name, business_type, verified
      FROM vendors 
      WHERE verified = true
      ORDER BY id
      LIMIT 10
    `;
    console.log(`Backend query found: ${backendQuery.length} verified vendors`);
    backendQuery.forEach((vendor, index) => {
      console.log(`${index + 1}. ${vendor.business_name} (${vendor.business_type}) - ID: ${vendor.id}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  }
}

comprehensiveDatabaseCheck();
