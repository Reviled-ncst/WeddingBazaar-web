require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkLatestServices() {
  console.log('\n🔍 CHECKING LATEST SERVICES...\n');
  console.log('═'.repeat(80));
  
  try {
    // Get latest 10 services with vendor info
    const services = await sql`
      SELECT 
        s.id,
        s.vendor_id,
        s.service_name,
        s.service_type,
        s.is_package,
        s.base_price,
        s.gallery_images,
        s.created_at,
        v.business_name,
        v.business_type,
        u.email as vendor_email
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      LEFT JOIN users u ON v.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `;
    
    console.log(`\n📦 FOUND ${services.length} SERVICES:\n`);
    
    services.forEach((s, i) => {
      console.log(`${i + 1}. ${s.service_name}`);
      console.log(`   Service ID: ${s.id}`);
      console.log(`   Vendor: ${s.business_name || 'N/A'} (${s.vendor_email || 'N/A'})`);
      console.log(`   Vendor ID: ${s.vendor_id}`);
      console.log(`   Type: ${s.service_type}`);
      console.log(`   Package: ${s.is_package ? '✅ Yes' : '❌ No'}`);
      console.log(`   Base Price: ${s.base_price ? '₱' + s.base_price : 'N/A'}`);
      console.log(`   Gallery: ${s.gallery_images ? s.gallery_images.length + ' images' : 'No images'}`);
      console.log(`   Created: ${new Date(s.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Count services by vendor
    const vendorCounts = await sql`
      SELECT 
        v.id as vendor_id,
        v.business_name,
        u.email,
        COUNT(s.id) as service_count
      FROM vendors v
      LEFT JOIN users u ON v.user_id = u.id
      LEFT JOIN services s ON v.id = s.vendor_id
      GROUP BY v.id, v.business_name, u.email
      HAVING COUNT(s.id) > 0
      ORDER BY service_count DESC
    `;
    
    console.log('═'.repeat(80));
    console.log('\n📊 SERVICES BY VENDOR:\n');
    
    vendorCounts.forEach((vc, i) => {
      console.log(`${i + 1}. ${vc.business_name} (${vc.email})`);
      console.log(`   Vendor ID: ${vc.vendor_id}`);
      console.log(`   Services: ${vc.service_count}`);
      console.log('');
    });
    
    console.log('═'.repeat(80));
    console.log('\n✅ Check complete!\n');
    
  } catch (error) {
    console.error('❌ Error checking services:', error.message);
    process.exit(1);
  }
}

checkLatestServices();
