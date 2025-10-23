// Detailed service inspection
const API_URL = 'https://weddingbazaar-web.onrender.com';

async function inspectServices() {
  console.log('🔍 Detailed Service Inspection\n');
  
  try {
    const response = await fetch(`${API_URL}/api/services`);
    const data = await response.json();
    
    console.log('📊 Service Analysis:');
    console.log('='.repeat(80));
    
    data.services.forEach((service, index) => {
      console.log(`\n${index + 1}. ${service.title} (${service.id})`);
      console.log(`   Category: ${service.category}`);
      console.log(`   Price Range: ${service.price_range || '❌ NOT SET'}`);
      console.log(`   Custom Price: ${service.price || '❌ NOT SET'}`);
      console.log(`   Features: ${service.features ? `✅ ${service.features.length} items` : '❌ NOT SET'}`);
      console.log(`   Created: ${service.created_at}`);
      
      // Determine what will be displayed
      if (service.price_range) {
        console.log(`   🎨 DISPLAY: "${service.price_range}" (from price_range)`);
      } else if (service.price && service.price > 0) {
        console.log(`   🎨 DISPLAY: "₱${service.price.toLocaleString()}" (from custom price)`);
      } else {
        console.log(`   🎨 DISPLAY: "Price on request" ⚠️ THIS IS THE BUG!`);
      }
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('\n📋 Summary:');
    const withPriceRange = data.services.filter(s => s.price_range);
    const withPrice = data.services.filter(s => s.price && s.price > 0);
    const noPricing = data.services.filter(s => !s.price_range && (!s.price || s.price === 0));
    
    console.log(`   Services with price_range: ${withPriceRange.length}`);
    console.log(`   Services with custom price: ${withPrice.length}`);
    console.log(`   Services with NO pricing: ${noPricing.length} ⚠️`);
    
    if (noPricing.length > 0) {
      console.log('\n⚠️  Services showing "Price on request":');
      noPricing.forEach(s => console.log(`   - ${s.title} (${s.id})`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

inspectServices();
