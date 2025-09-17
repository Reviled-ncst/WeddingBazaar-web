console.log('🔧 Testing API URL Configuration');

// Test environment variable
const apiUrl = import.meta.env.VITE_API_URL;
console.log('VITE_API_URL:', apiUrl);

// Test URL construction (similar to AuthContext)
const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const loginUrl = `${apiBaseUrl}/api/auth/login`;
const pingUrl = `${apiBaseUrl}/api/ping`;

console.log('🔍 Constructed URLs:');
console.log('  Login URL:', loginUrl);
console.log('  Ping URL:', pingUrl);

// Test ping endpoint
async function testPing() {
  try {
    console.log('🏓 Testing ping endpoint...');
    const response = await fetch(pingUrl, { method: 'HEAD' });
    console.log('✅ Ping response status:', response.status);
  } catch (error) {
    console.error('❌ Ping failed:', error);
  }
}

testPing();
