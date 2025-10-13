async function checkLatestServiceId() {
  console.log('🔍 Checking the ID of the latest created service...\n');
  
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  try {
    // Get services for vendor 2-2025-003 (the vendor used in our test)
    const response = await fetch(`${API_BASE}/services/vendor/2-2025-003`);
    const result = await response.json();

    if (response.ok && result.success) {
      console.log(`✅ Found ${result.services.length} services for vendor 2-2025-003`);
      
      // Sort by created_at to get the most recent
      const sortedServices = result.services.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      if (sortedServices.length > 0) {
        const latestService = sortedServices[0];
        
        console.log('\n📊 LATEST SERVICE DETAILS:');
        console.log(`🆔 Service ID: ${latestService.id}`);
        console.log(`📝 Title: ${latestService.title}`);
        console.log(`📅 Created: ${latestService.created_at}`);
        console.log(`💰 Price: $${latestService.price}`);
        console.log(`📍 Location: ${latestService.location}`);
        console.log(`💲 Price Range: ${latestService.price_range}`);
        console.log(`🖼️ Images: ${Array.isArray(latestService.images) ? latestService.images.length : 'Not an array'} images`);
        
        // Show ID format analysis
        console.log('\n🎯 ID FORMAT ANALYSIS:');
        console.log(`✅ Service ID: ${latestService.id}`);
        
        if (latestService.id.startsWith('SRV-')) {
          const idNumber = latestService.id.replace('SRV-', '');
          const isSequential = /^\d{4}$/.test(idNumber);
          
          console.log(`✅ Format: SRV-xxxx - ${latestService.id.startsWith('SRV-') ? 'CORRECT' : 'INCORRECT'}`);
          console.log(`✅ Sequential number: ${idNumber} - ${isSequential ? 'VALID 4-digit format' : 'INVALID format'}`);
          console.log(`✅ ID Type: ${isSequential ? 'Sequential (NEW FORMAT)' : 'Timestamp-based (OLD FORMAT)'}`);
        } else {
          console.log(`❌ Format: Does not start with SRV- - INCORRECT`);
        }
        
        // Show last few services for comparison
        console.log('\n📋 RECENT SERVICES (last 5):');
        sortedServices.slice(0, 5).forEach((service, index) => {
          console.log(`${index + 1}. ${service.id} - "${service.title}" (${service.created_at})`);
        });
        
      } else {
        console.log('❌ No services found');
      }
      
    } else {
      console.log('❌ Failed to fetch services');
      console.log('Error:', result.error || 'Unknown error');
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
  }
}

// Run the check
checkLatestServiceId().catch(console.error);
