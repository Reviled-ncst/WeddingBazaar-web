const { sql } = require('./backend-deploy/config/database.cjs');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin
const serviceAccount = require('./firebase-admin-key.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function recreateVendorsWithCorrectIDs() {
  try {
    console.log('🔧 RECREATING VENDORS WITH CORRECT 2-2025-XXX IDs\n');
    console.log('='.repeat(70));
    
    // Get all vendors with VU- user IDs
    const vendorsToFix = await sql`
      SELECT 
        v.id as vendor_id,
        v.user_id as old_user_id,
        v.business_name,
        v.business_type,
        v.description,
        v.location,
        v.years_experience,
        v.rating,
        u.email,
        u.firebase_uid
      FROM vendors v
      JOIN users u ON u.id = v.user_id
      WHERE v.user_id LIKE 'VU-%'
      ORDER BY v.id
    `;
    
    console.log(`Found ${vendorsToFix.length} vendors to fix\n`);
    
    let nextUserNumber = 6;
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    for (const vendor of vendorsToFix) {
      const newUserId = `2-2025-${String(nextUserNumber).padStart(3, '0')}`;
      
      console.log(`\n🔄 Fixing: ${vendor.business_name}`);
      console.log(`   Old User ID: ${vendor.old_user_id}`);
      console.log(`   New User ID: ${newUserId}`);
      console.log(`   Vendor ID: ${vendor.vendor_id}`);
      
      try {
        // Step 1: Delete old vendor_profiles
        await sql`
          DELETE FROM vendor_profiles 
          WHERE user_id = ${vendor.old_user_id}
        `;
        console.log('   ✅ Deleted old vendor_profile');
        
        // Step 2: Update vendor to NULL user_id temporarily
        await sql`
          UPDATE vendors 
          SET user_id = NULL
          WHERE id = ${vendor.vendor_id}
        `;
        console.log('   ✅ Unlinked vendor');
        
        // Step 3: Delete old user
        await sql`
          DELETE FROM users 
          WHERE id = ${vendor.old_user_id}
        `;
        console.log('   ✅ Deleted old user');
        
        // Step 4: Create new user with correct ID
        await sql`
          INSERT INTO users (id, email, password, first_name, user_type, email_verified, firebase_uid, role)
          VALUES (
            ${newUserId},
            ${vendor.email},
            ${hashedPassword},
            ${vendor.business_name},
            'vendor',
            true,
            ${vendor.firebase_uid},
            'vendor'
          )
        `;
        console.log('   ✅ Created new user');
        
        // Step 5: Link vendor to new user
        await sql`
          UPDATE vendors 
          SET user_id = ${newUserId}
          WHERE id = ${vendor.vendor_id}
        `;
        console.log('   ✅ Linked vendor to new user');
        
        // Step 6: Create new vendor_profile
        await sql`
          INSERT INTO vendor_profiles (
            user_id,
            business_name,
            business_description,
            business_type,
            service_area,
            years_in_business,
            vendor_type
          )
          VALUES (
            ${newUserId},
            ${vendor.business_name},
            ${vendor.description},
            ${vendor.business_type},
            ${vendor.location},
            ${vendor.years_experience},
            'business'
          )
        `;
        console.log('   ✅ Created new vendor_profile');
        
        console.log(`   🎉 Successfully fixed!`);
        
      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
      }
      
      nextUserNumber++;
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ VERIFICATION\n');
    
    const allVendorUsers = await sql`
      SELECT id, email 
      FROM users 
      WHERE user_type = 'vendor' OR role = 'vendor'
      ORDER BY id
    `;
    
    console.log('📊 All Vendor Users After Fix:\n');
    allVendorUsers.forEach(u => {
      const check = u.id.startsWith('2-2025-') ? '✅' : '⚠️';
      console.log(`   ${check} ${u.id} | ${u.email}`);
    });
    
    const vuCount = allVendorUsers.filter(u => u.id.startsWith('VU-')).length;
    if (vuCount === 0) {
      console.log('\n🎉 SUCCESS! All vendor users now use 2-2025-XXX format!');
    } else {
      console.log(`\n⚠️ Still have ${vuCount} VU- format users`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

recreateVendorsWithCorrectIDs();
