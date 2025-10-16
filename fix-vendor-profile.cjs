const { neon } = require('@neondatabase/serverless');
require('dotenv').config();
const sql = neon(process.env.DATABASE_URL);

async function createTestVendorProfile() {
  console.log('🔧 CREATING TEST VENDOR PROFILE');
  console.log('================================\n');
  
  try {
    // Check if we have any vendor users first
    const vendorUsers = await sql`
      SELECT id, email, first_name, last_name 
      FROM users 
      WHERE user_type = 'vendor'
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    let vendorUserId;
    
    if (vendorUsers.length === 0) {
      console.log('❌ No vendor users found. Creating one...');
      
      // Create a vendor user
      const [newUser] = await sql`
        INSERT INTO users (id, email, first_name, last_name, user_type, password, created_at, email_verified)
        VALUES (
          '2-2025-003',
          'testvendor@weddingbazaar.com',
          'Test',
          'Vendor',
          'vendor',
          '$2a$10$dummyhashedpasswordfortest',
          NOW(),
          true
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name
        RETURNING id, email, first_name, last_name
      `;
      
      vendorUserId = newUser.id;
      console.log('✅ Created vendor user:', newUser);
    } else {
      vendorUserId = vendorUsers[0].id;
      console.log('✅ Found existing vendor user:', vendorUsers[0]);
    }
    
    // Now create/update vendor profile
    const [vendorProfile] = await sql`
      INSERT INTO vendors (id, user_id, business_name, business_type, description, years_experience, rating, review_count, verified, created_at)
      VALUES (
        ${vendorUserId},
        ${vendorUserId},
        'Test Wedding Services',
        'Photography',
        'Professional wedding photography and videography services. Test vendor profile for service creation functionality.',
        5,
        4.5,
        12,
        true,
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        business_name = EXCLUDED.business_name,
        business_type = EXCLUDED.business_type,
        description = EXCLUDED.description,
        updated_at = NOW()
      RETURNING id, business_name, business_type
    `;
    
    console.log('✅ Created/updated vendor profile:', vendorProfile);
    
    // Verify the vendor profile exists
    const verification = await sql`
      SELECT v.id, v.business_name, v.user_id, u.email 
      FROM vendors v
      JOIN users u ON v.user_id = u.id
      WHERE v.id = ${vendorUserId}
    `;
    
    if (verification.length > 0) {
      console.log('\n🎯 SUCCESS! Vendor profile created and verified:');
      console.log(`   Vendor ID: ${verification[0].id}`);
      console.log(`   Business: ${verification[0].business_name}`);
      console.log(`   Email: ${verification[0].email}`);
      console.log(`\n📝 Frontend should now use vendor_id: "${verification[0].id}"`);
      console.log('   This ID will work with the foreign key constraint.');
    }
    
    // Test service creation to confirm foreign key works
    console.log('\n🧪 Testing service creation with this vendor ID...');
    
    try {
      const [testService] = await sql`
        INSERT INTO services (id, vendor_id, title, name, description, category, price_range, created_at)
        VALUES (
          ${'test-service-' + Date.now()},
          ${vendorProfile.id},
          'Test Photography Service',
          'Test Photography Service',
          'Professional wedding photography test service',
          'Photography',
          '1000-3000',
          NOW()
        )
        RETURNING id, vendor_id, title
      `;
      
      console.log('✅ Service creation test SUCCESSFUL!');
      console.log('   Service ID:', testService.id);
      console.log('   Vendor ID:', testService.vendor_id);
      
      // Clean up test service
      await sql`DELETE FROM services WHERE id = ${testService.id}`;
      console.log('🧹 Test service cleaned up');
      
    } catch (serviceError) {
      console.log('❌ Service creation test FAILED:', serviceError.message);
      
      if (serviceError.message.includes('foreign key constraint')) {
        console.log('   Foreign key constraint still failing - check database schema');
      }
    }
    
  } catch (error) {
    console.error('❌ Error creating vendor profile:', error);
  } finally {
    process.exit(0);
  }
}

createTestVendorProfile();
