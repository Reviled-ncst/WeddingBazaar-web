require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkLatestService() {
  console.log('🔍 Checking latest service...\n');
  
  try {
    const services = await sql`
      SELECT id, vendor_id, title, created_at
      FROM services
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (services.length === 0) {
      console.log('❌ No services found');
      return;
    }
    
    const service = services[0];
    console.log('📊 Latest Service:');
    console.log('   ID:', service.id);
    console.log('   Vendor ID:', service.vendor_id);
    console.log('   Title:', service.title);
    console.log('   Created:', service.created_at);
    console.log('');
    
    // Check if vendor exists
    console.log('🔍 Checking if vendor exists...\n');
    
    const vendors = await sql`
      SELECT id, business_name, user_id
      FROM vendors
      WHERE id = ${service.vendor_id}
    `;
    
    if (vendors.length > 0) {
      console.log('✅ Vendor found:');
      console.log('   ID:', vendors[0].id);
      console.log('   Business Name:', vendors[0].business_name);
      console.log('   User ID:', vendors[0].user_id);
    } else {
      console.log('❌ Vendor NOT found with ID:', service.vendor_id);
      console.log('');
      
      // Try to find by user_id
      const vendorByUserId = await sql`
        SELECT id, business_name, user_id
        FROM vendors
        WHERE user_id = ${service.vendor_id}
      `;
      
      if (vendorByUserId.length > 0) {
        console.log('⚠️  Found vendor by user_id instead:');
        console.log('   Vendor ID:', vendorByUserId[0].id);
        console.log('   Business Name:', vendorByUserId[0].business_name);
        console.log('   User ID:', vendorByUserId[0].user_id);
        console.log('');
        console.log('⚠️  SERVICE HAS WRONG VENDOR_ID!');
        console.log('   Should be:', vendorByUserId[0].id);
        console.log('   Currently:', service.vendor_id);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkLatestService();
