// Quick check of remaining services
const API_BASE_URL = 'https://weddingbazaar-web.onrender.com/api';

async function checkRemainingServices() {
  try {
    console.log('🔍 Checking remaining services...');
    const response = await fetch(`${API_BASE_URL}/services`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch services: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const services = data.services || data || [];
    
    console.log(`📊 Current services count: ${services.length}`);
    
    if (services.length > 0) {
      console.log('📋 Remaining services:');
      services.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.title || service.name || service.id} (ID: ${service.id})`);
      });
    } else {
      console.log('✅ No services remaining - database is clean!');
    }
    
  } catch (error) {
    console.error('❌ Error checking services:', error.message);
  }
}

checkRemainingServices();
