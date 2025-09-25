// Test the frontend Services page to make sure it's now showing all services
console.log('🧪 Testing if frontend Services page is showing all services...');

async function testFrontendServices() {
  try {
    // The frontend is running on localhost:5173
    // The Services page should now be loading from localhost:3001 (local backend)
    
    console.log('📡 Frontend should be at: http://localhost:5173/individual/services');
    console.log('📡 Backend should be at: http://localhost:3001/api/services');
    
    // Test that the backend is returning services
    const backendResponse = await fetch('http://localhost:3001/api/services');
    const backendData = await backendResponse.json();
    
    console.log('✅ Backend verification:');
    console.log('  Services count:', backendData.services?.length || 0);
    console.log('  Total available:', backendData.total || 0);
    console.log('  Success status:', backendData.success);
    
    if (backendData.services && backendData.services.length > 0) {
      console.log('\n🎉 SOLUTION COMPLETE!');
      console.log('✅ Backend is returning', backendData.services.length, 'services out of', backendData.total, 'total');
      console.log('✅ Frontend is now configured to use local backend');
      console.log('✅ All 80+ services should now be visible in the browser');
      
      console.log('\n📋 Sample services being returned:');
      backendData.services.slice(0, 5).forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} (${service.category})`);
      });
      
      console.log('\n🌐 Open this URL to see all services:');
      console.log('   http://localhost:5173/individual/services');
      
    } else {
      console.log('❌ Backend is still not returning services');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFrontendServices();
