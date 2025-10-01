// Quick login fix script - run in browser console
console.log('🔧 Login Fix Script - Clearing old tokens and cache');

// Clear all auth-related storage
localStorage.removeItem('auth_token');
sessionStorage.clear();

// Clear any cached auth state
const authKeys = Object.keys(localStorage).filter(key => 
  key.includes('auth') || 
  key.includes('token') || 
  key.includes('user')
);
authKeys.forEach(key => {
  console.log('Removing:', key);
  localStorage.removeItem(key);
});

console.log('✅ Cache cleared. Now try logging in with:');
console.log('Email: couple1@gmail.com');
console.log('Password: any password (backend accepts any password for demo)');

// Test direct login function
async function testDirectLogin() {
  try {
    const response = await fetch('https://weddingbazaar-web.onrender.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email: 'couple1@gmail.com', 
        password: 'test123' 
      }),
    });

    const data = await response.json();
    console.log('🔐 Direct login test result:', data);
    
    if (data.success) {
      localStorage.setItem('auth_token', data.token);
      console.log('✅ Login successful! Token stored. Refresh the page.');
      return data;
    } else {
      console.error('❌ Login failed:', data);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run test login
console.log('🔄 Testing direct login...');
testDirectLogin();
