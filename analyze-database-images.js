// Comprehensive database image analysis
console.log('🔍 Comprehensive Database Image Analysis...');

async function analyzeDatabase() {
  try {
    console.log('📊 Checking database structure and image data...\n');
    
    // Test different endpoints to see what's available
    const endpoints = [
      'http://localhost:3001/api/services',
      'http://localhost:3001/api/vendors',
      'http://localhost:3001/api/services/vendor/2-2025-003'
    ];
    
    for (const endpoint of endpoints) {
      console.log(`\n🔗 Testing endpoint: ${endpoint}`);
      console.log('=' .repeat(80));
      
      try {
        const response = await fetch(endpoint);
        const data = await response.json();
        
        if (endpoint.includes('/services') && data.services) {
          console.log(`📈 Found ${data.services.length} services`);
          console.log(`📊 Total in database: ${data.total || data.totalCount || 'Unknown'}`);
          
          // Analyze first 5 services for image data
          console.log('\n🖼️ Image Analysis (First 5 services):');
          data.services.slice(0, 5).forEach((service, index) => {
            console.log(`\n${index + 1}. "${service.name}"`);
            console.log(`   Category: ${service.category}`);
            
            // Check for different image field names
            const imageFields = ['image', 'imageUrl', 'images', 'gallery', 'photos'];
            imageFields.forEach(field => {
              if (service[field]) {
                if (Array.isArray(service[field])) {
                  console.log(`   ${field}: [${service[field].length} items]`);
                  service[field].slice(0, 3).forEach((img, i) => {
                    console.log(`     ${i + 1}. ${img.substring(0, 80)}${img.length > 80 ? '...' : ''}`);
                  });
                } else {
                  console.log(`   ${field}: ${service[field].substring(0, 80)}${service[field].length > 80 ? '...' : ''}`);
                }
              }
            });
          });
          
        } else if (endpoint.includes('/vendors') && Array.isArray(data)) {
          console.log(`📈 Found ${data.length} vendors`);
          
          // Check vendor image data
          console.log('\n🖼️ Vendor Image Analysis:');
          data.slice(0, 3).forEach((vendor, index) => {
            console.log(`\n${index + 1}. "${vendor.business_name || vendor.name}"`);
            
            // Check for vendor image fields
            const vendorImageFields = ['profile_image', 'image', 'business_image', 'avatar'];
            vendorImageFields.forEach(field => {
              if (vendor[field]) {
                console.log(`   ${field}: ${vendor[field].substring(0, 80)}${vendor[field].length > 80 ? '...' : ''}`);
              }
            });
          });
          
        } else if (Array.isArray(data)) {
          console.log(`📈 Found ${data.length} items`);
          console.log('\n🖼️ Item samples:');
          data.slice(0, 3).forEach((item, index) => {
            console.log(`${index + 1}. ${JSON.stringify(item).substring(0, 100)}...`);
          });
        } else {
          console.log('📄 Response structure:');
          console.log(JSON.stringify(data, null, 2).substring(0, 500) + '...');
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    // Try to check specific database tables if possible
    console.log('\n🗄️ Attempting to check database table structure...');
    try {
      const healthResponse = await fetch('http://localhost:3001/api/health');
      const healthData = await healthResponse.json();
      console.log('🏥 Backend health:', healthData);
    } catch (error) {
      console.log('❌ Could not check backend health');
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

analyzeDatabase();
