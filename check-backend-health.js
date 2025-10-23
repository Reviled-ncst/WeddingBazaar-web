// Quick health check to verify backend is ready
const API_URL = 'https://weddingbazaar-web.onrender.com';

async function checkBackendHealth() {
  console.log('🏥 Checking backend health...\n');
  
  try {
    const response = await fetch(`${API_URL}/api/health`);
    const data = await response.json();
    
    console.log('📊 Backend Status:');
    console.log('   Status:', response.status);
    console.log('   Version:', data.version);
    console.log('   Database:', data.database);
    console.log('   Environment:', data.environment);
    
    if (response.ok && data.database === 'connected') {
      console.log('\n✅ Backend is healthy and ready!');
      console.log('\n🧪 Next: Test service creation in production');
      return true;
    } else {
      console.log('\n⚠️  Backend is responding but may have issues');
      return false;
    }
  } catch (error) {
    console.log('\n❌ Backend is not responding:',error.message);
    console.log('💡 Render might still be deploying...');
    return false;
  }
}

// Run check
checkBackendHealth();
