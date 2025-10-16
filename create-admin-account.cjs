const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcrypt');
require('dotenv').config();

const sql = neon(process.env.DATABASE_URL);

async function createAdminAccount() {
  try {
    console.log('🔧 Creating Admin Account for Wedding Bazaar...');
    
    // Admin account details
    const adminData = {
      email: 'admin@weddingbazaar.com',
      password: 'AdminWB2025!', // Strong password
      firstName: 'Wedding Bazaar',
      lastName: 'Administrator',
      phone: '+639625067209', // Your phone number
      userType: 'admin'
    };
    
    console.log('\n📋 Admin Account Details:');
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Password: ${adminData.password}`);
    console.log(`  Name: ${adminData.firstName} ${adminData.lastName}`);
    console.log(`  Phone: ${adminData.phone}`);
    console.log(`  Type: ${adminData.userType}`);
    
    // Check if admin account already exists
    const existingAdmin = await sql`
      SELECT id, email, user_type FROM users 
      WHERE email = ${adminData.email} OR user_type = 'admin'
    `;
    
    if (existingAdmin.length > 0) {
      console.log('\n⚠️ Admin account already exists:');
      existingAdmin.forEach(admin => {
        console.log(`  ${admin.email} - ${admin.user_type} (ID: ${admin.id})`);
      });
      
      const updateExisting = process.argv.includes('--update');
      if (!updateExisting) {
        console.log('\n💡 Use --update flag to update existing admin account');
        return;
      }
      
      console.log('\n🔄 Updating existing admin account...');
    }
    
    // Hash the password
    console.log('\n🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminData.password, saltRounds);
    console.log('✅ Password hashed successfully');
    
    // Generate a shorter admin ID (20 chars max)
    const adminId = 'admin-' + Date.now().toString().slice(-10); // admin-1234567890 format
    
    // Create or update admin account
    const adminResult = await sql`
      INSERT INTO users (
        id,
        email, 
        password, 
        user_type, 
        first_name, 
        last_name, 
        phone,
        email_verified,
        phone_verified,
        created_at,
        updated_at
      ) VALUES (
        ${adminId},
        ${adminData.email},
        ${hashedPassword},
        ${adminData.userType},
        ${adminData.firstName},
        ${adminData.lastName},
        ${adminData.phone},
        true,
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = EXCLUDED.password,
        user_type = EXCLUDED.user_type,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        email_verified = EXCLUDED.email_verified,
        phone_verified = EXCLUDED.phone_verified,
        updated_at = NOW()
      RETURNING *
    `;
    
    console.log('\n✅ Admin account created/updated successfully!');
    console.log('\n👤 Admin User Details:');
    console.log(`  ID: ${adminResult[0].id}`);
    console.log(`  Email: ${adminResult[0].email}`);
    console.log(`  Type: ${adminResult[0].user_type}`);
    console.log(`  Name: ${adminResult[0].first_name} ${adminResult[0].last_name}`);
    console.log(`  Phone: ${adminResult[0].phone}`);
    console.log(`  Email Verified: ${adminResult[0].email_verified}`);
    console.log(`  Phone Verified: ${adminResult[0].phone_verified}`);
    console.log(`  Created: ${adminResult[0].created_at}`);
    
    // Test login credentials
    console.log('\n🧪 Testing login credentials...');
    const loginTest = await bcrypt.compare(adminData.password, adminResult[0].password);
    console.log(`Password verification: ${loginTest ? '✅ Success' : '❌ Failed'}`);
    
    // Check all user types in database
    console.log('\n📊 Current user types in database:');
    const userTypes = await sql`
      SELECT user_type, COUNT(*) as count 
      FROM users 
      WHERE user_type IS NOT NULL 
      GROUP BY user_type
    `;
    
    userTypes.forEach(type => {
      console.log(`  ${type.user_type}: ${type.count} user(s)`);
    });
    
    console.log('\n🎉 Admin account setup complete!');
    console.log('\n📝 Login Instructions:');
    console.log('1. Go to: https://weddingbazaarph.web.app');
    console.log('2. Click "Login" and use these credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('3. You should be logged in as an administrator');
    
    console.log('\n🔧 API Testing:');
    console.log('POST https://weddingbazaar-web.onrender.com/api/auth/login');
    console.log('Body:', JSON.stringify({
      email: adminData.email,
      password: adminData.password
    }, null, 2));
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    
    if (error.message.includes('bcrypt')) {
      console.log('\n💡 Installing bcrypt dependency...');
      console.log('Run: npm install bcrypt');
    }
  }
}

// Run the script
createAdminAccount();
