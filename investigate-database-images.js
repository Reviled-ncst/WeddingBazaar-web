// Deep dive into database image storage
console.log('🔬 Deep Database Image Investigation...');

async function investigateImages() {
  try {
    // Get detailed services data
    console.log('📡 Fetching all services from /api/services...');
    const response = await fetch('http://localhost:3001/api/services?limit=20');
    const data = await response.json();
    
    if (data.services) {
      console.log(`\n📊 Analysis of ${data.services.length} services:`);
      console.log(`📈 Total services in database: ${data.total}`);
      
      // Group services by image patterns
      const imageAnalysis = {
        withUniqueImages: [],
        withGalleries: [],
        withSameImage: [],
        withoutImages: []
      };
      
      console.log('\n🖼️ DETAILED IMAGE ANALYSIS:');
      console.log('=' .repeat(80));
      
      data.services.forEach((service, index) => {
        console.log(`\n${index + 1}. "${service.name}"`);
        console.log(`   Category: ${service.category}`);
        console.log(`   Location: ${service.location}`);
        console.log(`   Rating: ${service.rating} (${service.reviewCount} reviews)`);
        
        if (service.image) {
          console.log(`   🖼️ Main Image: ${service.image}`);
          
          // Check if it's a unique image or common fallback
          if (service.image.includes('photo-1519167758481')) {
            imageAnalysis.withSameImage.push(service.name);
          } else {
            imageAnalysis.withUniqueImages.push(service.name);
          }
        } else {
          console.log(`   ❌ No main image`);
          imageAnalysis.withoutImages.push(service.name);
        }
        
        if (service.gallery && service.gallery.length > 0) {
          console.log(`   🖼️ Gallery: ${service.gallery.length} images`);
          imageAnalysis.withGalleries.push(service.name);
          
          // Show first 3 gallery images
          service.gallery.slice(0, 3).forEach((img, i) => {
            console.log(`     ${i + 1}. ${img.substring(0, 100)}${img.length > 100 ? '...' : ''}`);
          });
        } else {
          console.log(`   📷 Gallery: None`);
        }
        
        console.log(`   💰 Price: ${service.priceRange}`);
        console.log(`   🏢 Vendor: ${service.vendorName}`);
      });
      
      // Summary analysis
      console.log('\n📊 SUMMARY ANALYSIS:');
      console.log('=' .repeat(80));
      console.log(`✅ Services with unique images: ${imageAnalysis.withUniqueImages.length}`);
      console.log(`📸 Services with galleries: ${imageAnalysis.withGalleries.length}`);
      console.log(`🔄 Services with same/fallback image: ${imageAnalysis.withSameImage.length}`);
      console.log(`❌ Services without images: ${imageAnalysis.withoutImages.length}`);
      
      if (imageAnalysis.withUniqueImages.length > 0) {
        console.log('\n✅ SERVICES WITH UNIQUE IMAGES:');
        imageAnalysis.withUniqueImages.forEach(name => console.log(`   - ${name}`));
      }
      
      if (imageAnalysis.withSameImage.length > 0) {
        console.log('\n🔄 SERVICES WITH SAME/FALLBACK IMAGE:');
        imageAnalysis.withSameImage.forEach(name => console.log(`   - ${name}`));
      }
      
    } else {
      console.log('❌ No services found in response');
    }
    
  } catch (error) {
    console.error('❌ Investigation failed:', error.message);
  }
}

investigateImages();
