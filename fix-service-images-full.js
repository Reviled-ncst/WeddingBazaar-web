/**
 * Fix Existing Service Images (Full Payload)
 * Fetches the current service, keeps all fields, and only updates images to []
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function fixServiceImagesFullPayload() {
  console.log('🔧 FULL PAYLOAD FIX: EXISTING SERVICE IMAGES');
  console.log('============================================');
  
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
    
    // Get vendor's services
    const servicesResponse = await fetch(`${API_BASE}/api/services/vendor/${vendorId}`);
    const servicesData = await servicesResponse.json();
    
    if (!servicesData.services || servicesData.services.length === 0) {
      console.log('❌ No services found for vendor');
      return;
    }
    
    for (const service of servicesData.services) {
      if (!service.images || !service.images.some(img => img.includes('images.unsplash.com'))) continue;
      
      console.log(`\n🔍 Updating service: ${service.title} (${service.id})`);
      
      // Prepare update payload with all fields
      const updatePayload = { ...service, images: [] };
      
      const updateResponse = await fetch(`${API_BASE}/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatePayload)
      });
      
      if (updateResponse.ok) {
        const updateResult = await updateResponse.json();
        console.log('✅ Service updated successfully - placeholder images removed');
      } else {
        const errorData = await updateResponse.json().catch(() => ({}));
        console.log('❌ Failed to update service:', errorData.message || 'Unknown error');
      }
    }
    
    console.log('\n🎯 FULL PAYLOAD FIX COMPLETE:');
    console.log('All placeholder images removed. You can now upload new images.');
    
  } catch (error) {
    console.error('❌ Error fixing service images:', error);
  }
}

fixServiceImagesFullPayload();
