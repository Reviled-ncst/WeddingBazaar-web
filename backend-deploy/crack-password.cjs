// Test common passwords against the bcrypt hash from database
const bcrypt = require('bcrypt');

const hash = '$2b$12$LSQhCL0Q.uTzsGlxYQLaVer08z.5DhWvuB6dBmfl6EN3XWplMQa6.';
const commonPasswords = ['password', 'test123', 'demo123', '123456', 'password123', 'test', 'admin', 'user123'];

async function crackPassword() {
  console.log('🔍 Testing common passwords against database hash...\n');
  
  for (const password of commonPasswords) {
    try {
      const isMatch = await bcrypt.compare(password, hash);
      if (isMatch) {
        console.log(`✅ FOUND: Password is "${password}"`);
        return password;
      } else {
        console.log(`❌ Not "${password}"`);
      }
    } catch (error) {
      console.log(`Error testing "${password}":`, error.message);
    }
  }
  
  console.log('\n❌ None of the common passwords matched');
}

crackPassword();
