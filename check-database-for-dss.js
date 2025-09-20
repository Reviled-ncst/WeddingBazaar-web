import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_9tiyUmfaX3QB@ep-mute-mode-a1c209pi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

(async () => {
  try {
    console.log('🔍 Checking database data...');
    
    // First, check table structure
    const vendorSchema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vendors'`;
    console.log('=== VENDOR TABLE STRUCTURE ===');
    console.log(JSON.stringify(vendorSchema, null, 2));
    
    const vendors = await sql`SELECT * FROM vendors LIMIT 5`;
    console.log('\n=== VENDORS IN DATABASE ===');
    console.log(JSON.stringify(vendors, null, 2));
    
    // Check services table structure
    const serviceSchema = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'services'`;
    console.log('\n=== SERVICES TABLE STRUCTURE ===');
    console.log(JSON.stringify(serviceSchema, null, 2));
    
    const services = await sql`SELECT * FROM services LIMIT 3`;
    console.log('\n=== SERVICES IN DATABASE ===');
    console.log(JSON.stringify(services, null, 2));
    
    console.log('\n✅ Database check completed');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
