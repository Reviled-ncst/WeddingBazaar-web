const admin = require('firebase-admin');
const { sql } = require('./backend-deploy/config/database.cjs');
const bcrypt = require('bcrypt');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = require('./weddingbazaar-firebase-adminsdk.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

/**
 * Create vendor accounts with Firebase Auth + Database entries
 * One vendor for each of the 15 service categories
 */

const vendorAccountsByCategory = [
  {
    category: 'Photography',
    email: 'photography@weddingbazaar.ph',
    password: 'Photography2024!',
    businessName: 'Perfect Moments Photography',
    firstName: 'Carlos',
    lastName: 'Reyes',
    phone: '+639171234001',
    description: 'Professional wedding photography capturing your special moments in Dasmariñas, Cavite'
  },
  {
    category: 'Planning',
    email: 'planner@weddingbazaar.ph',
    password: 'Planning2024!',
    businessName: 'Dream Weddings Planning',
    firstName: 'Maria',
    lastName: 'Santos',
    phone: '+639171234002',
    description: 'Expert wedding planning and coordination services for Cavite weddings'
  },
  {
    category: 'Florist',
    email: 'florist@weddingbazaar.ph',
    password: 'Florist2024!',
    businessName: 'Blooming Elegance Florist',
    firstName: 'Sofia',
    lastName: 'Cruz',
    phone: '+639171234003',
    description: 'Beautiful floral arrangements and decorations for Dasmariñas weddings'
  },
  {
    category: 'Beauty',
    email: 'beauty@weddingbazaar.ph',
    password: 'Beauty2024!',
    businessName: 'Glam Squad Beauty Studio',
    firstName: 'Isabella',
    lastName: 'Ramos',
    phone: '+639171234004',
    description: 'Professional hair and makeup services for brides in Cavite'
  },
  {
    category: 'Catering',
    email: 'catering@weddingbazaar.ph',
    password: 'Catering2024!',
    businessName: 'Fiesta Catering Services',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    phone: '+639171234005',
    description: 'Delicious Filipino and international catering for Dasmariñas weddings'
  },
  {
    category: 'Music',
    email: 'music@weddingbazaar.ph',
    password: 'Music2024!',
    businessName: 'Harmony Live Band & DJ',
    firstName: 'Miguel',
    lastName: 'Torres',
    phone: '+639171234006',
    description: 'Live music and DJ services for weddings in Cavite'
  },
  {
    category: 'Officiant',
    email: 'officiant@weddingbazaar.ph',
    password: 'Officiant2024!',
    businessName: 'Sacred Vows Officiant Services',
    firstName: 'Father Jose',
    lastName: 'Mendoza',
    phone: '+639171234007',
    description: 'Professional wedding officiant for ceremonies in Dasmariñas'
  },
  {
    category: 'Venue',
    email: 'venue@weddingbazaar.ph',
    password: 'Venue2024!',
    businessName: 'Garden Paradise Events Venue',
    firstName: 'Ana',
    lastName: 'Garcia',
    phone: '+639171234008',
    description: 'Beautiful garden and indoor venues in Dasmariñas City, Cavite'
  },
  {
    category: 'Rentals',
    email: 'rentals@weddingbazaar.ph',
    password: 'Rentals2024!',
    businessName: 'Complete Event Rentals',
    firstName: 'Ricardo',
    lastName: 'Flores',
    phone: '+639171234009',
    description: 'Furniture, tents, and equipment rentals for Cavite weddings'
  },
  {
    category: 'Cake',
    email: 'cake@weddingbazaar.ph',
    password: 'Cake2024!',
    businessName: 'Sweet Dreams Cake Studio',
    firstName: 'Camila',
    lastName: 'Herrera',
    phone: '+639171234010',
    description: 'Custom wedding cakes and desserts in Dasmariñas'
  },
  {
    category: 'Fashion',
    email: 'fashion@weddingbazaar.ph',
    password: 'Fashion2024!',
    businessName: 'Elegant Bridal Couture',
    firstName: 'Valentina',
    lastName: 'Morales',
    phone: '+639171234011',
    description: 'Wedding dress design and tailoring services in Cavite'
  },
  {
    category: 'Security',
    email: 'security@weddingbazaar.ph',
    password: 'Security2024!',
    businessName: 'Safe Events Security Services',
    firstName: 'Rafael',
    lastName: 'Castillo',
    phone: '+639171234012',
    description: 'Professional security and guest management for Dasmariñas weddings'
  },
  {
    category: 'AV_Equipment',
    email: 'av@weddingbazaar.ph',
    password: 'AVEquipment2024!',
    businessName: 'Pro Sound & Lights',
    firstName: 'Diego',
    lastName: 'Jimenez',
    phone: '+639171234013',
    description: 'Professional audio and lighting equipment for Cavite weddings'
  },
  {
    category: 'Stationery',
    email: 'stationery@weddingbazaar.ph',
    password: 'Stationery2024!',
    businessName: 'Elegant Invitations Studio',
    firstName: 'Elena',
    lastName: 'Navarro',
    phone: '+639171234014',
    description: 'Custom wedding invitations and stationery in Dasmariñas'
  },
  {
    category: 'Transport',
    email: 'transport@weddingbazaar.ph',
    password: 'Transport2024!',
    businessName: 'Luxury Wedding Cars',
    firstName: 'Fernando',
    lastName: 'Alvarez',
    phone: '+639171234015',
    description: 'Luxury car rental and transportation for Cavite weddings'
  }
];

async function createVendorWithFirebaseAuth() {
  console.log('🎯 Creating vendor accounts with Firebase Auth...\n');
  console.log('📊 Total vendors to create: 15 (one per category)\n');

  const createdAccounts = [];
  let successCount = 0;
  let errorCount = 0;

  for (const vendor of vendorAccountsByCategory) {
    console.log(`\n📝 Creating: ${vendor.businessName} (${vendor.category})`);
    console.log(`   Email: ${vendor.email}`);
    console.log(`   Password: ${vendor.password}`);

    try {
      // Step 1: Create Firebase Auth user
      console.log('   🔐 Creating Firebase Auth account...');
      let firebaseUser;
      try {
        firebaseUser = await admin.auth().createUser({
          email: vendor.email,
          password: vendor.password,
          emailVerified: true,
          displayName: `${vendor.firstName} ${vendor.lastName}`
        });
        console.log('   ✅ Firebase Auth created:', firebaseUser.uid);
      } catch (authError) {
        if (authError.code === 'auth/email-already-exists') {
          console.log('   ⚠️  Firebase user exists, fetching existing...');
          firebaseUser = await admin.auth().getUserByEmail(vendor.email);
          console.log('   ✅ Using existing Firebase user:', firebaseUser.uid);
        } else {
          throw authError;
        }
      }

      // Step 2: Create database user entry
      console.log('   💾 Creating database user entry...');
      const hashedPassword = await bcrypt.hash(vendor.password, 10);
      
      const dbUser = await sql`
        INSERT INTO users (
          email,
          password,
          first_name,
          last_name,
          role,
          user_type,
          phone,
          email_verified,
          firebase_uid,
          created_at,
          updated_at
        ) VALUES (
          ${vendor.email},
          ${hashedPassword},
          ${vendor.firstName},
          ${vendor.lastName},
          'vendor',
          'vendor',
          ${vendor.phone},
          true,
          ${firebaseUser.uid},
          NOW(),
          NOW()
        )
        ON CONFLICT (email) DO UPDATE 
        SET 
          firebase_uid = EXCLUDED.firebase_uid,
          updated_at = NOW()
        RETURNING id, email
      `;

      console.log('   ✅ Database user created:', dbUser[0].id);

      // Step 3: Create vendor entry
      console.log('   🏢 Creating vendor entry...');
      const dbVendor = await sql`
        INSERT INTO vendors (
          user_id,
          business_name,
          business_type,
          description,
          location,
          phone,
          email,
          rating,
          is_verified,
          is_featured,
          created_at,
          updated_at
        ) VALUES (
          ${dbUser[0].id},
          ${vendor.businessName},
          ${vendor.category},
          ${vendor.description},
          'Dasmariñas City, Cavite, Philippines',
          ${vendor.phone},
          ${vendor.email},
          4.5,
          true,
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id) DO UPDATE
        SET
          business_name = EXCLUDED.business_name,
          business_type = EXCLUDED.business_type,
          updated_at = NOW()
        RETURNING id, business_name
      `;

      console.log('   ✅ Vendor created:', dbVendor[0].id);

      // Step 4: Create vendor profile
      console.log('   📋 Creating vendor profile...');
      await sql`
        INSERT INTO vendor_profiles (
          vendor_id,
          business_name,
          business_type,
          description,
          contact_email,
          contact_phone,
          service_area,
          years_in_business,
          is_verified,
          created_at,
          updated_at
        ) VALUES (
          ${dbVendor[0].id},
          ${vendor.businessName},
          ${vendor.category},
          ${vendor.description},
          ${vendor.email},
          ${vendor.phone},
          'Dasmariñas City, Cavite, Philippines',
          5,
          true,
          NOW(),
          NOW()
        )
        ON CONFLICT (vendor_id) DO UPDATE
        SET
          business_name = EXCLUDED.business_name,
          business_type = EXCLUDED.business_type,
          updated_at = NOW()
      `;

      console.log('   ✅ Vendor profile created');

      successCount++;
      createdAccounts.push({
        category: vendor.category,
        email: vendor.email,
        password: vendor.password,
        businessName: vendor.businessName,
        firebaseUid: firebaseUser.uid,
        userId: dbUser[0].id,
        vendorId: dbVendor[0].id
      });

      console.log('   🎉 SUCCESS!');

    } catch (error) {
      console.error(`   ❌ Error creating ${vendor.businessName}:`, error.message);
      errorCount++;
    }
  }

  // Summary
  console.log('\n\n✅ Vendor Account Creation Complete!\n');
  console.log('📊 Summary:');
  console.log(`   - Total attempted: 15`);
  console.log(`   - Successful: ${successCount}`);
  console.log(`   - Errors: ${errorCount}`);

  console.log('\n\n🔐 LOGIN CREDENTIALS:\n');
  console.log('=' .repeat(80));
  createdAccounts.forEach(account => {
    console.log(`\n📧 ${account.category}: ${account.businessName}`);
    console.log(`   Email: ${account.email}`);
    console.log(`   Password: ${account.password}`);
    console.log(`   Vendor ID: ${account.vendorId}`);
  });
  console.log('\n' + '='.repeat(80));

  console.log('\n\n📄 Save these credentials to a file:\n');
  const credentialsText = createdAccounts.map(acc => 
    `${acc.category}\nEmail: ${acc.email}\nPassword: ${acc.password}\nBusiness: ${acc.businessName}\nVendor ID: ${acc.vendorId}\n`
  ).join('\n');
  
  const fs = require('fs');
  fs.writeFileSync('VENDOR_LOGIN_CREDENTIALS.txt', credentialsText);
  console.log('✅ Credentials saved to: VENDOR_LOGIN_CREDENTIALS.txt');

  process.exit(0);
}

createVendorWithFirebaseAuth().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
