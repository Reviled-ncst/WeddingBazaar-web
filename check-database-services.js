// Direct database check for services
const { Pool } = require('pg');

// Production database configuration
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_m4t2uNmNQhGa6DdGTHlbWLEDFZ0CgqYJ@ep-bitter-breeze-a5efzrrs.us-east-2.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkDatabaseServices() {
  try {
    console.log('🔍 Checking services in database...');
    
    // Get all services with vendor info
    const allServicesQuery = `
      SELECT 
        s.id,
        s.vendor_id,
        s.title,
        s.category,
        s.price,
        s.location,
        s.price_range,
        array_length(s.images, 1) as image_count,
        s.created_at,
        s.is_active,
        v.name as vendor_name
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      ORDER BY s.created_at DESC
      LIMIT 20
    `;
    
    const result = await pool.query(allServicesQuery);
    
    console.log(`\n📊 Total services found: ${result.rows.length}`);
    console.log('=====================================');
    
    if (result.rows.length === 0) {
      console.log('❌ No services found in database!');
      return;
    }
    
    // Show recent services
    console.log('\n🕒 Recent services:');
    result.rows.forEach((service, index) => {
      console.log(`\n${index + 1}. Service: ${service.title || 'No title'}`);
      console.log(`   - ID: ${service.id}`);
      console.log(`   - Vendor: ${service.vendor_name || service.vendor_id}`);
      console.log(`   - Category: ${service.category}`);
      console.log(`   - Price: ₱${service.price}`);
      console.log(`   - Location: ${service.location || 'Not specified'}`);
      console.log(`   - Price Range: ${service.price_range || 'Not specified'}`);
      console.log(`   - Images: ${service.image_count || 0} images`);
      console.log(`   - Created: ${new Date(service.created_at).toLocaleString()}`);
      console.log(`   - Active: ${service.is_active ? 'Yes' : 'No'}`);
    });
    
    // Check today's services specifically
    const todayQuery = `
      SELECT COUNT(*) as today_count
      FROM services 
      WHERE DATE(created_at) = CURRENT_DATE
    `;
    
    const todayResult = await pool.query(todayQuery);
    console.log(`\n📅 Services created today: ${todayResult.rows[0].today_count}`);
    
    // Check services by category
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM services
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const categoryResult = await pool.query(categoryQuery);
    console.log('\n📋 Services by category:');
    categoryResult.rows.forEach(cat => {
      console.log(`   - ${cat.category}: ${cat.count} services`);
    });
    
    // Check for vendor "2-2025-003" specifically (test vendor)
    const testVendorQuery = `
      SELECT id, title, created_at, is_active
      FROM services
      WHERE vendor_id = '2-2025-003'
      ORDER BY created_at DESC
    `;
    
    const testVendorResult = await pool.query(testVendorQuery);
    console.log(`\n🧪 Test vendor (2-2025-003) services: ${testVendorResult.rows.length}`);
    testVendorResult.rows.forEach((service, index) => {
      console.log(`   ${index + 1}. ${service.title} (${new Date(service.created_at).toLocaleString()}) - ${service.is_active ? 'Active' : 'Inactive'}`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabaseServices();
