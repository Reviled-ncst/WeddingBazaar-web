require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function listAllVendors() {
  console.log('📊 All Vendors in System:\n');
  
  const vendors = await sql`
    SELECT id, business_name, user_id, created_at
    FROM vendors
    ORDER BY created_at
  `;
  
  vendors.forEach((vendor, i) => {
    console.log(`${i + 1}. Vendor ID: ${vendor.id}`);
    console.log(`   Business: ${vendor.business_name}`);
    console.log(`   User ID: ${vendor.user_id}`);
    console.log(`   Created: ${vendor.created_at}`);
    console.log('');
  });
  
  console.log(`✅ Total vendors: ${vendors.length}`);
  console.log('');
  console.log('💡 Next vendor registration will get: VEN-' + String(vendors.length + 1).padStart(5, '0'));
}

listAllVendors();
