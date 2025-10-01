// Check what images are actually stored in the services database
console.log('🔍 Checking services images in database...');

async function checkServicesImages() {
  try {
    // Get services from the local API
    const response = await fetch('http://localhost:3001/api/services?limit=20');
    const data = await response.json();
    
    if (data.services && data.services.length > 0) {
      console.log('\n📊 Services and their images:');
      console.log('=' .repeat(80));
      
      data.services.forEach((service, index) => {
        console.log(`\n${index + 1}. Service: "${service.name}"`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Image field: ${service.image ? 'YES' : 'NO'}`);
        if (service.image) {
          console.log(`   Image URL: ${service.image.substring(0, 100)}${service.image.length > 100 ? '...' : ''}`);
        }
        console.log(`   Gallery: ${service.gallery ? service.gallery.length : 0} images`);
        console.log(`   Vendor: ${service.vendorName}`);
      });
      
      console.log('\n📈 Summary:');
      const withImages = data.services.filter(s => s.image).length;
      const withoutImages = data.services.length - withImages;
      console.log(`   ✅ Services with images: ${withImages}`);
      console.log(`   ❌ Services without images: ${withoutImages}`);
      console.log(`   📊 Total services checked: ${data.services.length}`);
      
    } else {
      console.log('❌ No services returned from API');
    }
    
  } catch (error) {
    console.error('❌ Error checking services images:', error.message);
  }
}

checkServicesImages();
