// Create a test user for location testing

const API_BASE = 'https://weddingbazaar-web.onrender.com/api';

const testUser = {
  name: 'Location Tester',
  email: 'locationtest@weddingbazaar.com',
  password: 'testing123',
  user_type: 'individual'
};

async function createTestUser() {
  console.log('🚀 Creating test user for location testing...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });

    const data = await response.json();
    
    console.log('📝 Registration Response:', {
      status: response.status,
      success: data.success,
      message: data.message
    });

    if (data.success) {
      console.log('✅ Test user created successfully!');
      console.log('📧 Email:', testUser.email);
      console.log('🔑 Password:', testUser.password);
      return true;
    } else {
      console.log('❌ Failed to create test user:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔐 Testing login with new user...');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    const data = await response.json();
    
    console.log('🔍 Login Response:', {
      status: response.status,
      success: data.success,
      hasToken: !!data.token
    });

    if (data.success && data.token) {
      console.log('✅ Login successful! Token received.');
      return data.token;
    } else {
      console.log('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return null;
  }
}

async function main() {
  const created = await createTestUser();
  if (created) {
    const token = await testLogin();
    if (token) {
      console.log('\n🎉 Test user is ready for location testing!');
      console.log('📋 Use these credentials in the location test:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
    }
  }
}

main().catch(console.error);
