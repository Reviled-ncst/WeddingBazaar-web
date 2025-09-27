// Check the exact format of the API response
console.log('🔍 Checking API response format...');

fetch('http://localhost:3001/api/database/scan')
  .then(response => response.json())
  .then(data => {
    console.log('📊 Response structure:');
    console.log('- success:', data.success);
    console.log('- total services:', data.services?.length);
    console.log('- endpoint:', data.endpoint);
    
    if (data.services && data.services.length > 0) {
      console.log('\n🔍 First service structure:');
      const firstService = data.services[0];
      Object.keys(firstService).forEach(key => {
        console.log(`  - ${key}: ${typeof firstService[key]} = ${firstService[key]}`);
      });
      
      console.log('\n📋 Sample services with names:');
      data.services.slice(0, 10).forEach(service => {
        console.log(`  • ${service.name || 'NO NAME'} (${service.category}) - ₱${service.price}`);
      });
    }
  })
  .catch(error => {
    console.error('❌ Error checking API format:', error);
  });
