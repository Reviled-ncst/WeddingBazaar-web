require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkServiceVendorIds() {
  console.log('🔍 Checking what vendor_id services are using:\n');
  
  const services = await sql`
    SELECT id, vendor_id, title, created_at
    FROM services
    ORDER BY created_at DESC
  `;
  
  console.log(`Found ${services.length} services:\n`);
  
  services.forEach((service, i) => {
    console.log(`${i + 1}. Service: ${service.title}`);
    console.log(`   Service ID: ${service.id}`);
    console.log(`   Vendor ID: ${service.vendor_id}`);
    console.log(`   Created: ${service.created_at}`);
    console.log('');
  });
}

checkServiceVendorIds();
