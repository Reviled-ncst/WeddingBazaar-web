// Check the deployment status and available endpoints
async function checkDeploymentStatus() {
  const API_BASE = 'https://weddingbazaar-web.onrender.com/api';
  
  try {
    console.log('🚀 Checking deployment status...');
    
    // Check health endpoint for version info
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('🏥 Health check:', JSON.stringify(healthData, null, 2));
    
    // Try the new PUT endpoint (should return 404 if not deployed)
    console.log('\n🧪 Testing PUT endpoint...');
    const putResponse = await fetch(`${API_BASE}/bookings/662340/update-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'quote_sent',
        vendor_notes: 'Test note'
      })
    });
    
    const putResult = await putResponse.json();
    console.log('📤 PUT Response:', JSON.stringify(putResult, null, 2));
    
    // Try the PATCH endpoint with quote_sent
    console.log('\n🧪 Testing PATCH endpoint with quote_sent...');
    const patchResponse = await fetch(`${API_BASE}/bookings/662340/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'quote_sent',
        vendor_notes: 'Test note via PATCH'
      })
    });
    
    const patchResult = await patchResponse.json();
    console.log('📤 PATCH Response:', JSON.stringify(patchResult, null, 2));
    
  } catch (error) {
    console.error('❌ Error checking deployment:', error);
  }
}

checkDeploymentStatus();
