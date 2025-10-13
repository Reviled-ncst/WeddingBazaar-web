// Check available endpoints
import fetch from 'node-fetch';

async function checkEndpoints() {
  try {
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/test-404', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    
    const data = await response.json();
    console.log('Available endpoints:', data.availableEndpoints);
    
    // Check if our admin endpoint is listed
    const hasAdminEndpoint = data.availableEndpoints?.includes('POST /api/admin/fix-vendor-mappings');
    console.log('Admin endpoint available:', hasAdminEndpoint);
    
  } catch (error) {
    console.error('Error checking endpoints:', error.message);
  }
}

checkEndpoints();
