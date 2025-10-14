/**
 * Fix Existing Service Images
 * Update services that are using placeholder images to have no images instead
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function fixExistingServiceImages() {
  console.log('🔧 FIXING EXISTING SERVICE IMAGES');
  console.log('=================================');
  
  try {
    // Login to get token
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'vendor.test.1760378568692@example.com',
        password: 'testpassword123'
      })
    });
    
    const loginData = await loginResponse.json();
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData);
      return;
    }
    
    const token = loginData.token;
    const vendorId = loginData.user?.id;
    
    console.log('✅ Logged in as vendor:', vendorId);
    
    // Get vendor's services
    const servicesResponse = await fetch(`${API_BASE}/api/services/vendor/${vendorId}`);
    const servicesData = await servicesResponse.json();
    
    if (!servicesData.services || servicesData.services.length === 0) {
      console.log('❌ No services found for vendor');
      return;
    }
    
    for (const service of servicesData.services) {
      console.log(`\n🔍 Checking service: ${service.title} (${service.id})`);
      
      const hasPlaceholderImages = service.images && service.images.some(img => 
        img.includes('images.unsplash.com')
      );
      
      if (hasPlaceholderImages) {
        console.log('❌ Found placeholder images, removing them...');
        
        // Update the service to remove placeholder images
        const updateResponse = await fetch(`${API_BASE}/api/services/${service.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: service.title,
            description: service.description,
            category: service.category,
            price: service.price,
            price_range: service.price_range,
            location: service.location,
            is_active: service.is_active,
            featured: service.featured,
            images: [] // Remove all images so user can upload fresh ones
          })
        });
        
        if (updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.log('✅ Service updated successfully - placeholder images removed');
        } else {
          const errorData = await updateResponse.json().catch(() => ({}));
          console.log('❌ Failed to update service:', errorData.message || 'Unknown error');
        }
      } else {
        console.log('✅ Service has valid images or no images');
      }
    }
    
    console.log('\n🎯 SUMMARY:');
    console.log('==========');
    console.log('✅ Existing services with placeholder images have been cleaned up');
    console.log('💡 Now you can edit your service and upload new images');
    console.log('🔄 The new images will be properly uploaded to Cloudinary');
    
  } catch (error) {
    console.error('❌ Error fixing service images:', error);
  }
}

fixExistingServiceImages();
