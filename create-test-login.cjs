// Create a test login for user with existing bookings
const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', reject);

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createTestLogin() {
  try {
    console.log('\n🔐 CREATING TEST LOGIN FOR USER WITH BOOKINGS...\n');
    
    // Get a user that has bookings
    const bookingsResponse = await makeRequest('/api/bookings?coupleId=c-38319639-149&limit=1');
    
    if (bookingsResponse.data.success && bookingsResponse.data.data.bookings.length > 0) {
      const booking = bookingsResponse.data.data.bookings[0];
      console.log('📋 Found user with bookings:');
      console.log(`   User ID: ${booking.couple_id}`);
      console.log(`   Name: ${booking.couple_name}`);
      console.log(`   Email: ${booking.contact_email}`);
      console.log(`   Has ${bookingsResponse.data.data.total} bookings`);
      
      // Try to register this user (it will fail if already exists, but we'll get the structure)
      const testUser = {
        email: booking.contact_email || 'test-user@gmail.com',
        password: 'test123',
        firstName: booking.couple_name?.split(' ')[0] || 'Test',
        lastName: booking.couple_name?.split(' ').slice(1).join(' ') || 'User',
        role: 'couple'
      };
      
      console.log('\n📝 Trying to register test user:', testUser.email);
      const registerResponse = await makeRequest('/api/auth/register', 'POST', testUser);
      
      console.log('Registration response:', registerResponse.status);
      if (registerResponse.status === 201 || registerResponse.data.success) {
        console.log('✅ User registered successfully');
      } else if (registerResponse.status === 400 && registerResponse.data.message?.includes('already exists')) {
        console.log('ℹ️ User already exists, trying to login...');
      } else {
        console.log('Response:', registerResponse.data);
      }
      
      // Try to login
      console.log('\n🔐 Trying to login...');
      const loginResponse = await makeRequest('/api/auth/login', 'POST', {
        email: testUser.email,
        password: testUser.password
      });
      
      console.log('Login response status:', loginResponse.status);
      console.log('Login response:', loginResponse.data);
      
      if (loginResponse.data.success && loginResponse.data.user) {
        console.log('✅ Login successful!');
        console.log('User info:', {
          id: loginResponse.data.user.id,
          email: loginResponse.data.user.email,
          firstName: loginResponse.data.user.firstName,
          role: loginResponse.data.user.role
        });
        
        // Test if we can get bookings for this user
        console.log('\n📋 Testing bookings for logged-in user...');
        const userBookings = await makeRequest(`/api/bookings?coupleId=${loginResponse.data.user.id}`);
        console.log('Bookings for logged-in user:', {
          success: userBookings.data.success,
          total: userBookings.data.data?.total,
          count: userBookings.data.data?.bookings?.length
        });
        
      } else {
        console.log('❌ Login failed');
        
        // Let's try with a simpler user that definitely exists
        console.log('\n🧪 Creating a simple test user...');
        const simpleUser = {
          email: 'couple-test@example.com',
          password: 'test123',
          firstName: 'Test',
          lastName: 'Couple',
          role: 'couple'
        };
        
        const simpleRegister = await makeRequest('/api/auth/register', 'POST', simpleUser);
        console.log('Simple user registration:', simpleRegister.status);
        
        if (simpleRegister.status === 201 || simpleRegister.data.success) {
          console.log('✅ Simple user created, trying login...');
          const simpleLogin = await makeRequest('/api/auth/login', 'POST', {
            email: simpleUser.email,
            password: simpleUser.password
          });
          
          console.log('Simple login result:', {
            status: simpleLogin.status,
            success: simpleLogin.data.success,
            userId: simpleLogin.data.user?.id
          });
          
          if (simpleLogin.data.success) {
            console.log('✅ Can create and login users!');
            console.log('📋 Now you can:');
            console.log('   1. Go to http://localhost:5174');
            console.log('   2. Login with: couple-test@example.com / test123');
            console.log('   3. Navigate to /individual/bookings');
            console.log('   4. The user will have no bookings initially');
            console.log('   5. Use the service discovery to create bookings');
          }
        }
      }
      
    } else {
      console.log('❌ No bookings found or API error');
    }
    
  } catch (error) {
    console.error('❌ Error creating test login:', error.message);
  }
}

createTestLogin();
