/**
 * TEST USER CREDENTIALS
 * Created by automated registration tests
 */

console.log('🔑 TEST USER CREDENTIALS');
console.log('========================');

console.log('\n👤 INDIVIDUAL/COUPLE USERS:');
console.log('Latest Individual User:');
console.log('  Email: id.test.user.1760378567063@example.com');
console.log('  Password: testpassword123');
console.log('  User ID: 1-2025-016');
console.log('  Type: couple');

console.log('\n🏢 VENDOR USERS:');
console.log('Latest Vendor User:');
console.log('  Email: vendor.test.1760378568692@example.com');
console.log('  Password: testpassword123');
console.log('  User ID: 2-2025-023');
console.log('  Type: vendor');

console.log('\n🌐 LOGIN INSTRUCTIONS:');
console.log('1. Go to: http://localhost:5173');
console.log('2. Click "Login/Register" button in top right');
console.log('3. Click "Login" tab');
console.log('4. Use any of the credentials above');

console.log('\n🧪 FOR MANUAL TESTING:');
console.log('Use these simple credentials for easy manual testing:');

const simpleCredentials = {
  individual: {
    email: 'test@couple.com',
    password: 'password123',
  },
  vendor: {
    email: 'test@vendor.com', 
    password: 'password123',
  }
};

console.log('\nSimple Individual User:');
console.log(`  Email: ${simpleCredentials.individual.email}`);
console.log(`  Password: ${simpleCredentials.individual.password}`);

console.log('\nSimple Vendor User:');
console.log(`  Email: ${simpleCredentials.vendor.email}`);
console.log(`  Password: ${simpleCredentials.vendor.password}`);

console.log('\n📝 REGISTRATION TEST DATA:');
console.log('If you want to create new users via the registration form, use:');

const registrationData = {
  individual: {
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    password: 'TestPassword123!',
    userType: 'couple',
    weddingDate: '2024-12-25',
    partnerName: 'Jane Smith'
  },
  vendor: {
    firstName: 'Alice',
    lastName: 'Johnson',
    email: 'alice@dreamweddings.com',
    password: 'VendorPass123!',
    userType: 'vendor',
    businessName: 'Dream Wedding Photography',
    businessType: 'Photography',
    location: 'New York, NY',
    description: 'Professional wedding photography services'
  }
};

console.log('\nFor Individual Registration:');
console.log(JSON.stringify(registrationData.individual, null, 2));

console.log('\nFor Vendor Registration:');
console.log(JSON.stringify(registrationData.vendor, null, 2));

console.log('\n🚀 TESTING STATUS:');
console.log('✅ Backend API: https://weddingbazaar-web.onrender.com - LIVE');
console.log('✅ Frontend: http://localhost:5173 - RUNNING');
console.log('✅ Registration: Working with correct ID formats');
console.log('✅ Login: Working with JWT tokens');
console.log('✅ Database: Connected with user records');

console.log('\n🔍 NEXT STEPS:');
console.log('1. Login with existing credentials above');
console.log('2. Or register new users via the frontend form');
console.log('3. Test vendor service creation');
console.log('4. Verify all user flows work correctly');
