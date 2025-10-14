/**
 * Debug Image Upload Issues
 * Check if there are services with actual uploaded images vs placeholder images
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function debugImageIssues() {
  console.log('🔍 DEBUG: IMAGE UPLOAD ISSUES');
  console.log('=============================');
  
  try {
    // Get the vendor's services
    const servicesResponse = await fetch(`${API_BASE}/api/services/vendor/2-2025-023`);
    const servicesData = await servicesResponse.json();
    
    console.log('📊 Vendor Services Analysis:');
    console.log('Services Count:', servicesData.services?.length || 0);
    
    if (servicesData.services && servicesData.services.length > 0) {
      servicesData.services.forEach((service, index) => {
        console.log(`\n🔍 Service ${index + 1} (${service.id}):`);
        console.log('   Title:', service.title);
        console.log('   Created:', new Date(service.created_at).toLocaleString());
        console.log('   Updated:', new Date(service.updated_at).toLocaleString());
        console.log('   Images:', service.images?.length || 0);
        
        if (service.images && service.images.length > 0) {
          service.images.forEach((img, imgIndex) => {
            const isPlaceholder = img.includes('images.unsplash.com');
            const isCloudinary = img.includes('cloudinary.com') || img.includes('res.cloudinary.com');
            console.log(`   Image ${imgIndex + 1}: ${isPlaceholder ? '❌ PLACEHOLDER' : isCloudinary ? '✅ CLOUDINARY' : '❓ OTHER'}`);
            console.log(`     URL: ${img.substring(0, 60)}...`);
          });
        }
      });
    }
    
    // Check all services to see if any have uploaded images
    console.log('\n🔍 Checking all services for uploaded images...');
    const allServicesResponse = await fetch(`${API_BASE}/api/services`);
    const allServicesData = await allServicesResponse.json();
    
    let cloudinaryCount = 0;
    let placeholderCount = 0;
    
    if (allServicesData.services) {
      allServicesData.services.forEach(service => {
        if (service.images && service.images.length > 0) {
          service.images.forEach(img => {
            if (img.includes('images.unsplash.com')) {
              placeholderCount++;
            } else if (img.includes('cloudinary.com') || img.includes('res.cloudinary.com')) {
              cloudinaryCount++;
            }
          });
        }
      });
    }
    
    console.log('\n📊 Image Analysis Across All Services:');
    console.log('Total services:', allServicesData.services?.length || 0);
    console.log('Placeholder images (Unsplash):', placeholderCount);
    console.log('Uploaded images (Cloudinary):', cloudinaryCount);
    
    console.log('\n🎯 Recommendations:');
    if (cloudinaryCount === 0 && placeholderCount > 0) {
      console.log('❌ No uploaded images found - all services using placeholders');
      console.log('🔧 This suggests Cloudinary uploads are failing');
      console.log('💡 Check Cloudinary configuration and API keys');
    } else if (cloudinaryCount > 0) {
      console.log('✅ Some uploaded images found');
      console.log('💡 Image upload is working, check specific service creation');
    }
    
  } catch (error) {
    console.error('❌ Error debugging images:', error);
  }
}

// Check Cloudinary service configuration
function checkCloudinaryConfig() {
  console.log('\n☁️ CLOUDINARY CONFIGURATION CHECK:');
  console.log('==================================');
  
  const cloudName = 'dht64xt1g'; // From your .env file
  const uploadPreset = 'weddingbazaarus'; // From your .env file
  
  console.log('Cloud Name:', cloudName);
  console.log('Upload Preset:', uploadPreset);
  
  console.log('\n🧪 Test Image Upload URLs:');
  console.log('Upload API:', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
  console.log('Transform API:', `https://res.cloudinary.com/${cloudName}/image/upload/`);
  
  console.log('\n💡 Troubleshooting Steps:');
  console.log('1. Create a new service with an image upload');
  console.log('2. Check browser console for Cloudinary errors');
  console.log('3. Verify the image appears in your Cloudinary dashboard');
  console.log('4. Check if the service in database has the correct image URL');
}

// Run debugging
debugImageIssues();
checkCloudinaryConfig();
