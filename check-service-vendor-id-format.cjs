require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);

(async () => {
  console.log('Checking services table schema...\n');
  
  // Get sample services to see vendor_id format
  const services = await sql`
    SELECT id, vendor_id, title
    FROM services
    LIMIT 5
  `;
  
  console.log('Sample services:');
  services.forEach(s => {
    console.log(`  - vendor_id: ${s.vendor_id}, title: ${s.title}`);
  });
  
  // Check what vendor_id format the table expects
  console.log('\nChecking if VEN-00021 exists in services...');
  const venServices = await sql`
    SELECT COUNT(*) as count
    FROM services
    WHERE vendor_id = 'VEN-00021'
  `;
  console.log(`Services with VEN-00021: ${venServices[0].count}`);
  
  console.log('\nChecking if 2-2025-019 exists in services...');
  const userServices = await sql`
    SELECT COUNT(*) as count
    FROM services
    WHERE vendor_id = '2-2025-019'
  `;
  console.log(`Services with 2-2025-019: ${userServices[0].count}`);
  
  process.exit(0);
})();
