// Test script for enhanced Philippine geolocation
// Usage: Run this in browser console to test location accuracy

async function testEnhancedGeolocation() {
  console.log('🇵🇭 Testing Enhanced Philippine Geolocation...');
  
  // Test coordinates for various Philippine locations
  const testLocations = [
    { name: 'Dasmariñas, Cavite', lat: 14.3294, lng: 120.9366 },
    { name: 'Bacoor, Cavite', lat: 14.4598, lng: 120.9542 },
    { name: 'Manila', lat: 14.5995, lng: 120.9842 },
    { name: 'Makati', lat: 14.5547, lng: 121.0244 },
    { name: 'Quezon City', lat: 14.6760, lng: 121.0437 },
    { name: 'Antipolo, Rizal', lat: 14.5883, lng: 121.1598 },
    { name: 'Calamba, Laguna', lat: 14.2118, lng: 121.1653 }
  ];
  
  console.log('📍 Testing reverse geocoding for Philippine locations:');
  
  for (const location of testLocations) {
    try {
      console.log(`\n🏢 Testing: ${location.name}`);
      console.log(`📍 Coordinates: ${location.lat}, ${location.lng}`);
      
      // Import and test the enhanced reverse geocoding
      const { reverseGeocode } = await import('./geolocation-enhanced');
      const address = await reverseGeocode(location.lat, location.lng);
      
      console.log(`✅ Enhanced Address: ${address}`);
      
      // Test bounds checking
      const { isWithinPhilippines } = await import('./geolocation-enhanced');
      const isValid = isWithinPhilippines(location.lat, location.lng);
      console.log(`🌏 Within Philippines: ${isValid ? '✅ Yes' : '❌ No'}`);
      
    } catch (error) {
      console.error(`❌ Error for ${location.name}:`, error);
    }
  }
  
  console.log('\n🎯 Testing current location detection...');
  try {
    const { getCurrentLocationWithAddress } = await import('./geolocation-enhanced');
    const result = await getCurrentLocationWithAddress();
    console.log('✅ Current location result:', result);
  } catch (error) {
    console.log('ℹ️ Current location test (requires user permission):', error instanceof Error ? error.message : 'Unknown error');
  }
}

// For browser testing
if (typeof window !== 'undefined') {
  (window as any).testEnhancedGeolocation = testEnhancedGeolocation;
  console.log('🚀 Enhanced geolocation test loaded! Run: testEnhancedGeolocation()');
}

export { testEnhancedGeolocation };
