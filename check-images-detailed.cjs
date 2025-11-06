// Detailed service images check
require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function detailedImageCheck() {
  try {
    console.log('🔍 DETAILED SERVICE IMAGES CHECK\n');
    
    // Get all services with images
    const services = await sql`
      SELECT 
        s.id,
        s.title,
        s.vendor_id,
        v.business_name,
        s.images,
        s.category
      FROM services s
      LEFT JOIN vendors v ON s.vendor_id = v.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `;
    
    console.log(`📊 Checking ${services.length} services...\n`);
    
    let stats = {
      total: services.length,
      withImages: 0,
      withoutImages: 0,
      nullImages: 0,
      emptyArray: 0,
      totalImageCount: 0,
      brokenUrls: []
    };
    
    services.forEach((service, index) => {
      const hasImages = service.images && Array.isArray(service.images) && service.images.length > 0;
      
      if (hasImages) {
        stats.withImages++;
        stats.totalImageCount += service.images.length;
        
        console.log(`${index + 1}. ✅ ${service.title}`);
        console.log(`   Vendor: ${service.business_name || 'Unknown'}`);
        console.log(`   Images: ${service.images.length}`);
        
        service.images.forEach((img, i) => {
          // Check if URL is accessible
          const isValid = img && typeof img === 'string' && img.length > 0;
          const isAbsolute = img.startsWith('http://') || img.startsWith('https://');
          
          if (!isValid) {
            console.log(`   ❌ ${i + 1}. INVALID: ${JSON.stringify(img)}`);
            stats.brokenUrls.push({ service: service.title, url: img, reason: 'Invalid format' });
          } else if (!isAbsolute) {
            console.log(`   ⚠️  ${i + 1}. RELATIVE: ${img}`);
          } else {
            console.log(`   ✅ ${i + 1}. ${img.substring(0, 60)}...`);
          }
        });
        console.log('');
      } else {
        if (service.images === null) {
          stats.nullImages++;
        } else if (Array.isArray(service.images) && service.images.length === 0) {
          stats.emptyArray++;
        }
        stats.withoutImages++;
        console.log(`${index + 1}. ❌ ${service.title} - NO IMAGES`);
        console.log(`   Vendor: ${service.business_name || 'Unknown'}`);
        console.log(`   Images value: ${JSON.stringify(service.images)}`);
        console.log('');
      }
    });
    
    // Print statistics
    console.log('\n' + '='.repeat(80));
    console.log('📊 STATISTICS:');
    console.log('='.repeat(80));
    console.log(`Total services checked: ${stats.total}`);
    console.log(`✅ Services with images: ${stats.withImages} (${Math.round(stats.withImages/stats.total*100)}%)`);
    console.log(`❌ Services without images: ${stats.withoutImages} (${Math.round(stats.withoutImages/stats.total*100)}%)`);
    console.log(`   - NULL: ${stats.nullImages}`);
    console.log(`   - Empty array: ${stats.emptyArray}`);
    console.log(`📸 Total images: ${stats.totalImageCount}`);
    console.log(`📈 Avg images per service: ${(stats.totalImageCount/stats.withImages || 0).toFixed(2)}`);
    
    if (stats.brokenUrls.length > 0) {
      console.log(`\n⚠️  BROKEN/INVALID URLs: ${stats.brokenUrls.length}`);
      stats.brokenUrls.forEach(item => {
        console.log(`   - ${item.service}: ${item.url} (${item.reason})`);
      });
    }
    
    // Check vendors table for images too
    console.log('\n' + '='.repeat(80));
    console.log('🔍 CHECKING VENDOR IMAGES:');
    console.log('='.repeat(80));
    
    const vendors = await sql`
      SELECT id, business_name, portfolio_images
      FROM vendors
      LIMIT 20
    `;
    
    let vendorStats = {
      total: vendors.length,
      withImages: 0,
      withoutImages: 0
    };
    
    vendors.forEach(vendor => {
      const hasImages = vendor.portfolio_images && Array.isArray(vendor.portfolio_images) && vendor.portfolio_images.length > 0;
      
      if (hasImages) {
        vendorStats.withImages++;
        console.log(`✅ ${vendor.business_name}: ${vendor.portfolio_images.length} image(s)`);
      } else {
        vendorStats.withoutImages++;
        console.log(`❌ ${vendor.business_name}: NO IMAGES`);
      }
    });
    
    console.log(`\nVendor Stats:`);
    console.log(`  With images: ${vendorStats.withImages}/${vendorStats.total}`);
    console.log(`  Without images: ${vendorStats.withoutImages}/${vendorStats.total}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

detailedImageCheck()
  .then(() => {
    console.log('\n✅ Check complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
