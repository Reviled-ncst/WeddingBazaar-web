/**
 * Check Services Database Schema
 * Verify what columns actually exist in the services table
 */

const API_BASE = 'https://weddingbazaar-web.onrender.com';

async function checkServicesSchema() {
  console.log('🔍 CHECKING SERVICES DATABASE SCHEMA');
  console.log('====================================');
  
  try {
    // Get a service to see what fields are actually returned
    const response = await fetch(`${API_BASE}/api/services/vendor/2-2025-023`);
    const data = await response.json();
    
    if (data.services && data.services.length > 0) {
      const service = data.services[0];
      console.log('📊 Actual service fields from database:');
      Object.keys(service).forEach(key => {
        console.log(`   ${key}: ${typeof service[key]} = ${JSON.stringify(service[key])}`);
      });
      
      console.log('\n🔍 Fields that might be causing issues:');
      const frontendFields = ['features', 'contact_info', 'tags', 'keywords'];
      frontendFields.forEach(field => {
        if (service.hasOwnProperty(field)) {
          console.log(`   ✅ ${field}: EXISTS in database`);
        } else {
          console.log(`   ❌ ${field}: MISSING from database - this will cause errors!`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkServicesSchema();
