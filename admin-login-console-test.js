// Wedding Bazaar Admin Login Test
// Copy and paste this into the browser console on https://weddingbazaarph.web.app

console.log('👑 Wedding Bazaar Admin Login Test');
console.log('=====================================');

async function testAdminLogin() {
  try {
    console.log('🔐 Testing admin credentials...');
    
    const adminCredentials = {
      email: 'admin@weddingbazaar.com',
      password: 'AdminWB2025!'
    };
    
    console.log('📧 Email:', adminCredentials.email);
    console.log('🔑 Password:', adminCredentials.password);
    
    // Test the backend login endpoint
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminCredentials)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Admin login successful!');
      console.log('👤 Admin user data:', data.user);
      console.log('🎫 JWT Token:', data.token.substring(0, 50) + '...');
      
      // Store the token for testing
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      
      console.log('💾 Admin credentials stored in localStorage');
      console.log('🎯 You can now use the admin features!');
      
      // Test if we can access admin endpoints
      if (data.user.userType === 'admin') {
        console.log('👑 ADMIN ACCESS CONFIRMED!');
        console.log('🎉 You have admin privileges');
        
        // Try to trigger a page reload to see if auth context picks up the admin user
        console.log('🔄 Consider refreshing the page to see admin features');
        
        return {
          success: true,
          user: data.user,
          token: data.token
        };
      } else {
        console.log('❌ User type is not admin:', data.user.userType);
        return { success: false, error: 'Not an admin user' };
      }
      
    } else {
      console.log('❌ Login failed:', data.message || data.error);
      return { success: false, error: data.message || data.error };
    }
    
  } catch (error) {
    console.error('❌ Network error:', error);
    return { success: false, error: error.message };
  }
}

// Function to check if admin is already logged in
function checkAdminStatus() {
  const token = localStorage.getItem('adminToken');
  const user = localStorage.getItem('adminUser');
  
  if (token && user) {
    const userData = JSON.parse(user);
    console.log('🔍 Found stored admin session:');
    console.log('👤 User:', userData);
    console.log('🎫 Token exists:', !!token);
    
    if (userData.userType === 'admin') {
      console.log('👑 Admin session active!');
      return true;
    }
  }
  
  console.log('❌ No admin session found');
  return false;
}

// Function to clear admin session
function clearAdminSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  console.log('🧹 Admin session cleared');
}

// Run the test
console.log('🔍 Checking existing admin session...');
const hasAdminSession = checkAdminStatus();

if (!hasAdminSession) {
  console.log('🚀 Running admin login test...');
  testAdminLogin().then(result => {
    if (result.success) {
      console.log('🎉 Admin login test completed successfully!');
      console.log('💡 Try refreshing the page to see admin features');
    } else {
      console.log('❌ Admin login test failed:', result.error);
    }
  });
} else {
  console.log('✅ Admin already logged in!');
  console.log('💡 You should see admin features in the app');
}

// Export functions for manual use
window.testAdminLogin = testAdminLogin;
window.checkAdminStatus = checkAdminStatus;
window.clearAdminSession = clearAdminSession;

console.log('📝 Available functions:');
console.log('  - testAdminLogin() - Test admin login');
console.log('  - checkAdminStatus() - Check if admin is logged in');
console.log('  - clearAdminSession() - Clear admin session');
console.log('=====================================');
